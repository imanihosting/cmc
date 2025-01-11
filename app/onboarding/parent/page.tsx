'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

export default function ParentOnboarding() {
  const [user, setUser] = useState({ name: '', email: '' })
  const [children, setChildren] = useState([{ name: '', dob: '', gender: '', additionalInfo: '' }])

  const addChild = () => {
    setChildren([...children, { name: '', dob: '', gender: '', additionalInfo: '' }])
  }

  const handleChildChange = (index, field, value) => {
    const updatedChildren = [...children]
    updatedChildren[index][field] = value
    setChildren(updatedChildren)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    // Handle form submission here
    console.log('Form submitted:', { user, children })
  }

  return (
    <div className="bg-white min-h-screen py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-center text-gray-900 mb-8">Parent Onboarding</h1>
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

          {children.map((child, index) => (
            <div key={index} className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-3xl shadow-xl p-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Child Information {index + 1}</h2>
              <div className="space-y-4">
                <div>
                  <Label htmlFor={`childName-${index}`}>Child's Name</Label>
                  <Input 
                    id={`childName-${index}`} 
                    value={child.name} 
                    onChange={(e) => handleChildChange(index, 'name', e.target.value)}
                    required 
                  />
                </div>
                <div>
                  <Label htmlFor={`childDob-${index}`}>Date of Birth</Label>
                  <Input 
                    id={`childDob-${index}`} 
                    type="date" 
                    value={child.dob} 
                    onChange={(e) => handleChildChange(index, 'dob', e.target.value)}
                    required 
                  />
                </div>
                <div>
                  <Label>Gender</Label>
                  <RadioGroup 
                    value={child.gender} 
                    onValueChange={(value) => handleChildChange(index, 'gender', value)}
                    required
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="male" id={`male-${index}`} />
                      <Label htmlFor={`male-${index}`}>Male</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="female" id={`female-${index}`} />
                      <Label htmlFor={`female-${index}`}>Female</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="other" id={`other-${index}`} />
                      <Label htmlFor={`other-${index}`}>Other</Label>
                    </div>
                  </RadioGroup>
                </div>
                <div>
                  <Label htmlFor={`childInfo-${index}`}>Additional Info (Optional)</Label>
                  <Textarea 
                    id={`childInfo-${index}`} 
                    value={child.additionalInfo} 
                    onChange={(e) => handleChildChange(index, 'additionalInfo', e.target.value)}
                  />
                </div>
              </div>
            </div>
          ))}

          <Button type="button" onClick={addChild} className="w-full">Add Another Child</Button>

          <Button type="submit" className="w-full">Complete Onboarding</Button>
        </form>
      </div>
    </div>
  )
}

