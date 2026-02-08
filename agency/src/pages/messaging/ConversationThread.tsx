import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Send } from 'lucide-react'
import { useMessages } from '@/hooks/messaging/useMessages'
import { useSendMessage } from '@/hooks/messaging/useSendMessage'
import { useMarkConversationRead } from '@/hooks/messaging/useMarkConversationRead'
import { useAuthStore } from '@/store/auth.store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'
import { cn } from '@/lib/utils'

const ConversationThread = () => {
  const { id } = useParams()
  const conversationId = Number(id)
  const { data: messagesPage, isLoading } = useMessages(conversationId)
  const sendMessage = useSendMessage(conversationId)
  const markRead = useMarkConversationRead(conversationId)
  const userId = useAuthStore((s) => s.user?.id)
  const [content, setContent] = useState('')

  useEffect(() => {
    if (Number.isFinite(conversationId)) markRead.mutate()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId])

  const messages = messagesPage?.data ?? []
  // API returns newest-first; render oldest-first for a natural reading order.
  const ordered = [...messages].reverse()

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim()) return
    sendMessage.mutate(content, { onSuccess: () => setContent('') })
  }

  return (
    <div className="max-w-2xl mx-auto p-6 flex flex-col h-[calc(100vh-56px)]">
      <Link to="/messages" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4">
        <ArrowLeft className="size-4" /> Retour aux conversations
      </Link>

      <div className="flex-1 overflow-y-auto space-y-2 pb-4">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Spinner className="size-6" />
          </div>
        ) : (
          ordered.map((message) => {
            const isMine = message.sender?.id === userId
            return (
              <div key={message.id} className={cn('flex', isMine ? 'justify-end' : 'justify-start')}>
                <div
                  className={cn(
                    'max-w-[75%] rounded-lg px-3 py-2 text-sm',
                    isMine ? 'bg-primary text-primary-foreground' : 'bg-muted'
                  )}
                >
                  {message.content}
                </div>
              </div>
            )
          })
        )}
      </div>

      <form onSubmit={onSubmit} className="flex gap-2 border-t pt-4">
        <Input
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Écrire un message..."
          disabled={sendMessage.isPending}
        />
        <Button type="submit" disabled={sendMessage.isPending || !content.trim()}>
          <Send className="size-4" />
        </Button>
      </form>
    </div>
  )
}

export default ConversationThread
