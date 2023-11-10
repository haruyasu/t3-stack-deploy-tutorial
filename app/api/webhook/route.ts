import { headers } from "next/headers"
import { NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"
import { updateSubscription } from "@/actions/subscription"
import Stripe from "stripe"

export async function POST(req: Request) {
  // リクエストのボディをテキストとして取得
  const body = await req.text()

  // Stripeのシグネチャをヘッダーから取得
  const signature = headers().get("Stripe-Signature") as string

  let event: Stripe.Event

  // StripeのWebhookシグネチャを検証
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (error: any) {
    // シグネチャの検証に失敗した場合
    return new NextResponse(`Webhookにエラーが発生しました: ${error.message}`, {
      status: 400,
    })
  }

  // イベントデータからセッション情報を取得
  const session = event.data.object as Stripe.Checkout.Session

  let subscription: Stripe.Subscription

  // イベントタイプに応じて異なる処理を実行
  switch (event.type) {
    // 最初の支払いが成功したとき
    case "checkout.session.completed":
    // 定期的な支払いが成功したとき
    case "invoice.payment_succeeded":
      // Stripeからサブスクリプションの詳細を取得
      subscription = await stripe.subscriptions.retrieve(
        session.subscription as string
      )

      // サブスクリプション更新
      await updateSubscription({
        subscription,
      })

      break

    // サブスクリプションの詳細が更新されたとき
    case "customer.subscription.updated":
      // Stripeからサブスクリプションの詳細を取得
      subscription = await stripe.subscriptions.retrieve(session.id as string)

      // サブスクリプション更新
      await updateSubscription({
        subscription,
      })

      break
  }

  return new NextResponse("OK", { status: 200 })
}
