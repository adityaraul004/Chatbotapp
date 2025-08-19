import React, { useState } from 'react'
import { nhost } from '../lib/nhost'
import { Mail, Lock, User, Eye, EyeOff, Bot, Sparkles } from 'lucide-react'

interface AuthFormProps {
  onSuccess?: () => void
}

export const AuthForm: React.FC<AuthFormProps> = ({ onSuccess }) => {
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (isSignUp) {
        const { error } = await nhost.auth.signUp({
          email,
          password,
          options: {
            displayName,
          },
        })
        if (error) {
          setError(error.message)
        } else {
          setError('Please check your email to verify your account.')
        }
      } else {
        const { error } = await nhost.auth.signIn({
          email,
          password,
        })
        if (error) {
          setError(error.message)
        } else {
          onSuccess?.()
        }
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 animate-fade-in-up">
        {/* Hero Section */}
        <div className="text-center">
          <div className="mx-auto h-20 w-20 flex items-center justify-center rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 shadow-2xl pulse-glow">
            <Bot className="h-10 w-10 text-white" />
          </div>
          <h1 className="mt-6 text-4xl font-bold text-white">
            <span className="bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
              Subspace
            </span>
          </h1>
          <h2 className="mt-2 text-xl font-semibold text-white/90">
            {isSignUp ? 'Create your account' : 'Welcome back!'}
          </h2>
          <p className="mt-2 text-sm text-white/70 flex items-center justify-center gap-2">
            <Sparkles className="h-4 w-4" />
            {isSignUp ? 'Start chatting with our AI assistant' : 'Continue your conversation'}
          </p>
        </div>
        
        {/* Form */}
        <div className="glass-dark rounded-3xl p-8 shadow-2xl border border-white/10">
          <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            {isSignUp && (
              <div>
                <label htmlFor="displayName" className="sr-only">
                  Display Name
                </label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-white/60" />
                  </div>
                  <input
                    id="displayName"
                    name="displayName"
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                      className="input-modern w-full pl-12"
                    placeholder="Display Name"
                  />
                </div>
              </div>
            )}
            
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-white/60" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                    className="input-modern w-full pl-12"
                  placeholder="Email address"
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-white/60" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                    className="input-modern w-full pl-12 pr-12"
                  placeholder="Password"
                />
                <button
                  type="button"
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-white/60 hover:text-white/80 transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                  ) : (
                      <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {error && (
              <div className="text-red-300 text-sm text-center bg-red-500/20 backdrop-blur-sm p-4 rounded-xl border border-red-500/30">
              {error}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
                className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Processing...
                  </span>
                ) : (
                  isSignUp ? 'Create Account' : 'Sign In'
                )}
            </button>
          </div>

          <div className="text-center">
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
                className="text-white/80 hover:text-white text-sm transition-colors duration-200"
            >
              {isSignUp 
                ? 'Already have an account? Sign in' 
                : "Don't have an account? Sign up"}
            </button>
          </div>
        </form>
        </div>
      </div>
    </div>
  )
}
