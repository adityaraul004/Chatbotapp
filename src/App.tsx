import React, { useState } from 'react'
import { useAuthenticationStatus } from '@nhost/react'
import { NhostProvider } from '@nhost/react'
import { ApolloProvider } from '@apollo/client'
import { nhost } from './lib/nhost'
import { apolloClient } from './lib/apollo'
import { AuthForm } from './components/AuthForm'
import { ChatSidebar } from './components/ChatSidebar'
import { ChatWindow } from './components/ChatWindow'
import { LogOut, Bot, Sparkles } from 'lucide-react'

const AppContent: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuthenticationStatus()
  const [selectedChatId, setSelectedChatId] = useState<string>('')

  const handleSignOut = async () => {
    await nhost.auth.signOut()
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center animate-fade-in-up">
          <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 shadow-2xl pulse-glow mb-4">
            <Bot className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-xl font-semibold text-white">Loading Subspace</h2>
          <p className="text-white/70 mt-2">Preparing your AI assistant...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <AuthForm />
  }

  return (
    <div className="min-h-screen p-4 sm:p-6">
      {/* Floating sign out */}
      <div className="fixed top-4 right-4 z-20">
        <button
          onClick={handleSignOut}
          className="btn-secondary flex items-center space-x-2"
        >
          <LogOut className="h-4 w-4" />
          <span>Sign Out</span>
        </button>
      </div>

      {/* App Window */}
      <div className="h-[calc(100vh-2rem)] sm:h-[calc(100vh-3rem)] glass-dark rounded-3xl border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.25)] overflow-hidden flex backdrop-blur-xl">
        {/* Sidebar */}
        <ChatSidebar
          selectedChatId={selectedChatId}
          onSelectChat={setSelectedChatId}
        />

        {/* Main Chat Area */}
        <ChatWindow chatId={selectedChatId} />
      </div>
    </div>
  )
}

const App: React.FC = () => {
  return (
    <NhostProvider nhost={nhost}>
      <ApolloProvider client={apolloClient}>
        <AppContent />
      </ApolloProvider>
    </NhostProvider>
  )
}

export default App
