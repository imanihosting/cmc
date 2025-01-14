'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { motion } from 'framer-motion'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { toast } from 'sonner'
import { UserCircle, MapPin, Phone, Mail, Settings, Save } from 'lucide-react'

interface ParentProfile {
  id: string
  name: string
  email: string
  phoneNumber: string
  address: string
  city: string
  postcode: string
  bio: string
  preferences: {
    maxDistance: number
    flexibleHours: boolean
    emergencyBookings: boolean
    specialNeeds: boolean
    languagePreference: string[]
    ageGroupPreference: string[]
  }
}

const AnimatedCard = motion(Card)

export default function ParentProfilePage() {
  const { user } = useUser()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [profile, setProfile] = useState<ParentProfile | null>(null)

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/parent/profile')
      if (!response.ok) throw new Error('Failed to fetch profile')
      const data = await response.json()
      setProfile(data)
    } catch (error) {
      toast.error('Failed to load profile')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!profile) return

    setSaving(true)
    try {
      const response = await fetch('/api/parent/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile),
      })

      if (!response.ok) throw new Error('Failed to update profile')
      toast.success('Profile updated successfully')
    } catch (error) {
      toast.error('Failed to update profile')
      console.error(error)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  if (!profile) {
    return <div className="flex items-center justify-center min-h-screen">Profile not found</div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-sky-50 to-indigo-100 dark:from-gray-900 dark:via-purple-900 dark:to-gray-800 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Your Profile</h1>
            <p className="text-gray-600 dark:text-gray-300">Manage your personal information and preferences</p>
          </div>
          <Button
            onClick={() => window.location.href = '/portal/parent'}
            variant="outline"
            className="flex items-center gap-2"
          >
            Back to Dashboard
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <AnimatedCard
            className="bg-white/30 dark:bg-gray-800/30 backdrop-blur-lg shadow-xl rounded-xl overflow-hidden border border-white/30 dark:border-gray-700/30"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <CardHeader className="border-b border-gray-100 dark:border-gray-700">
              <CardTitle className="flex items-center space-x-2">
                <UserCircle className="h-5 w-5 text-purple-500" />
                <span>Basic Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex items-center space-x-6 mb-6">
                <Avatar className="h-20 w-20 ring-2 ring-purple-100 dark:ring-purple-900">
                  <AvatarImage src={user?.imageUrl} />
                  <AvatarFallback className="bg-gradient-to-br from-purple-100 to-indigo-100 dark:from-purple-900 dark:to-indigo-900">
                    {profile.name[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{profile.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Parent</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    className="bg-white/50 dark:bg-gray-800/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    className="bg-white/50 dark:bg-gray-800/50"
                  />
                </div>
              </div>
            </CardContent>
          </AnimatedCard>

          <AnimatedCard
            className="bg-white/30 dark:bg-gray-800/30 backdrop-blur-lg shadow-xl rounded-xl overflow-hidden border border-white/30 dark:border-gray-700/30"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <CardHeader className="border-b border-gray-100 dark:border-gray-700">
              <CardTitle className="flex items-center space-x-2">
                <MapPin className="h-5 w-5 text-purple-500" />
                <span>Contact & Location</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={profile.phoneNumber}
                    onChange={(e) => setProfile({ ...profile, phoneNumber: e.target.value })}
                    className="bg-white/50 dark:bg-gray-800/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={profile.address}
                    onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                    className="bg-white/50 dark:bg-gray-800/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={profile.city}
                    onChange={(e) => setProfile({ ...profile, city: e.target.value })}
                    className="bg-white/50 dark:bg-gray-800/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="postcode">Postcode</Label>
                  <Input
                    id="postcode"
                    value={profile.postcode}
                    onChange={(e) => setProfile({ ...profile, postcode: e.target.value })}
                    className="bg-white/50 dark:bg-gray-800/50"
                  />
                </div>
              </div>
            </CardContent>
          </AnimatedCard>

          <AnimatedCard
            className="bg-white/30 dark:bg-gray-800/30 backdrop-blur-lg shadow-xl rounded-xl overflow-hidden border border-white/30 dark:border-gray-700/30"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <CardHeader className="border-b border-gray-100 dark:border-gray-700">
              <CardTitle className="flex items-center space-x-2">
                <Settings className="h-5 w-5 text-purple-500" />
                <span>Childcare Preferences</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid gap-6">
                <div className="space-y-2">
                  <Label htmlFor="maxDistance">Maximum Distance (km)</Label>
                  <Input
                    id="maxDistance"
                    type="number"
                    value={profile.preferences.maxDistance}
                    onChange={(e) =>
                      setProfile({
                        ...profile,
                        preferences: {
                          ...profile.preferences,
                          maxDistance: parseInt(e.target.value),
                        },
                      })
                    }
                    className="bg-white/50 dark:bg-gray-800/50"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-center justify-between p-4 bg-white/50 dark:bg-gray-800/50 rounded-xl">
                    <Label htmlFor="flexibleHours">Flexible Hours</Label>
                    <Switch
                      id="flexibleHours"
                      checked={profile.preferences.flexibleHours}
                      onCheckedChange={(checked) =>
                        setProfile({
                          ...profile,
                          preferences: {
                            ...profile.preferences,
                            flexibleHours: checked,
                          },
                        })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-white/50 dark:bg-gray-800/50 rounded-xl">
                    <Label htmlFor="emergencyBookings">Emergency Bookings</Label>
                    <Switch
                      id="emergencyBookings"
                      checked={profile.preferences.emergencyBookings}
                      onCheckedChange={(checked) =>
                        setProfile({
                          ...profile,
                          preferences: {
                            ...profile.preferences,
                            emergencyBookings: checked,
                          },
                        })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-white/50 dark:bg-gray-800/50 rounded-xl">
                    <Label htmlFor="specialNeeds">Special Needs Care</Label>
                    <Switch
                      id="specialNeeds"
                      checked={profile.preferences.specialNeeds}
                      onCheckedChange={(checked) =>
                        setProfile({
                          ...profile,
                          preferences: {
                            ...profile.preferences,
                            specialNeeds: checked,
                          },
                        })
                      }
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </AnimatedCard>

          <AnimatedCard
            className="bg-white/30 dark:bg-gray-800/30 backdrop-blur-lg shadow-xl rounded-xl overflow-hidden border border-white/30 dark:border-gray-700/30"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <CardHeader className="border-b border-gray-100 dark:border-gray-700">
              <CardTitle className="flex items-center space-x-2">
                <UserCircle className="h-5 w-5 text-purple-500" />
                <span>About You</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={profile.bio}
                  onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                  className="h-32 bg-white/50 dark:bg-gray-800/50"
                  placeholder="Tell childminders about yourself and your family..."
                />
              </div>
            </CardContent>
          </AnimatedCard>

          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={saving}
              className="bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white px-8"
            >
              {saving ? (
                <span className="flex items-center gap-2">
                  <Save className="h-4 w-4 animate-spin" />
                  Saving...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  Save Changes
                </span>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
} 