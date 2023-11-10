import { getAuthSession } from "@/lib/nextauth"
import { redirect } from "next/navigation"
import { trpc } from "@/trpc/client"
import { getSubscription } from "@/actions/subscription"
import Payment from "@/components/subscription/Payment"

// 商品選択ページ
const PaymentPage = async () => {
  // 認証情報取得
  const user = await getAuthSession()

  if (!user) {
    redirect("/login")
  }

  // サブスクリプション有効チェック
  const { isSubscribed } = await getSubscription({
    userId: user?.id,
  })

  if (isSubscribed) {
    redirect("/settings/billing")
  }

  // 商品リスト取得
  const prices = await trpc.subscription.getPrices()

  return <Payment prices={prices} />
}

export default PaymentPage
