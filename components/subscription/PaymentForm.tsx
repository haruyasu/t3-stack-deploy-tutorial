"use client"

import { useStripe, useElements, PaymentElement } from "@stripe/react-stripe-js"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"

interface PaymentFormProps {
  name: string
  email: string
}

// お支払いフォーム
const PaymentForm = ({ name, email }: PaymentFormProps) => {
  const router = useRouter()
  const stripe = useStripe()
  const elements = useElements()
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)

  // 送信
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    // Stripeが読み込まれているか確認
    if (!stripe || !elements) {
      return
    }

    setLoading(true)

    // 決済を確定
    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${process.env.NEXT_PUBLIC_APP_URL}/success`,
      },
    })

    router.refresh()

    // エラーがあればメッセージを表示
    if (error.type === "card_error" || error.type === "validation_error") {
      setMessage(
        error.message || "エラーが発生しました。内容をご確認ください。"
      )
    } else {
      setMessage("エラーが発生しました。内容をご確認ください。")
    }

    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <PaymentElement
        options={{
          defaultValues: {
            billingDetails: {
              name,
              email,
            },
          },
          layout: "tabs",
        }}
      />

      <Button disabled={loading || !stripe || !elements} className="w-full">
        {loading ||
          !stripe ||
          (!elements && <Loader2 className="mr-2 h-4 w-4 animate-spin" />)}
        決済する
      </Button>

      {message && <div className="text-center text-red-500">{message}</div>}
    </form>
  )
}

export default PaymentForm
