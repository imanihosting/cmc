'use client'

import { Baby, Users } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@clerk/nextjs'

export default function RoleSelection() {
  const router = useRouter()
  const { isLoaded, userId } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Handle auth redirects in useEffect
  useEffect(() => {
    if (isLoaded && !userId) {
      router.push('/sign-in')
    }
  }, [isLoaded, userId, router])

  // Return null while checking auth
  if (!isLoaded || !userId) {
    return null
  }

  const handleRoleSelect = async (role: 'parent' | 'childminder') => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/role', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to set role');
      }

      // Wait for a moment to ensure role is set
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Use router.push for navigation
      if (role === 'parent') {
        router.push('/onboarding/parent');
      } else {
        router.push('/onboarding/childminder');
      }
    } catch (error: any) {
      console.error('Error setting role:', error);
      setError(error.message || 'Failed to set role. Please try again.');
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Choose Your Role</h1>
          <p className="text-xl text-gray-600">Are you looking for childcare or offering childminding services?</p>
          {error && (
            <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-lg">
              {error}
            </div>
          )}
        </div>
        <div className="grid md:grid-cols-2 gap-8">
          <div 
            onClick={() => !loading && handleRoleSelect('parent')}
            className={`cursor-pointer ${loading ? 'opacity-50 pointer-events-none' : ''}`}
          >
            <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-3xl shadow-xl p-8 text-center hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
              <Users className="h-16 w-16 text-purple-600 mx-auto mb-4" />
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">I'm a Parent</h2>
              <p className="text-gray-600">Find trusted childminders for your little ones</p>
            </div>
          </div>
          <div 
            onClick={() => !loading && handleRoleSelect('childminder')}
            className={`cursor-pointer ${loading ? 'opacity-50 pointer-events-none' : ''}`}
          >
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-3xl shadow-xl p-8 text-center hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
              <Baby className="h-16 w-16 text-indigo-600 mx-auto mb-4" />
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">I'm a Childminder</h2>
              <p className="text-gray-600">Offer your childminding services to families</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}