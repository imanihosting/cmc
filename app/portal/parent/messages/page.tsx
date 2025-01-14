'use client'

import { useState, useEffect, useRef } from 'react'
import { useUser } from '@clerk/nextjs'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { MessageCircle, Send, Search } from 'lucide-react'
import { format, formatDistanceToNow } from 'date-fns'
import { toast } from 'sonner'

interface Message {
  id: number
  sender: {
    id: number
    name: string
    profilePicture?: string
    clerkId: string
  }
  content: string
  sentAt: string
}

interface Conversation {
  id: number
  participant: {
    id: number
    name: string
    profilePicture?: string
    clerkId: string
  }
  lastMessage?: Message
  unreadCount: number
}

const AnimatedCard = motion(Card)

export default function MessagesPage() {
  const { isLoaded, user } = useUser()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    const fetchConversations = async () => {
      if (!user) return
      
      try {
        setIsLoading(true)
        const res = await fetch('/api/conversations')
        if (!res.ok) {
          throw new Error('Failed to fetch conversations')
        }
        const data = await res.json()
        if (Array.isArray(data)) {
          setConversations(data)
        } else {
          console.error('Conversations data is not an array:', data)
          setConversations([])
        }
      } catch (err) {
        console.error('Error fetching conversations:', err)
        setError('Failed to load conversations')
        setConversations([])
      } finally {
        setIsLoading(false)
      }
    }

    if (isLoaded && user) {
      fetchConversations()
    }
  }, [isLoaded, user])

  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedConversation) return
      
      try {
        const res = await fetch(`/api/messages?conversationId=${selectedConversation.id}`)
        if (!res.ok) {
          throw new Error('Failed to fetch messages')
        }
        const data = await res.json()
        if (Array.isArray(data)) {
          setMessages(data)
        } else {
          console.error('Messages data is not an array:', data)
          setMessages([])
        }
      } catch (err) {
        console.error('Error fetching messages:', err)
        setMessages([])
      }
    }

    if (selectedConversation) {
      fetchMessages()
      // Set up polling for new messages
      const pollInterval = setInterval(fetchMessages, 5000)
      return () => clearInterval(pollInterval)
    }
  }, [selectedConversation])

  // Authentication and role checks
  if (!isLoaded) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  if (!user) {
    window.location.href = '/sign-in'
    return null
  }

  const userRole = user.publicMetadata.role as string
  if (userRole !== 'parent') {
    window.location.href = '/portal/' + userRole
    return null
  }

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading messages...</div>
  }

  if (error) {
    return <div className="min-h-screen flex items-center justify-center text-red-500">{error}</div>
  }

  const handleSendMessage = async () => {
    if (!selectedConversation || !newMessage.trim()) return

    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          conversationId: selectedConversation.id,
          content: newMessage.trim(),
        }),
      })

      if (!res.ok) {
        throw new Error('Failed to send message')
      }

      const message = await res.json()
      setMessages(prev => [...prev, message])
      setNewMessage('')
      scrollToBottom()
    } catch (err) {
      console.error('Error sending message:', err)
      toast.error('Failed to send message. Please try again.')
    }
  }

  const filteredConversations = conversations.filter(conversation =>
    conversation.participant?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-sky-50 to-indigo-100 dark:from-gray-900 dark:via-purple-900 dark:to-gray-800 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Messages</h1>
        <p className="text-gray-600 dark:text-gray-300 mb-8">Communicate with your childminders.</p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Conversations List */}
          <div className="lg:col-span-1">
            <AnimatedCard className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-xl rounded-xl overflow-hidden border border-gray-100 dark:border-gray-700">
              <CardHeader className="border-b border-gray-100 dark:border-gray-700 p-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search conversations..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </CardHeader>
              <CardContent className="p-0 max-h-[600px] overflow-y-auto">
                {filteredConversations.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">
                    {searchQuery ? 'No conversations found' : 'No conversations yet'}
                  </div>
                ) : (
                  filteredConversations.map((conversation) => (
                    <div
                      key={conversation.id}
                      className={`p-4 border-b border-gray-100 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${
                        selectedConversation?.id === conversation.id ? 'bg-purple-50 dark:bg-purple-900/50' : ''
                      }`}
                      onClick={() => setSelectedConversation(conversation)}
                    >
                      <div className="flex items-center space-x-4">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={conversation.participant?.profilePicture || ''} />
                          <AvatarFallback>{conversation.participant?.name?.[0] || '?'}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                              {conversation.participant?.name || 'Loading...'}
                            </h3>
                            {conversation.unreadCount > 0 && (
                              <span className="inline-flex items-center justify-center h-5 w-5 text-xs font-medium text-white bg-purple-600 rounded-full">
                                {conversation.unreadCount}
                              </span>
                            )}
                          </div>
                          {conversation.lastMessage && (
                            <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                              {conversation.lastMessage.content}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </AnimatedCard>
          </div>

          {/* Messages Area */}
          <div className="lg:col-span-2">
            {selectedConversation ? (
              <AnimatedCard className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-xl rounded-xl overflow-hidden border border-gray-100 dark:border-gray-700 h-[700px] flex flex-col">
                <CardHeader className="border-b border-gray-100 dark:border-gray-700 p-4">
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={selectedConversation.participant?.profilePicture || ''} />
                      <AvatarFallback>{selectedConversation.participant?.name?.[0] || '?'}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {selectedConversation.participant?.name || 'Loading...'}
                      </h3>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender.clerkId === user.id ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[70%] rounded-lg p-3 ${
                          message.sender.clerkId === user.id
                            ? 'bg-purple-600 text-white'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                        <p className="text-xs mt-1 opacity-70">
                          {formatDistanceToNow(new Date(message.sentAt), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </CardContent>
                <div className="border-t border-gray-100 dark:border-gray-700 p-4">
                  <div className="flex space-x-4">
                    <Input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type your message..."
                      className="flex-1"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault()
                          handleSendMessage()
                        }
                      }}
                    />
                    <Button
                      onClick={handleSendMessage}
                      className="bg-purple-600 hover:bg-purple-700 text-white"
                      disabled={!newMessage.trim()}
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </AnimatedCard>
            ) : (
              <div className="h-[700px] flex items-center justify-center">
                <div className="text-center">
                  <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Select a Conversation
                  </h3>
                  <p className="text-gray-500">
                    Choose a conversation from the list to start messaging
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 