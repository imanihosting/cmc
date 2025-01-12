'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@clerk/nextjs'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

export default function ParentOnboarding() {
  const router = useRouter()
  const { isLoaded, userId } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [children, setChildren] = useState([{ name: '', dob: '', gender: '', additionalInfo: '' }])

  // Add auth check effect
  useEffect(() => {
    if (isLoaded && !userId) {
      router.push('/sign-in');
    }
  }, [isLoaded, userId, router]);

  if (!isLoaded || !userId) {
    return null;
  }

  const addChild = () => {
    setChildren([...children, { name: '', dob: '', gender: '', additionalInfo: '' }])
  }

  const handleChildChange = (index: number, field: string, value: string) => {
    const updatedChildren = [...children]
    updatedChildren[index] = { ...updatedChildren[index], [field]: value }
    setChildren(updatedChildren)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/onboarding/parent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ children })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to complete onboarding');
      }

      console.log('Parent onboarding successful, waiting for metadata update...');
      
      // Add delay to ensure Clerk metadata is updated
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      console.log('Redirecting to parent portal...');
      router.push('/portal/parent');

    } catch (error: any) {
      console.error('Error during onboarding:', error);
      setError(error.message || 'Failed to complete onboarding. Please try again.');
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white min-h-screen py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-center text-gray-900 mb-8">Parent Onboarding</h1>
        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-8">
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

          <Button 
            type="button" 
            onClick={addChild} 
            className="w-full"
            disabled={loading}
          >
            Add Another Child
          </Button>

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