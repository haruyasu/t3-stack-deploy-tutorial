"use client"

import { Post } from "@prisma/client"
import { format } from "date-fns"
import Image from "next/image"
import Link from "next/link"

interface AuthorPostItemProps {
  post: Post
}

// 投稿一覧のアイテム
const AuthorPostItem = ({ post }: AuthorPostItemProps) => {
  return (
    <div className="border rounded-md relative">
      <Link href={`/post/${post.id}`} className="flex-grow">
        {post.premium && (
          <div className="absolute top-0 z-10 bg-gradient-radial from-blue-500 to-sky-500 rounded-md text-white font-semibold px-3 py-1 text-xs">
            有料会員限定
          </div>
        )}

        <div className="aspect-[16/9] relative overflow-hidden rounded-t-md">
          <Image
            fill
            src={post.image || "/noImage.png"}
            alt="thumbnail"
            className="object-cover rounded-t-md transition-all hover:scale-105"
          />
        </div>

        <div className="px-3 pt-3">
          <div className="font-bold hover:underline">{post.title}</div>
        </div>
      </Link>

      <div className="p-3 text-sm text-gray-500">
        {format(new Date(post.updatedAt), "yyyy/MM/dd HH:mm")}
      </div>
    </div>
  )
}

export default AuthorPostItem
