import { getAuthSession } from "@/lib/nextauth"
import { redirect } from "next/navigation"
import PaymentDetail from "@/components/subscription/PaymentDetail"

interface PaymentDetailPageProps {
  params: {
    clientSecret: string
  }
}

// お支払い詳細ページ
const PaymentDetailPage = async ({ params }: PaymentDetailPageProps) => {
  const { clientSecret } = params

  // 認証情報取得
  const user = await getAuthSession()

  if (!user) {
    redirect("/login")
  }

  return (
    <PaymentDetail
      clientSecret={clientSecret}
      name={user.name!}
      email={user.email!}
    />
  )
}

export default PaymentDetailPage
