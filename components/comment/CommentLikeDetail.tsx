"use client"

import { Comment, CommentLike, User } from "@prisma/client"
import { HeartIcon, HeartFilledIcon } from "@radix-ui/react-icons"
import { useState } from "react"
import { trpc } from "@/trpc/react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"

interface CommentLikeDetailProps {
  comment: Comment & { user: Pick<User, "id" | "name" | "image"> } & {
    hasLiked: boolean
    commentLikeId: string | null
  } & { likes: CommentLike[] }
  userId?: string
}

// いいね詳細
const CommentLikeDetail = ({ comment, userId }: CommentLikeDetailProps) => {
  const router = useRouter()
  const [hasLiked, setHasLiked] = useState<boolean>(comment.hasLiked)
  const [likeCount, setLikeCount] = useState<number>(comment.likes.length)

  // いいね追加
  const { mutate: createCommentLike, isLoading: createCommentLikeLoading } =
    trpc.comment.createCommentLike.useMutation({
      onSuccess: () => {
        router.refresh()
      },
      onError: (error) => {
        console.error(error)
        // いいねをロールバック
        if (likeCount > 0) {
          setHasLiked(false)
          setLikeCount(likeCount - 1)
        }
      },
    })

  // いいね削除
  const { mutate: deleteCommentLike, isLoading: deleteCommentLikeLoading } =
    trpc.comment.deleteCommentLike.useMutation({
      onSuccess: () => {
        router.refresh()
      },
      onError: (error) => {
        console.error(error)
        // いいねをロールバック
        setHasLiked(true)
        setLikeCount(likeCount + 1)
      },
    })

  const handleCreateCommentLike = () => {
    // すぐにUI更新
    setHasLiked(true)
    setLikeCount(likeCount + 1)

    // いいね追加
    createCommentLike({
      commentId: comment.id,
    })
  }

  const handleDeleteCommentLike = () => {
    if (!comment.commentLikeId) {
      return
    }

    // すぐにUI更新
    if (likeCount > 0) {
      setHasLiked(false)
      setLikeCount(likeCount - 1)
    }

    // いいね削除
    deleteCommentLike({
      commentLikeId: comment.commentLikeId,
    })
  }

  return (
    <div className="flex items-center">
      {hasLiked ? (
        <button
          className="hover:bg-gray-100 p-2 rounded-full"
          disabled={createCommentLikeLoading || deleteCommentLikeLoading}
          onClick={handleDeleteCommentLike}
        >
          <HeartFilledIcon className="w-5 h-5 text-pink-500" />
        </button>
      ) : (
        <button
          className={cn("p-2", userId && "hover:bg-gray-100 rounded-full")}
          disabled={
            !userId || createCommentLikeLoading || deleteCommentLikeLoading
          }
          onClick={handleCreateCommentLike}
        >
          <HeartIcon className="w-5 h-5" />
        </button>
      )}
      {likeCount > 0 && <div className="pr-1">{likeCount}</div>}
    </div>
  )
}

export default CommentLikeDetail
