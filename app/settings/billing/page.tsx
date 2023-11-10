import { redirect } from "next/navigation"
import { getAuthSession } from "@/lib/nextauth"
import { getSubscription } from "@/actions/subscription"
import Billing from "@/components/settings/Billing"

// 定期購入管理ページ
const BillingPage = async () => {
  // 認証情報取得
  const user = await getAuthSession()

  if (!user) {
    redirect("/login")
  }

  // サブスクリプション有効チェック
  const { subscription, isSubscribed } = await getSubscription({
    userId: user.id,
  })

  return <Billing subscription={subscription} isSubscribed={isSubscribed} />
}

export default BillingPage
