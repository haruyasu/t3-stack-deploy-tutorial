"use client"

import { format } from "date-fns"
import { ja } from "date-fns/locale"
import { CheckCircledIcon } from "@radix-ui/react-icons"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import Stripe from "stripe"

interface SuccessProps {
  subscriptions: Stripe.Subscription[]
}

// お支払い成功
const Success = ({ subscriptions }: SuccessProps) => {
  return (
    <div>
      <div className="flex flex-col items-center justify-center space-y-5 mb-10">
        <CheckCircledIcon width={50} height={50} className="text-green-500" />
        <div className="font-bold text-xl">お支払いが完了しました</div>
      </div>

      {subscriptions.map((subscription) => {
        const current_period_start = new Date(
          subscription.current_period_start * 1000
        )
        const current_period_end = new Date(
          subscription.current_period_end * 1000
        )

        return (
          <div key={subscription.id} className="mb-5">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-center">お支払いNo</TableHead>
                  <TableHead className="text-center">開始日</TableHead>
                  <TableHead className="text-center">終了日</TableHead>
                  <TableHead className="text-center">料金</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="text-center">
                    {subscription.id}
                  </TableCell>
                  <TableCell className="text-center">
                    {format(current_period_start, "yyyy年MM月dd日 HH:MM", {
                      locale: ja,
                    })}
                  </TableCell>
                  <TableCell className="text-center">
                    {format(current_period_end, "yyyy年MM月dd日 HH:MM", {
                      locale: ja,
                    })}
                  </TableCell>
                  <TableCell className="text-center">
                    {subscription.items.data[0].price.unit_amount}円
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        )
      })}
    </div>
  )
}

export default Success
