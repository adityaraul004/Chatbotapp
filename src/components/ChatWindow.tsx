import React, { useState, useEffect, useRef } from 'react'
import { useQuery, useMutation, useSubscription } from '@apollo/client'
import { Send, Bot, User } from 'lucide-react'
import { 
  GET_CHAT_MESSAGES, 
  SEND_MESSAGE, 
  MESSAGES_SUBSCRIPTION,
  SEND_CHATBOT_MESSAGE 
} from '../graphql/queries'
import { Message } from '../types'

interface ChatWindowProps {
  chatId: string
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ chatId }) => {
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const { data: messagesData } = useQuery(GET_CHAT_MESSAGES, {
    variables: { chatId },
    skip: !chatId,
  })

  const { data: subscriptionData } = useSubscription(MESSAGES_SUBSCRIPTION, {
    variables: { chatId },
    skip: !chatId,
  })

  const [sendMessage] = useMutation(SEND_MESSAGE)
  const [sendChatbotMessage] = useMutation(SEND_CHATBOT_MESSAGE)

  const messages: Message[] = subscriptionData?.messages || messagesData?.messages || []

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim() || isLoading) return

    const userMessage = message.trim()
    setMessage('')
    setIsLoading(true)

    try {
      // Send user message
      await sendMessage({
        variables: {
          chatId,
          content: userMessage,
        },
      })

      // Trigger chatbot response
      await sendChatbotMessage({
        variables: {
          chatId,
          message: userMessage,
        },
      })
    } catch (error) {
      console.error('Error sending message:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!chatId) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-white/5 to-white/0">
        <div className="text-center max-w-md text-white">
          <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-2xl bg-white/10">
            <Bot className="h-8 w-8" />
          </div>
          <h3 className="mt-6 text-xl font-semibold">
            Welcome to Your AI Chatbot
          </h3>
          <p className="mt-3 text-sm text-white/80">
            Get started by creating a new conversation or selecting an existing chat from the sidebar.
          </p>
          <div className="mt-6 p-4 glass-dark rounded-xl inline-block">
            <p className="text-xs">
              💡 Tip: Click the + button in the sidebar to create your first chat!
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col bg-transparent">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.is_bot ? 'justify-start' : 'justify-end'}`}
          >
            <div className={`message-bubble ${msg.is_bot ? 'message-bot' : 'message-user'}`}>
              <div className="flex items-center space-x-2 mb-2 opacity-80">
                {msg.is_bot ? (
                  <Bot className="h-4 w-4" />
                ) : (
                  <User className="h-4 w-4" />
                )}
                <span className="text-xs">
                  {msg.is_bot ? 'Assistant' : 'You'}
                </span>
              </div>
              <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
              <p className="text-[10px] opacity-60 mt-1">
                {new Date(msg.created_at).toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="message-bubble message-bot">
              <div className="flex items-center space-x-2 mb-2 opacity-80">
                <Bot className="h-4 w-4" />
                <span className="text-xs">Assistant</span>
              </div>
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-3 sm:p-4 border-t border-white/10">
        <form onSubmit={handleSendMessage} className="flex gap-3">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 input-modern"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!message.trim() || isLoading}
            className="btn-primary rounded-2xl px-5"
          >
            <Send className="h-5 w-5" />
          </button>
        </form>
      </div>
    </div>
  )
}
