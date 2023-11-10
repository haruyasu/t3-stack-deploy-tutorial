"use client"

import { Comment, User, CommentLike } from "@prisma/client"
import { format } from "date-fns"
import { useRouter } from "next/navigation"
import { Pencil, Trash2 } from "lucide-react"
import { trpc } from "@/trpc/react"
import CommentLikeDetail from "@/components/comment/CommentLikeDetail"
import Link from "next/link"
import toast from "react-hot-toast"
import Image from "next/image"

interface CommentItemProps {
  comment: Comment & { user: Pick<User, "id" | "name" | "image"> } & {
    hasLiked: boolean
    commentLikeId: string | null
  } & { likes: CommentLike[] }
  userId?: string
}

// コメント一覧のアイテム
const CommentItem = ({ comment, userId }: CommentItemProps) => {
  const router = useRouter()

  // コメント削除
  const { mutate: deleteComment, isLoading } =
    trpc.comment.deleteComment.useMutation({
      onSuccess: () => {
        toast.success("コメントを削除しました")
        router.refresh()
      },
      onError: (error) => {
        toast.error("コメントの削除に失敗しました")
        console.error(error)
      },
    })

  const handleDeleteComment = () => {
    // コメント削除
    deleteComment({
      commentId: comment.id,
    })
  }

  return (
    <div>
      <div className="flex items-center justify-between p-2 sm:p-5 border-b">
        <Link href={`/author/${comment.user.id}`}>
          <div className="flex items-center space-x-1">
            <div className="relative w-6 h-6 flex-shrink-0">
              <Image
                src={comment.user.image || "/default.png"}
                className="rounded-full object-cover"
                alt={comment.user.name || "avatar"}
                fill
              />
            </div>
            <div className="text-sm hover:underline">{comment.user.name}</div>
          </div>
        </Link>

        <div className="text-sm">
          {format(new Date(comment.updatedAt), "yyyy/MM/dd HH:mm")}
        </div>
      </div>

      <div className="p-2 sm:p-5 leading-relaxed break-words whitespace-pre-wrap">
        <div>{comment.content}</div>
      </div>

      <div className="flex items-center justify-end space-x-1 pr-1 pb-1">
        <CommentLikeDetail comment={comment} userId={userId} />

        {userId === comment.user.id && (
          <>
            <Link href={`/comment/${comment.id}/edit`}>
              <div className="hover:bg-gray-100 p-2 rounded-full">
                <Pencil className="w-5 h-5" />
              </div>
            </Link>

            <button
              className="hover:bg-gray-100 p-2 rounded-full"
              disabled={isLoading}
              onClick={handleDeleteComment}
            >
              <Trash2 className="w-5 h-5 text-red-500" />
            </button>
          </>
        )}
      </div>
    </div>
  )
}

export default CommentItem
