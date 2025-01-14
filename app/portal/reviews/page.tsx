import { useState, useEffect } from 'react'
import { showSuccessToast, showErrorToast, REVIEW_POSTED, REVIEW_ERROR } from '@/lib/utils/toast'

interface Review {
  id: number
  rating: number
  comment: string
  childminderId: string
  createdAt: Date
}

export default function ReviewsPage() {
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [childminderId, setChildminderId] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [reviews, setReviews] = useState<Review[]>([])

  const fetchReviews = async () => {
    try {
      const response = await fetch('/api/reviews')
      if (!response.ok) throw new Error('Failed to fetch reviews')
      const data = await response.json()
      setReviews(data)
    } catch (error) {
      showErrorToast('Failed to fetch reviews')
    }
  }

  useEffect(() => {
    fetchReviews()
  }, [])

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!rating || !comment || !childminderId) {
      showErrorToast('Missing Information', 'Please fill in all required fields')
      return
    }

    setSubmitting(true)
    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          childminderId,
          rating,
          comment,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || REVIEW_ERROR)
      }

      showSuccessToast(REVIEW_POSTED, 'Thank you for sharing your experience!')
      // Reset form
      setRating(0)
      setComment('')
      setChildminderId('')
      // Refresh reviews list
      fetchReviews()
    } catch (error) {
      showErrorToast(
        REVIEW_ERROR,
        error instanceof Error ? error.message : 'Please try again later.',
        {
          action: {
            label: 'Try Again',
            onClick: () => handleSubmitReview(e)
          }
        }
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
      {/* Add your JSX for the reviews page */}
    </div>
  )
} 