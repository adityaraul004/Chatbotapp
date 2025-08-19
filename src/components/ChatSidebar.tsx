import React, { useState } from 'react'
import { useQuery, useMutation } from '@apollo/client'
import { Plus, MessageCircle, Trash2, Edit2 } from 'lucide-react'
import { GET_CHATS, CREATE_CHAT, DELETE_CHAT } from '../graphql/queries'
import { Chat } from '../types'

interface ChatSidebarProps {
  selectedChatId?: string
  onSelectChat: (chatId: string) => void
}

export const ChatSidebar: React.FC<ChatSidebarProps> = ({
  selectedChatId,
  onSelectChat,
}) => {
  const [isCreating, setIsCreating] = useState(false)
  const [newChatTitle, setNewChatTitle] = useState('')

  const { data, loading, refetch } = useQuery(GET_CHATS, {
    pollInterval: 2000, // Poll every 2 seconds to keep chat list updated
    errorPolicy: 'all',
  })
  const [createChat] = useMutation(CREATE_CHAT)
  const [deleteChat] = useMutation(DELETE_CHAT)

  const chats: Chat[] = data?.chats || []

  const handleCreateChat = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newChatTitle.trim()) return

    try {
      const result = await createChat({
        variables: { title: newChatTitle.trim() },
        refetchQueries: [{ query: GET_CHATS }],
        awaitRefetchQueries: true,
      })
      
      if (result.data?.insert_chats_one) {
        onSelectChat(result.data.insert_chats_one.id)
        setNewChatTitle('')
        setIsCreating(false)
        // Force refetch to ensure chat list updates
        await refetch()
      }
    } catch (error) {
      console.error('Error creating chat:', error)
    }
  }

  const handleDeleteChat = async (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!confirm('Are you sure you want to delete this chat?')) return

    try {
      await deleteChat({
        variables: { id: chatId },
      })
      refetch()
      if (selectedChatId === chatId) {
        onSelectChat('')
      }
    } catch (error) {
      console.error('Error deleting chat:', error)
    }
  }

  return (
    <div className="w-[18rem] bg-gradient-to-b from-white/10 to-white/5 border-r border-white/10 flex flex-col text-white">
      {/* Header */}
      <div className="p-5 border-b border-white/10">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold opacity-90">Chats</h2>
          <button
            onClick={() => setIsCreating(true)}
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
          >
            <Plus className="h-5 w-5" />
          </button>
        </div>
        
        {isCreating && (
          <form onSubmit={handleCreateChat} className="mt-3">
            <input
              type="text"
              value={newChatTitle}
              onChange={(e) => setNewChatTitle(e.target.value)}
              placeholder="Chat title..."
              className="input-modern w-full"
              autoFocus
              onBlur={() => {
                if (!newChatTitle.trim()) {
                  setIsCreating(false)
                }
              }}
            />
          </form>
        )}
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {loading ? (
          <div className="p-4 text-center text-white/70">
            Loading chats...
          </div>
        ) : chats.length === 0 ? (
          <div className="p-6 text-center text-white/80">
            <MessageCircle className="mx-auto h-8 w-8 mb-2 opacity-80" />
            <p className="text-sm">No chats yet</p>
            <p className="text-xs mt-1 opacity-70">Create your first chat to get started</p>
          </div>
        ) : (
          chats.map((chat) => (
            <div
              key={chat.id}
              onClick={() => onSelectChat(chat.id)}
              className={`chat-item ${selectedChatId === chat.id ? 'active' : ''}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium truncate">
                    {chat.title}
                  </h3>
                  {chat.messages && chat.messages.length > 0 && (
                    <p className="text-xs opacity-80 mt-1 truncate">
                      {chat.messages[0].is_bot ? '🤖 ' : '👤 '}
                      {chat.messages[0].content}
                    </p>
                  )}
                  <p className="text-[10px] opacity-60 mt-1">
                    {new Date(chat.updated_at).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={(e) => handleDeleteChat(chat.id, e)}
                  className="ml-2 p-1 text-white/60 hover:text-red-300"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
