import { trpc } from "@/trpc/client"
import { userPostPerPage } from "@/lib/utils"
import AuthorDetail from "@/components/author/AuthorDetail"

interface AuthorPageProps {
  params: {
    userId: string
  }
  searchParams: {
    [key: string]: string | undefined
  }
}

// ユーザー投稿詳細ページ
const AuthorDetailPage = async ({ params, searchParams }: AuthorPageProps) => {
  const { userId } = params
  const { page, perPage } = searchParams

  const limit =
    typeof perPage === "string" ? parseInt(perPage) : userPostPerPage
  const offset = typeof page === "string" ? (parseInt(page) - 1) * limit : 0

  // ユーザー投稿詳細取得
  const { user, totalPosts } = await trpc.user.getUserByIdPost({
    userId,
    limit,
    offset,
  })

  if (!user) {
    return <div className="text-center">ユーザーは存在しません</div>
  }

  const pageCount = Math.ceil(totalPosts / limit)

  return (
    <AuthorDetail user={user} pageCount={pageCount} totalPosts={totalPosts} />
  )
}

export default AuthorDetailPage
