'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Bell } from 'lucide-react'
import { format } from 'date-fns'

interface Notification {
  id: number
  type: string
  message: string
  createdAt: string
  isRead: boolean
}

export default function NotificationsPage() {
  const { isLoaded, user } = useUser()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!user) return

      try {
        setIsLoading(true)
        const response = await fetch('/api/notifications')
        if (!response.ok) {
          throw new Error('Failed to fetch notifications')
        }
        const data = await response.json()
        setNotifications(data)
      } catch (err) {
        console.error('Error fetching notifications:', err)
        setError('Failed to load notifications')
      } finally {
        setIsLoading(false)
      }
    }

    if (isLoaded && user) {
      fetchNotifications()
    }
  }, [isLoaded, user])

  // Check authentication and role
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
    return <div className="min-h-screen flex items-center justify-center">Loading notifications...</div>
  }

  if (error) {
    return <div className="min-h-screen flex items-center justify-center text-red-500">{error}</div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-sky-50 to-indigo-100 dark:from-gray-900 dark:via-purple-900 dark:to-gray-800 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-2 mb-8">
          <Bell className="h-6 w-6 text-indigo-600 dark:text-indigo-300" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Notifications</h1>
        </div>

        <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-xl rounded-xl overflow-hidden border border-gray-100 dark:border-gray-700">
          <CardHeader>
            <CardTitle>All Notifications</CardTitle>
          </CardHeader>
          <CardContent>
            {notifications.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No notifications to display
              </div>
            ) : (
              <div className="space-y-4">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 rounded-lg border ${
                      notification.isRead
                        ? 'bg-gray-50 dark:bg-gray-700/50 border-gray-100 dark:border-gray-700'
                        : 'bg-white dark:bg-gray-700 border-indigo-100 dark:border-indigo-700'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {notification.message}
                        </p>
                        <div className="mt-1 flex items-center gap-2">
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {format(new Date(notification.createdAt), 'PPp')}
                          </span>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-300">
                            {notification.type}
                          </span>
                        </div>
                      </div>
                      {!notification.isRead && (
                        <span className="h-2 w-2 rounded-full bg-indigo-500"></span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 