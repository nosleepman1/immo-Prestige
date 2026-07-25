import { Link } from 'react-router-dom'
import { useConversations } from '@/hooks/messaging/useConversations'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Spinner } from '@/components/ui/spinner'

const ConversationsList = () => {
  const { data: conversations, isLoading } = useConversations()

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Messagerie</h1>
        <p className="text-muted-foreground text-sm">Échanges avec vos clients</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Spinner className="size-6" />
        </div>
      ) : !conversations?.length ? (
        <p className="text-muted-foreground text-sm py-8 text-center">Aucune conversation.</p>
      ) : (
        <div className="space-y-2">
          {conversations.map((conversation) => (
            <Link key={conversation.id} to={`/messages/${conversation.id}`}>
              <Card className="hover:ring-primary/40 transition-colors">
                <CardContent className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{conversation.client?.name ?? 'Client'}</div>
                    {conversation.property && (
                      <div className="text-xs text-muted-foreground">{conversation.property.name}</div>
                    )}
                  </div>
                  {!!conversation.unread_count && <Badge>{conversation.unread_count}</Badge>}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

export default ConversationsList
