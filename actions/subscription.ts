import prisma from "@/lib/prisma"
import Stripe from "stripe"

// 86400000 = 1日のミリ秒数
const DAY_IN_MS = 86_400_000

// サブスクリプション取得
export const getSubscription = async ({
  userId,
}: {
  userId: string | undefined
}) => {
  try {
    if (!userId) {
      return {
        subscription: null,
        isSubscribed: false,
      }
    }

    // サブスクリプション情報を取得
    const subscription = await prisma.subscription.findUnique({
      where: {
        userId,
      },
    })

    // サブスクリプション情報がない場合
    if (!subscription) {
      return {
        subscription: null,
        isSubscribed: false,
      }
    }

    // サブスクリプションの有効期限をチェック
    const isSubscribed =
      subscription.status == "active" &&
      subscription.currentPeriodEnd?.getTime()! + DAY_IN_MS > Date.now()

    return {
      subscription,
      isSubscribed,
    }
  } catch (error) {
    console.error(error)
    return {
      subscription: null,
      isSubscribed: false,
    }
  }
}

// サブスクリプション情報を更新
export const updateSubscription = async ({
  subscription,
}: {
  subscription: Stripe.Subscription
}) => {
  try {
    await prisma.subscription.update({
      where: {
        customerId: subscription.customer as string,
      },
      data: {
        status: subscription.status,
        subscriptionId: subscription.id,
        priceId: subscription.items.data[0].price.id,
        currentPeriodStart: new Date(subscription.current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
      },
    })
  } catch (error) {
    console.error(error)
  }
}
