import { useState } from 'react'
import { Heart, MessageCircle } from 'lucide-react'
import { useMyPosts } from '@/hooks/social/useMyPosts'
import { usePostComments } from '@/hooks/social/usePostComments'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { Post } from '@/types/social'

const EngagementPage = () => {
  const { data: posts, isLoading } = useMyPosts()
  const [selected, setSelected] = useState<Post | null>(null)

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Engagement</h1>
        <p className="text-muted-foreground text-sm">Likes et commentaires reçus sur vos publications</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Spinner className="size-6" />
        </div>
      ) : !posts?.length ? (
        <p className="text-muted-foreground text-sm py-8 text-center">Aucune publication pour le moment.</p>
      ) : (
        <div className="space-y-3">
          {posts.map((post) => (
            <Card key={post.id} className="cursor-pointer hover:ring-primary/40" onClick={() => setSelected(post)}>
              <CardHeader>
                <CardTitle className="text-base">{post.property?.name}</CardTitle>
              </CardHeader>
              <CardContent className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Heart className="size-4" /> {post.likes_count}
                </span>
                <span className="flex items-center gap-1">
                  <MessageCircle className="size-4" /> {post.comments_count}
                </span>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <CommentsDialog post={selected} onClose={() => setSelected(null)} />
    </div>
  )
}

function CommentsDialog({ post, onClose }: { post: Post | null; onClose: () => void }) {
  const { data: comments, isLoading } = usePostComments(post?.id ?? NaN)

  return (
    <Dialog open={!!post} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{post?.property?.name} — commentaires</DialogTitle>
        </DialogHeader>
        {isLoading ? (
          <Spinner className="size-5 mx-auto" />
        ) : !comments?.length ? (
          <p className="text-sm text-muted-foreground">Aucun commentaire.</p>
        ) : (
          <div className="space-y-3">
            {comments.map((comment) => (
              <div key={comment.id} className="space-y-1">
                <p className="text-sm">
                  <span className="font-medium">{comment.user?.name}</span> {comment.content}
                </p>
                {comment.replies.length > 0 && (
                  <div className="pl-4 space-y-1 border-l">
                    {comment.replies.map((reply) => (
                      <p key={reply.id} className="text-sm text-muted-foreground">
                        <span className="font-medium">{reply.user?.name}</span> {reply.content}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default EngagementPage
