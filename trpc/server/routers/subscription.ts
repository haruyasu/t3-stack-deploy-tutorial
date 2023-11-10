import { publicProcedure, privateProcedure, router } from "@/trpc/server/trpc"
import { z } from "zod"
import { TRPCError } from "@trpc/server"
import { stripe } from "@/lib/stripe"
import { getSubscription, updateSubscription } from "@/actions/subscription"
import prisma from "@/lib/prisma"
import Stripe from "stripe"

interface CustomInvoice extends Stripe.Invoice {
  payment_intent: Stripe.PaymentIntent
}

interface CustomSubscription extends Stripe.Subscription {
  latest_invoice: CustomInvoice
}

export const subscriptionRouter = router({
  // 商品リスト取得
  getPrices: privateProcedure.query(async () => {
    try {
      // Stripeに登録した商品情報を取得
      const prices = await stripe.prices.list({
        // 検索キーを指定
        lookup_keys: ["monthly"],
        expand: ["data.product"],
      })

      return prices.data
    } catch (error) {
      console.log(error)
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "エラーが発生しました。",
      })
    }
  }),

  // クライアントシークレット取得
  getClientSecret: privateProcedure
    .input(
      z.object({
        priceId: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const { priceId } = input
        const userId = ctx.user.id
        const name = ctx.user.name!
        const email = ctx.user.email!

        // サブスクリプション情報を取得
        const { subscription } = await getSubscription({
          userId,
        })

        let customerId

        // サブスクリプション情報チェック
        if (subscription) {
          // 顧客ID取得
          customerId = subscription.customerId
        } else {
          // 顧客ID作成
          const customer = await stripe.customers.create({
            name,
            email,
            metadata: {
              userId,
            },
          })

          customerId = customer.id

          // 顧客ID保存
          await prisma.subscription.create({
            data: {
              userId,
              customerId,
            },
          })
        }

        let clientSecret

        if (subscription?.status === "incomplete") {
          // 未完了のサブスクリプションが存在する場合、そのサブスクリプションを取得
          const subscriptions = await stripe.subscriptions.retrieve(
            subscription.subscriptionId!
          )

          // サブスクリプションの最新の請求書を取得
          const invoice = await stripe.invoices.retrieve(
            subscriptions.latest_invoice as string
          )

          // PaymentIntentオブジェクトを取得
          const paymentIntent = await stripe.paymentIntents.retrieve(
            invoice.payment_intent as string
          )

          // PaymentIntentオブジェクトからclient_secretを取得
          clientSecret = paymentIntent.client_secret
        } else {
          // 未完了のサブスクリプションが存在しない場合、新しいサブスクリプションを作成
          const subscriptions = (await stripe.subscriptions.create({
            customer: customerId,
            items: [
              {
                price: priceId,
              },
            ],
            payment_behavior: "default_incomplete",
            expand: ["latest_invoice.payment_intent"],
            metadata: {
              userId,
            },
          })) as CustomSubscription

          // サブスクリプション更新
          await updateSubscription({
            subscription: subscriptions,
          })

          // 新しいサブスクリプションからクライアントシークレットを取得
          clientSecret =
            subscriptions.latest_invoice.payment_intent.client_secret
        }

        if (!clientSecret) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "クライアントシークレットが取得できませんでした",
          })
        }

        return { clientSecret }
      } catch (error) {
        console.log(error)

        if (error instanceof TRPCError && error.code === "BAD_REQUEST") {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: error.message,
          })
        } else {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "エラーが発生しました",
          })
        }
      }
    }),

  // サブスクリプション情報取得
  getSubscriptionInfo: privateProcedure.query(async ({ ctx }) => {
    try {
      const userId = ctx.user.id

      // サブスクリプション情報を取得
      const { subscription } = await getSubscription({ userId })

      // サブスクリプション情報チェック
      if (!subscription) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "サブスクリプションが取得できませんでした",
        })
      }

      // サブスクリプション情報を取得
      const subscriptions = await stripe.subscriptions.list({
        customer: subscription.customerId,
        status: "active",
        expand: ["data.default_payment_method"],
      })

      return subscriptions
    } catch (error) {
      console.log(error)

      if (error instanceof TRPCError && error.code === "BAD_REQUEST") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: error.message,
        })
      } else {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "エラーが発生しました",
        })
      }
    }
  }),

  // カスタマーポータルURL取得
  getBillingPortalUrl: privateProcedure.mutation(async ({ ctx }) => {
    try {
      const userId = ctx.user.id

      // ユーザーのサブスクリプション情報を取得
      const { subscription } = await getSubscription({ userId })

      // サブスクリプションが存在しない場合
      if (!subscription) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "サブスクリプションが取得できませんでした",
        })
      }

      // カスタマーポータルセッションを作成
      const billingPortal = await stripe.billingPortal.sessions.create({
        customer: subscription.customerId,
        return_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings/billing`,
      })

      return { url: billingPortal.url }
    } catch (error) {
      console.log(error)
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "エラーが発生しました",
      })
    }
  }),
})
