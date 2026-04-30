'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth/client'
import { Navbar } from '@/components/navbar'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Star, MessageSquare, AlertCircle, CheckCircle, Loader2, RefreshCw } from 'lucide-react'

interface Review {
  id: string
  platform: string
  author: string
  rating: number
  text: string
  published_at: string
  replied: boolean
  reply_text?: string
}

interface DraftResponse {
  id: string
  review_id: string
  ai_draft: string
  status: string
}

export default function ReputationPage() {
  const { user } = useAuth()
  const [reviews, setReviews] = useState<Review[]>([])
  const [googleReviews, setGoogleReviews] = useState<Review[]>([])
  const [yelpReviews, setYelpReviews] = useState<Review[]>([])
  const [drafts, setDrafts] = useState<DraftResponse[]>({})
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [activeTab, setActiveTab] = useState('all')
  const [expandedReview, setExpandedReview] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      loadReviews()
    }
  }, [user])

  const loadReviews = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('supabase.auth.token')
      if (!token) return

      // Fetch Google reviews
      const googleRes = await fetch('/api/integrations/google-reviews', {
        headers: { Authorization: `Bearer ${token}` },
      })

      // Fetch Yelp reviews
      const yelpRes = await fetch('/api/integrations/yelp-reviews', {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (googleRes.ok) {
        const data = await googleRes.json()
        setGoogleReviews(data.reviews || [])
      }

      if (yelpRes.ok) {
        const data = await yelpRes.json()
        setYelpReviews(data.reviews || [])
      }

      setReviews([...(googleRes.ok ? await googleRes.json().then(d => d.reviews || []) : []),
                  ...(yelpRes.ok ? await yelpRes.json().then(d => d.reviews || []) : [])])
    } catch (error) {
      console.error('Failed to load reviews:', error)
    } finally {
      setLoading(false)
    }
  }

  const syncReviews = async () => {
    setSyncing(true)
    await loadReviews()
    setSyncing(false)
  }

  const draftResponse = async (reviewId: string) => {
    try {
      const token = localStorage.getItem('supabase.auth.token')
      if (!token) return

      const res = await fetch('/api/integrations/reputation/draft-response', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ reviewId }),
      })

      if (res.ok) {
        const data = await res.json()
        setDrafts(prev => ({
          ...prev,
          [reviewId]: {
            id: data.responseId,
            review_id: reviewId,
            ai_draft: data.draft,
            status: 'draft'
          },
        }))
      }
    } catch (error) {
      console.error('Failed to draft response:', error)
    }
  }

  const submitResponse = async (reviewId: string, responseId: string, finalText: string) => {
    try {
      const token = localStorage.getItem('supabase.auth.token')
      if (!token) return

      const res = await fetch('/api/integrations/reputation/submit-response', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ responseId, finalResponse: finalText }),
      })

      if (res.ok) {
        setDrafts(prev => {
          const newDrafts = { ...prev }
          delete newDrafts[reviewId]
          return newDrafts
        })
        await loadReviews()
      }
    } catch (error) {
      console.error('Failed to submit response:', error)
    }
  }

  const ReviewCard = ({ review }: { review: Review }) => {
    const draft = drafts[review.id]
    const isDraft = draft?.status === 'draft'

    return (
      <Card key={review.id} className="p-4 mb-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-block px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-700">
                {review.platform}
              </span>
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={16}
                    className={i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                  />
                ))}
              </div>
            </div>
            <p className="font-medium text-sm">{review.author}</p>
            <p className="text-xs text-gray-500">
              {new Date(review.published_at).toLocaleDateString()}
            </p>
          </div>
          <div>
            {review.replied ? (
              <div className="flex items-center gap-1 text-green-600">
                <CheckCircle size={20} />
                <span className="text-xs font-medium">Replied</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 text-amber-600">
                <AlertCircle size={20} />
                <span className="text-xs font-medium">No Reply</span>
              </div>
            )}
          </div>
        </div>

        <p className="text-sm text-gray-700 mb-3">{review.text}</p>

        {review.replied && review.reply_text && (
          <div className="bg-gray-50 p-3 rounded mb-3 border-l-4 border-green-500">
            <p className="text-xs font-medium text-gray-600 mb-1">Your Reply:</p>
            <p className="text-sm text-gray-700">{review.reply_text}</p>
          </div>
        )}

        {!review.replied && (
          <div className="space-y-3">
            {isDraft && (
              <div className="bg-blue-50 p-3 rounded border border-blue-200">
                <p className="text-xs font-medium text-gray-600 mb-2">AI Draft:</p>
                <textarea
                  className="w-full p-2 text-sm border rounded mb-2"
                  rows={3}
                  defaultValue={draft?.ai_draft}
                  onChange={(e) => {
                    const newDrafts = { ...drafts }
                    if (newDrafts[review.id]) {
                      newDrafts[review.id].ai_draft = e.target.value
                    }
                    setDrafts(newDrafts)
                  }}
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => submitResponse(review.id, draft.id, draft?.ai_draft || '')}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Post Reply
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      const newDrafts = { ...drafts }
                      delete newDrafts[review.id]
                      setDrafts(newDrafts)
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            {!isDraft && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => draftResponse(review.id)}
                className="w-full"
              >
                <MessageSquare size={16} className="mr-2" />
                Draft Response
              </Button>
            )}
          </div>
        )}
      </Card>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[60vh]">
          <Loader2 className="animate-spin text-primary" size={32} />
        </div>
      </div>
    )
  }

  const allReviews = [...googleReviews, ...yelpReviews]
  const repliedCount = allReviews.filter(r => r.replied).length
  const pendingCount = allReviews.filter(r => !r.replied).length

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Reputation Management</h1>
          <p className="text-gray-600">Monitor and respond to customer reviews from Google and Yelp</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <Card className="p-6">
            <p className="text-sm text-gray-600 mb-1">Total Reviews</p>
            <p className="text-3xl font-bold">{allReviews.length}</p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-gray-600 mb-1">Replied</p>
            <p className="text-3xl font-bold text-green-600">{repliedCount}</p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-gray-600 mb-1">Pending Reply</p>
            <p className="text-3xl font-bold text-amber-600">{pendingCount}</p>
          </Card>
        </div>

        {/* Sync Button */}
        <div className="mb-6">
          <Button
            onClick={syncReviews}
            disabled={syncing}
            className="bg-primary hover:bg-primary/90"
          >
            {syncing ? (
              <>
                <Loader2 size={16} className="mr-2 animate-spin" />
                Syncing...
              </>
            ) : (
              <>
                <RefreshCw size={16} className="mr-2" />
                Sync Reviews
              </>
            )}
          </Button>
        </div>

        {/* Reviews Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="all">All Reviews ({allReviews.length})</TabsTrigger>
            <TabsTrigger value="google">Google ({googleReviews.length})</TabsTrigger>
            <TabsTrigger value="yelp">Yelp ({yelpReviews.length})</TabsTrigger>
            <TabsTrigger value="pending">Pending Reply ({pendingCount})</TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            {allReviews.length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-gray-500">No reviews found. Connect your Google and Yelp accounts to get started.</p>
              </Card>
            ) : (
              allReviews.map(review => <ReviewCard key={review.id} review={review} />)
            )}
          </TabsContent>

          <TabsContent value="google">
            {googleReviews.length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-gray-500">No Google reviews found yet.</p>
              </Card>
            ) : (
              googleReviews.map(review => <ReviewCard key={review.id} review={review} />)
            )}
          </TabsContent>

          <TabsContent value="yelp">
            {yelpReviews.length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-gray-500">No Yelp reviews found yet.</p>
              </Card>
            ) : (
              yelpReviews.map(review => <ReviewCard key={review.id} review={review} />)
            )}
          </TabsContent>

          <TabsContent value="pending">
            {allReviews.filter(r => !r.replied).length === 0 ? (
              <Card className="p-8 text-center">
                <CheckCircle size={48} className="mx-auto mb-4 text-green-600" />
                <p className="text-gray-600 font-medium">All caught up! You've replied to all reviews.</p>
              </Card>
            ) : (
              allReviews
                .filter(r => !r.replied)
                .map(review => <ReviewCard key={review.id} review={review} />)
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
