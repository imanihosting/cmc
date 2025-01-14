'use client';

import { useEffect, useState, useRef } from 'react';
import { useUser } from '@clerk/nextjs';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/components/ui/use-toast';
import { Send, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useRouter } from 'next/navigation';

interface Message {
  id: number;
  conversationId: number;
  senderId: number;
  receiverId: number;
  content: string;
  sentAt: string;
}

interface Conversation {
  id: number;
  parentId: number;
  childminderId: number;
  startedAt: string;
  parent: {
    name: string;
    profilePicture: string | null;
  };
  messages: Message[];
}

export default function MessagesPage() {
  const { user } = useUser();
  const { toast } = useToast();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollInterval = useRef<NodeJS.Timeout | undefined>(undefined);
  const router = useRouter();

  // Fetch conversations
  const fetchConversations = async () => {
    try {
      const response = await fetch('/api/childminder/messages');
      if (response.ok) {
        const data = await response.json();
        setConversations(data);
        if (data.length > 0 && !selectedConversation) {
          setSelectedConversation(data[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load messages. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Set up polling for new messages
  useEffect(() => {
    fetchConversations();

    // Poll for new messages every 10 seconds
    pollInterval.current = setInterval(fetchConversations, 10000);

    return () => {
      if (pollInterval.current) {
        clearInterval(pollInterval.current);
      }
    };
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (selectedConversation?.messages) {
      scrollToBottom();
    }
  }, [selectedConversation?.messages]);

  // Send message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedConversation || !newMessage.trim()) return;

    try {
      const response = await fetch('/api/childminder/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          conversationId: selectedConversation.id,
          content: newMessage,
          receiverId: selectedConversation.parentId,
        }),
      });

      if (response.ok) {
        setNewMessage('');
        await fetchConversations();
      } else {
        throw new Error('Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to send message. Please try again.",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 h-[calc(100vh-200px)]">
        {/* Conversations List */}
        <Card className="p-4 md:col-span-1 overflow-hidden">
          <h2 className="text-lg font-semibold mb-4">Conversations</h2>
          <ScrollArea className="h-[calc(100vh-300px)]">
            <div className="space-y-2">
              {conversations.map((conversation) => (
                <div
                  key={conversation.id}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedConversation?.id === conversation.id
                      ? 'bg-blue-50 dark:bg-blue-900'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                  onClick={() => setSelectedConversation(conversation)}
                >
                  <div className="flex items-center space-x-3">
                    <Avatar 
                      className="cursor-pointer hover:ring-2 hover:ring-blue-400 transition-all"
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/portal/parent/${conversation.parentId}`);
                      }}
                    >
                      <AvatarImage src={conversation.parent.profilePicture || undefined} />
                      <AvatarFallback>{conversation.parent.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p 
                        className="font-medium truncate hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/portal/parent/${conversation.parentId}`);
                        }}
                      >
                        {conversation.parent.name}
                      </p>
                      <p className="text-sm text-gray-500 truncate">
                        {conversation.messages && conversation.messages.length > 0 
                          ? conversation.messages[conversation.messages.length - 1]?.content 
                          : 'No messages yet'}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </Card>

        {/* Messages Area */}
        <Card className="p-4 md:col-span-3 flex flex-col">
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <div className="pb-4 border-b">
                <div className="flex items-center space-x-3">
                  <Avatar 
                    className="cursor-pointer hover:ring-2 hover:ring-blue-400 transition-all"
                    onClick={() => router.push(`/portal/parent/${selectedConversation.parentId}`)}
                  >
                    <AvatarImage src={selectedConversation.parent.profilePicture || undefined} />
                    <AvatarFallback>{selectedConversation.parent.name[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 
                      className="font-semibold hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer"
                      onClick={() => router.push(`/portal/parent/${selectedConversation.parentId}`)}
                    >
                      {selectedConversation.parent.name}
                    </h3>
                    <p className="text-sm text-gray-500">Parent</p>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {selectedConversation.messages?.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${
                        message.senderId === selectedConversation.childminderId
                          ? 'justify-end'
                          : 'justify-start'
                      }`}
                    >
                      <div
                        className={`max-w-[70%] rounded-lg p-3 ${
                          message.senderId === selectedConversation.childminderId
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-100 dark:bg-gray-800'
                        }`}
                      >
                        <p className="break-words">{message.content}</p>
                        <div
                          className={`text-xs mt-1 ${
                            message.senderId === selectedConversation.childminderId
                              ? 'text-blue-100'
                              : 'text-gray-500'
                          }`}
                        >
                          <Clock className="inline-block w-3 h-3 mr-1" />
                          {formatDistanceToNow(new Date(message.sentAt), { addSuffix: true })}
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              {/* Message Input */}
              <form onSubmit={handleSendMessage} className="mt-4 flex gap-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1"
                />
                <Button type="submit" disabled={!newMessage.trim()}>
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              Select a conversation to start messaging
            </div>
          )}
        </Card>
      </div>
    </div>
  );
} 