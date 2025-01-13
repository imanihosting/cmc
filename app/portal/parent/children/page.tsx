'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { CalendarDays, Plus, Heart, Activity, BookOpen } from 'lucide-react'
import { format, differenceInYears } from 'date-fns'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from 'sonner'

interface Child {
  id: number
  name: string
  dateOfBirth: string
  profilePicture?: string
  allergies?: string[]
  specialNeeds?: string[]
  interests?: string[]
  activeBookings?: number
}

interface ChildFormData {
  name: string
  dateOfBirth: string
  allergies: string
  interests: string
  specialNeeds: string
}

const AnimatedCard = motion(Card)

export default function ChildrenPage() {
  const { isLoaded, user } = useUser()
  const [children, setChildren] = useState<Child[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedChild, setSelectedChild] = useState<Child | null>(null)
  const [formData, setFormData] = useState<ChildFormData>({
    name: '',
    dateOfBirth: '',
    allergies: '',
    interests: '',
    specialNeeds: ''
  })

  useEffect(() => {
    const fetchChildren = async () => {
      if (!user) return
      
      try {
        setIsLoading(true)
        const res = await fetch('/api/children')
        const data = await res.json()
        if (Array.isArray(data)) {
          const parsedChildren = data.map(child => ({
            ...child,
            allergies: child.allergies ? JSON.parse(child.allergies as string) : [],
            interests: child.preferences ? JSON.parse(child.preferences as string) : [],
            specialNeeds: child.specialNeeds ? JSON.parse(child.specialNeeds as string) : []
          }))
          setChildren(parsedChildren)
        } else {
          console.error('Children data is not an array:', data)
          setChildren([])
        }
      } catch (err) {
        console.error('Error fetching children:', err)
        setError('Failed to load children profiles')
        setChildren([])
      } finally {
        setIsLoading(false)
      }
    }

    if (isLoaded && user) {
      fetchChildren()
    }
  }, [isLoaded, user])

  const handleAddChild = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/children', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          dateOfBirth: formData.dateOfBirth,
          allergies: formData.allergies.split(',').map(s => s.trim()).filter(Boolean),
          interests: formData.interests.split(',').map(s => s.trim()).filter(Boolean),
          specialNeeds: formData.specialNeeds.split(',').map(s => s.trim()).filter(Boolean)
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to add child')
      }

      const newChild = await response.json()
      setChildren([...children, newChild])
      setIsAddDialogOpen(false)
      setFormData({
        name: '',
        dateOfBirth: '',
        allergies: '',
        interests: '',
        specialNeeds: ''
      })
      toast.success('Child added successfully')
    } catch (error) {
      console.error('Error adding child:', error)
      toast.error('Failed to add child')
    }
  }

  const handleEditChild = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedChild) return

    try {
      const response = await fetch(`/api/children/${selectedChild.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          dateOfBirth: formData.dateOfBirth,
          allergies: formData.allergies.split(',').map(s => s.trim()).filter(Boolean),
          interests: formData.interests.split(',').map(s => s.trim()).filter(Boolean),
          specialNeeds: formData.specialNeeds.split(',').map(s => s.trim()).filter(Boolean)
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to update child')
      }

      const updatedChildData = await response.json()
      // Parse the JSON strings back into arrays
      const updatedChild = {
        ...updatedChildData,
        allergies: updatedChildData.allergies ? JSON.parse(updatedChildData.allergies) : [],
        interests: updatedChildData.preferences ? JSON.parse(updatedChildData.preferences) : [],
        specialNeeds: updatedChildData.specialNeeds ? JSON.parse(updatedChildData.specialNeeds) : []
      }
      
      setChildren(children.map(child => 
        child.id === selectedChild.id ? updatedChild : child
      ))
      setIsEditDialogOpen(false)
      setSelectedChild(null)
      toast.success('Child updated successfully')
    } catch (error) {
      console.error('Error updating child:', error)
      toast.error('Failed to update child')
    }
  }

  const openEditDialog = (child: Child) => {
    setSelectedChild(child)
    setFormData({
      name: child.name,
      dateOfBirth: child.dateOfBirth.split('T')[0],
      allergies: Array.isArray(child.allergies) ? child.allergies.join(', ') : '',
      interests: Array.isArray(child.interests) ? child.interests.join(', ') : '',
      specialNeeds: Array.isArray(child.specialNeeds) ? child.specialNeeds.join(', ') : ''
    })
    setIsEditDialogOpen(true)
  }

  // Authentication and role checks
  if (!isLoaded) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  if (!user) {
    window.location.href = '/sign-in'
    return null
  }

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading children profiles...</div>
  }

  if (error) {
    return <div className="min-h-screen flex items-center justify-center text-red-500">{error}</div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-sky-50 to-indigo-100 dark:from-gray-900 dark:via-purple-900 dark:to-gray-800 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Children's Profiles</h1>
            <p className="text-gray-600 dark:text-gray-300">Manage your children's information and preferences.</p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                <Plus className="h-4 w-4 mr-2" />
                Add Child
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Child</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddChild} className="space-y-4">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="dateOfBirth">Date of Birth</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="allergies">Allergies (comma-separated)</Label>
                  <Input
                    id="allergies"
                    value={formData.allergies}
                    onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                    placeholder="e.g., Peanuts, Dairy, Eggs"
                  />
                </div>
                <div>
                  <Label htmlFor="interests">Interests (comma-separated)</Label>
                  <Input
                    id="interests"
                    value={formData.interests}
                    onChange={(e) => setFormData({ ...formData, interests: e.target.value })}
                    placeholder="e.g., Drawing, Music, Sports"
                  />
                </div>
                <div>
                  <Label htmlFor="specialNeeds">Special Needs (comma-separated)</Label>
                  <Textarea
                    id="specialNeeds"
                    value={formData.specialNeeds}
                    onChange={(e) => setFormData({ ...formData, specialNeeds: e.target.value })}
                    placeholder="Any special needs or requirements"
                  />
                </div>
                <Button type="submit" className="w-full">Add Child</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {children.map((child, index) => (
            <AnimatedCard
              key={child.id}
              className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-xl rounded-xl overflow-hidden border border-gray-100 dark:border-gray-700"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
            >
              <CardContent className="p-6">
                <div className="flex items-center space-x-4 mb-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={child.profilePicture} />
                    <AvatarFallback>{child.name[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{child.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {differenceInYears(new Date(), new Date(child.dateOfBirth))} years old
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-300">
                    <CalendarDays className="h-4 w-4" />
                    <span>Born {format(new Date(child.dateOfBirth), 'MMMM d, yyyy')}</span>
                  </div>

                  {child.activeBookings !== undefined && (
                    <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-300">
                      <BookOpen className="h-4 w-4" />
                      <span>{child.activeBookings} Active Bookings</span>
                    </div>
                  )}

                  {child.allergies && child.allergies.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Allergies</h4>
                      <div className="flex flex-wrap gap-2">
                        {child.allergies.map((allergy, i) => (
                          <Badge key={i} variant="secondary">{allergy}</Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {child.interests && child.interests.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Interests</h4>
                      <div className="flex flex-wrap gap-2">
                        {child.interests.map((interest, i) => (
                          <Badge key={i} variant="outline">{interest}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-6 flex justify-end">
                  <Button 
                    variant="outline" 
                    className="text-purple-600 border-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900"
                    onClick={() => openEditDialog(child)}
                  >
                    Edit Profile
                  </Button>
                </div>
              </CardContent>
            </AnimatedCard>
          ))}
        </div>

        {children.length === 0 && (
          <div className="text-center py-12">
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-8 max-w-md mx-auto">
              <Heart className="h-12 w-12 text-purple-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No Children Added Yet</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Start by adding your child's profile to manage their childcare needs effectively.
              </p>
              <Button 
                className="bg-purple-600 hover:bg-purple-700 text-white"
                onClick={() => setIsAddDialogOpen(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Child
              </Button>
            </div>
          </div>
        )}

        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Child Profile</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleEditChild} className="space-y-4">
              <div>
                <Label htmlFor="edit-name">Name</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit-dateOfBirth">Date of Birth</Label>
                <Input
                  id="edit-dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit-allergies">Allergies (comma-separated)</Label>
                <Input
                  id="edit-allergies"
                  value={formData.allergies}
                  onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                  placeholder="e.g., Peanuts, Dairy, Eggs"
                />
              </div>
              <div>
                <Label htmlFor="edit-interests">Interests (comma-separated)</Label>
                <Input
                  id="edit-interests"
                  value={formData.interests}
                  onChange={(e) => setFormData({ ...formData, interests: e.target.value })}
                  placeholder="e.g., Drawing, Music, Sports"
                />
              </div>
              <div>
                <Label htmlFor="edit-specialNeeds">Special Needs (comma-separated)</Label>
                <Textarea
                  id="edit-specialNeeds"
                  value={formData.specialNeeds}
                  onChange={(e) => setFormData({ ...formData, specialNeeds: e.target.value })}
                  placeholder="Any special needs or requirements"
                />
              </div>
              <Button type="submit" className="w-full">Update Child</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
} 