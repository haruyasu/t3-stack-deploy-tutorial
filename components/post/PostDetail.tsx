"use client"

import { Post, User, Comment, CommentLike } from "@prisma/client"
import { format } from "date-fns"
import { useRouter } from "next/navigation"
import { Pencil, Trash2 } from "lucide-react"
import { trpc } from "@/trpc/react"
import Image from "next/image"
import Link from "next/link"
import toast from "react-hot-toast"
import CommentDetail from "@/components/comment/CommentDetail"

interface PostDetailProps {
  post: Post & {
    user: Pick<User, "id" | "name" | "image">
  }
  userId?: string
  comments: (Comment & { user: Pick<User, "id" | "name" | "image"> } & {
    hasLiked: boolean
    commentLikeId: string | null
  } & { likes: CommentLike[] })[]
  pageCount: number
  totalComments: number
  isSubscribed: boolean
}

// 投稿詳細
const PostDetail = ({
  post,
  userId,
  comments,
  pageCount,
  totalComments,
  isSubscribed,
}: PostDetailProps) => {
  const router = useRouter()

  // 表示内容判定
  const isSubscribedPost =
    post.premium && !isSubscribed && post.userId !== userId

  // 投稿内容を200文字に制限
  const content =
    isSubscribedPost && post.content.length > 200
      ? post.content.slice(0, 200) + "..."
      : post.content

  // 投稿削除
  const { mutate: deletePost, isLoading } = trpc.post.deletePost.useMutation({
    onSuccess: () => {
      toast.success("投稿を削除しました")
      router.refresh()
      router.push(`/`)
    },
    onError: (error) => {
      toast.error(error.message)
      console.error(error)
    },
  })

  // 削除ボタンクリック時の処理
  const handleDeletePost = () => {
    if (post.user.id !== userId) {
      toast.error("投稿は削除できません")
      return
    }

    // 投稿削除
    deletePost({
      postId: post.id,
    })
  }

  return (
    <div className="space-y-5">
      {post.premium && (
        <div className="bg-gradient-radial from-blue-500 to-sky-500 rounded-md text-white font-semibold px-3 py-1 text-xs inline-block">
          有料会員限定
        </div>
      )}

      <div className="font-bold text-2xl break-words">{post.title}</div>
      <div>
        <Link href={`/author/${post.user.id}`}>
          <div className="flex items-center space-x-1">
            <div className="relative w-6 h-6 flex-shrink-0">
              <Image
                src={post.user.image || "/default.png"}
                className="rounded-full object-cover"
                alt={post.user.name || "avatar"}
                fill
              />
            </div>
            <div className="text-sm hover:underline break-words min-w-0">
              {post.user.name} |{" "}
              {format(new Date(post.updatedAt), "yyyy/MM/dd HH:mm")}
            </div>
          </div>
        </Link>
      </div>

      <div className="aspect-[16/9] relative">
        <Image
          fill
          src={post.image || "/noImage.png"}
          alt="thumbnail"
          className="object-cover rounded-md"
        />
      </div>

      <div className="leading-relaxed break-words whitespace-pre-wrap">
        {content}
      </div>

      {userId === post.user.id && (
        <div className="flex items-center justify-end space-x-1">
          <Link href={`/post/${post.id}/edit`}>
            <div className="hover:bg-gray-100 p-2 rounded-full">
              <Pencil className="w-5 h-5" />
            </div>
          </Link>
          <button
            className="hover:bg-gray-100 p-2 rounded-full"
            disabled={isLoading}
            onClick={handleDeletePost}
          >
            <Trash2 className="w-5 h-5 text-red-500" />
          </button>
        </div>
      )}

      {isSubscribedPost && (
        <div className="bg-gradient-radial from-blue-500 to-sky-500 text-white rounded-md p-5 sm:p-10 text-center space-y-5">
          <div>この記事の続きは有料会員になるとお読みいただけます。</div>

          <div className="inline-block">
            {userId ? (
              <Link href="/payment">
                <div className="w-[300px] bg-white text-blue-500 hover:bg-white/90 font-bold shadow rounded-md py-2">
                  有料プランをみる
                </div>
              </Link>
            ) : (
              <Link href="/login">
                <div className="w-[300px] bg-white text-blue-500 hover:bg-white/90 font-bold shadow rounded-md py-2">
                  ログインする
                </div>
              </Link>
            )}
          </div>

          <div className="text-xs">※いつでも解約可能です</div>
          <div className="font-bold">有料会員特典</div>
          <div className="text-sm">有料記事が読み放題</div>
        </div>
      )}

      <CommentDetail
        userId={userId}
        postId={post.id}
        comments={comments}
        pageCount={pageCount}
        totalComments={totalComments}
      />
    </div>
  )
}

export default PostDetail
