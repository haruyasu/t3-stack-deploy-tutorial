"use client"

import { useRouter } from "next/navigation"
import { z } from "zod"
import { useForm, SubmitHandler } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { trpc } from "@/trpc/react"
import { Loader2 } from "lucide-react"
import toast from "react-hot-toast"
import Link from "next/link"

// 入力データの検証ルールを定義
const schema = z.object({
  content: z.string().min(3, { message: "3文字以上入力する必要があります。" }),
})

// 入力データの型を定義
type InputType = z.infer<typeof schema>

interface CommentNewProps {
  userId?: string
  postId: string
}

// 新規コメント
const CommentNew = ({ userId, postId }: CommentNewProps) => {
  const router = useRouter()

  // フォームの状態
  const form = useForm<InputType>({
    // 入力値の検証
    resolver: zodResolver(schema),
    // 初期値
    defaultValues: {
      content: "",
    },
  })

  // 新規コメント
  const { mutate: createComment, isLoading } =
    trpc.comment.createComment.useMutation({
      onSuccess: () => {
        toast.success("コメントを投稿しました")
        form.reset()
        router.refresh()
      },
      onError: (error) => {
        toast.error("コメントの投稿に失敗しました")
        console.error(error)
      },
    })

  // 送信
  const onSubmit: SubmitHandler<InputType> = (data) => {
    // 新規コメント
    createComment({
      postId,
      content: data.content,
    })
  }

  return (
    <div className="border rounded-md p-2 sm:p-5 bg-gray-50">
      <div className="text-sm font-bold mb-2 sm:mb-5">コメントする</div>
      {userId ? (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Textarea
                      placeholder="コメントしてください"
                      className="bg-white"
                      {...field}
                      rows={5}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button disabled={isLoading} type="submit" className="w-full">
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              投稿
            </Button>
          </form>
        </Form>
      ) : (
        <div className="text-center text-sm text-gray-500 my-10">
          コメントするには
          <Link href="/login" className="underline text-sky-500">
            ログイン
          </Link>
          してください
        </div>
      )}
    </div>
  )
}

export default CommentNew
