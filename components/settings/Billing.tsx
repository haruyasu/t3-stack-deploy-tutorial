"use client"

import { Button } from "@/components/ui/button"
import { Subscription } from "@prisma/client"
import { Loader2 } from "lucide-react"
import { trpc } from "@/trpc/react"
import { format } from "date-fns"
import toast from "react-hot-toast"

interface BillingProps {
  subscription: Subscription | null
  isSubscribed: boolean
}

// 定期購入管理
const Billing = ({ subscription, isSubscribed }: BillingProps) => {
  // カスタマーポータルURL取得
  const { mutate: getBillingPortalUrl, isLoading } =
    trpc.subscription.getBillingPortalUrl.useMutation({
      onSuccess: ({ url }) => {
        // カスタマーポータルに遷移
        window.location.href = url
      },
      onError: (error) => {
        toast.error("定期購入の管理取得に失敗しました")
        console.error(error)
      },
    })

  // 定期購入の管理ボタンクリック
  const handleBillingPortal = () => {
    getBillingPortalUrl()
  }

  return (
    <div className="space-y-5">
      <div className="text-xl font-bold text-center">現在のプラン</div>
      <div>
        あなたは現在<strong>{isSubscribed ? "月額" : "無料"}</strong>
        プランを利用しています。
      </div>

      {isSubscribed && subscription && (
        <div>
          {subscription?.cancelAtPeriodEnd
            ? `プランは${format(
                new Date(subscription.currentPeriodEnd!),
                "yyyy年MM月dd日 HH:mm"
              )}にキャンセルされます。`
            : `プランは${format(
                new Date(subscription.currentPeriodEnd!),
                "yyyy年MM月dd日 HH:mm"
              )}に更新されます。`}
        </div>
      )}

      <Button
        className="w-full"
        onClick={handleBillingPortal}
        disabled={isLoading || !isSubscribed}
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        定期購入の管理
      </Button>
    </div>
  )
}

export default Billing
