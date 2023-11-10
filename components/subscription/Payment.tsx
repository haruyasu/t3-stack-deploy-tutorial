"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { trpc } from "@/trpc/react"
import Stripe from "stripe"
import toast from "react-hot-toast"

interface PaymentProps {
  prices: Stripe.Price[]
}

// 商品選択
const Payment = ({ prices }: PaymentProps) => {
  const router = useRouter()

  // クライアントシークレット取得
  const { mutate: getClientSecret, isLoading } =
    trpc.subscription.getClientSecret.useMutation({
      onSuccess: ({ clientSecret }) => {
        // 決済入力画面に遷移
        router.push(`/payment/${clientSecret}`)
      },

      onError: (error) => {
        toast.error("申し込みに失敗しました")
        console.error(error)
      },
    })

  // 申し込むボタンクリック
  const handlePayment = (priceId: string) => {
    getClientSecret({
      priceId,
    })
  }

  return (
    <div>
      <div className="text-2xl font-bold text-center mb-10">有料会員に登録</div>

      <div className="max-w-[500px] m-auto">
        {prices.map((price) => {
          return (
            <div
              key={price.id}
              className="border rounded-md px-5 py-10 space-y-5"
            >
              <div className="text-2xl text-center font-bold">
                {(price.product as Stripe.Product).name}
              </div>

              <div className="flex items-end justify-center space-x-1">
                <div className="font-bold text-3xl">
                  {price.unit_amount!.toLocaleString()}
                </div>
                <div>円/月 (税込)</div>
              </div>

              <Button
                className="w-full"
                variant="premium"
                onClick={() => handlePayment(price.id)}
                disabled={isLoading}
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                申し込む
              </Button>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default Payment
