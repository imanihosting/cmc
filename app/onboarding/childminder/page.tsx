'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth, useUser } from '@clerk/nextjs'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"

export default function ChildminderOnboarding() {
  const router = useRouter()
  const { isLoaded, userId } = useAuth()
  const { user } = useUser()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    experience: '',
    qualifications: '',
    availability: '',
    serviceArea: '',
    hourlyRate: '',
    gardaVetted: false,
    tuslaRegistered: false
  })

  useEffect(() => {
    if (isLoaded && !userId) {
      router.push('/sign-in')
    }
  }, [isLoaded, userId, router])

  const handleChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      console.log('Submitting childminder onboarding form...')
      const response = await fetch('/api/onboarding/childminder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to complete onboarding')
      }

      console.log('Childminder onboarding API call successful')
      
      // Add longer delay and retry mechanism to ensure Clerk metadata is updated
      let retries = 0
      const maxRetries = 5
      
      while (retries < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, 2000)) // 2 second delay
        
        // Force a session refresh
        await user?.reload()
        
        // Check if metadata is updated
        const metadata = user?.publicMetadata
        console.log('Current metadata:', metadata)
        
        if (metadata?.onboardingComplete) {
          console.log('Metadata confirmed updated, proceeding with redirection...')
          window.location.href = '/portal/childminder'
          return
        }
        
        retries++
        console.log(`Metadata not yet updated. Attempt ${retries}/${maxRetries}`)
      }
      
      throw new Error('Onboarding completed but metadata update timed out. Please try refreshing the page.')

    } catch (error: any) {
      console.error('Error during onboarding:', error)
      setError(error.message || 'Failed to complete onboarding')
    } finally {
      setLoading(false)
    }
  }

  if (!isLoaded || !userId) {
    return null
  }

  return (
    <div className="bg-white min-h-screen py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-center text-gray-900 mb-8">Childminder Onboarding</h1>
        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-3xl shadow-xl p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Professional Information</h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="experience">Experience (Optional)</Label>
                <Textarea 
                  id="experience" 
                  placeholder="Describe your childminding experience..."
                  value={formData.experience}
                  onChange={(e) => handleChange('experience', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="qualifications">Qualifications (Optional)</Label>
                <Textarea 
                  id="qualifications" 
                  placeholder="List your relevant qualifications..."
                  value={formData.qualifications}
                  onChange={(e) => handleChange('qualifications', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="availability">Availability (Optional)</Label>
                <Textarea 
                  id="availability" 
                  placeholder="Describe your availability..."
                  value={formData.availability}
                  onChange={(e) => handleChange('availability', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="serviceArea">Service Area (Optional)</Label>
                <Input 
                  id="serviceArea" 
                  placeholder="e.g., Dublin City Centre"
                  value={formData.serviceArea}
                  onChange={(e) => handleChange('serviceArea', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="hourlyRate">Hourly Rate (Optional)</Label>
                <Input 
                  id="hourlyRate" 
                  type="number" 
                  min="0" 
                  step="0.01" 
                  placeholder="e.g., 15.00"
                  value={formData.hourlyRate}
                  onChange={(e) => handleChange('hourlyRate', e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-3xl shadow-xl p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Verification Status</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="gardaVetted">Garda Vetted</Label>
                <Switch 
                  id="gardaVetted"
                  checked={formData.gardaVetted}
                  onCheckedChange={(checked) => handleChange('gardaVetted', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="tuslaRegistered">Tusla Registered</Label>
                <Switch 
                  id="tuslaRegistered"
                  checked={formData.tuslaRegistered}
                  onCheckedChange={(checked) => handleChange('tuslaRegistered', checked)}
                />
              </div>
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full"
            disabled={loading}
          >
            {loading ? 'Completing Onboarding...' : 'Complete Onboarding'}
          </Button>
        </form>
      </div>
    </div>
  )
}