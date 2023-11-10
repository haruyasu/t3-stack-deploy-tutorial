import { trpc } from "@/trpc/client"
import { getAuthSession } from "@/lib/nextauth"
import { commentPerPage } from "@/lib/utils"
import { getSubscription } from "@/actions/subscription"
import PostDetail from "@/components/post/PostDetail"

interface PostDetailPageProps {
  params: {
    postId: string
  }
  searchParams: {
    [key: string]: string | undefined
  }
}

// 投稿詳細ページ
const PostDetailPage = async ({
  params,
  searchParams,
}: PostDetailPageProps) => {
  const { postId } = params
  const { page, perPage } = searchParams

  const limit = typeof perPage === "string" ? parseInt(perPage) : commentPerPage
  const offset = typeof page === "string" ? (parseInt(page) - 1) * limit : 0

  // 認証情報取得
  const user = await getAuthSession()

  // 投稿詳細取得
  const post = await trpc.post.getPostById({ postId })

  if (!post) {
    return (
      <div className="text-center text-sm text-gray-500">投稿はありません</div>
    )
  }

  // サブスクリプション有効チェック
  const { isSubscribed } = await getSubscription({
    userId: user?.id,
  })

  // コメント一覧取得
  const { comments, totalComments } = await trpc.comment.getComments({
    userId: user?.id,
    postId,
    limit,
    offset,
  })

  const pageCount = Math.ceil(totalComments / limit)

  return (
    <PostDetail
      post={post}
      userId={user?.id}
      comments={comments}
      pageCount={pageCount}
      totalComments={totalComments}
      isSubscribed={isSubscribed}
    />
  )
}

export default PostDetailPage
