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
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Comment } from "@prisma/client"
import { trpc } from "@/trpc/react"
import { Loader2 } from "lucide-react"
import toast from "react-hot-toast"

// 入力データの検証ルールを定義
const schema = z.object({
  content: z.string().min(3, { message: "3文字以上入力する必要があります。" }),
})

// 入力データの型を定義
type InputType = z.infer<typeof schema>

interface CommentEditProps {
  comment: Comment
}

// コメント編集
const CommentEdit = ({ comment }: CommentEditProps) => {
  const router = useRouter()

  // フォームの状態
  const form = useForm<InputType>({
    // 入力値の検証
    resolver: zodResolver(schema),
    // 初期値
    defaultValues: {
      content: comment.content || "",
    },
  })

  // コメント編集
  const { mutate: updateComment, isLoading } =
    trpc.comment.updateComment.useMutation({
      onSuccess: ({ postId }) => {
        toast.success("コメントを編集しました")
        router.refresh()
        router.push(`/post/${postId}`)
      },
      onError: (error) => {
        toast.error("コメントの編集に失敗しました")
        console.error(error)
      },
    })

  // 送信
  const onSubmit: SubmitHandler<InputType> = (data) => {
    // コメント編集
    updateComment({
      commentId: comment.id,
      content: data.content,
    })
  }

  return (
    <div>
      <div className="text-2xl font-bold text-center mb-5">コメント編集</div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem>
                <FormLabel>コメント</FormLabel>
                <FormControl>
                  <Textarea placeholder="コメントの内容" {...field} rows={10} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button disabled={isLoading} type="submit" className="w-full">
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            編集
          </Button>
        </form>
      </Form>
    </div>
  )
}

export default CommentEdit
