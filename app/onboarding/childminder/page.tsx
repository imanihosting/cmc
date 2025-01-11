'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"

export default function ChildminderOnboarding() {
  const [user, setUser] = useState({ name: '', email: '' })

  const handleSubmit = (e) => {
    e.preventDefault()
    // Handle form submission here
    console.log('Form submitted:', e.target)
  }

  return (
    <div className="bg-white min-h-screen py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-center text-gray-900 mb-8">Childminder Onboarding</h1>
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-3xl shadow-xl p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Basic Information</h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input 
                  id="name" 
                  value={user.name} 
                  onChange={(e) => setUser({...user, name: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  type="email"
                  value={user.email} 
                  onChange={(e) => setUser({...user, email: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="profilePicture">Profile Picture (Optional)</Label>
                <Input id="profilePicture" type="file" accept="image/*" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-3xl shadow-xl p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Professional Information</h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="experience">Experience (Optional)</Label>
                <Textarea id="experience" placeholder="Describe your childminding experience..." />
              </div>
              <div>
                <Label htmlFor="qualifications">Qualifications (Optional)</Label>
                <Textarea id="qualifications" placeholder="List your relevant qualifications..." />
              </div>
              <div>
                <Label htmlFor="availability">Availability (Optional)</Label>
                <Textarea id="availability" placeholder="Describe your availability..." />
              </div>
              <div>
                <Label htmlFor="serviceArea">Service Area (Optional)</Label>
                <Input id="serviceArea" placeholder="e.g., Dublin City Centre" />
              </div>
              <div>
                <Label htmlFor="hourlyRate">Hourly Rate (Optional)</Label>
                <Input id="hourlyRate" type="number" min="0" step="0.01" placeholder="e.g., 15.00" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-3xl shadow-xl p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Verification Status</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="gardaVetted">Garda Vetted</Label>
                <Switch id="gardaVetted" />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="tuslaRegistered">Tusla Registered</Label>
                <Switch id="tuslaRegistered" />
              </div>
            </div>
          </div>

          <Button type="submit" className="w-full">Complete Onboarding</Button>
        </form>
      </div>
    </div>
  )
}

