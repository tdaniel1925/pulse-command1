'use client'

import { useState, useEffect } from 'react'
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
  const [reviews, setReviews] = useState<Review[]>([])
  const [googleReviews, setGoogleReviews] = useState<Review[]>([])
  const [yelpReviews, setYelpReviews] = useState<Review[]>([])
  const [drafts, setDrafts] = useState<Record<string, DraftResponse>>({})
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [activeTab, setActiveTab] = useState('all')

  useEffect(() => {
    loadReviews()
  }, [])

  const loadReviews = async () => {
    try {
      setLoading(true)
      // Get token from localStorage or session
      let token = localStorage.getItem('supabase.auth.token')

      if (!token) {
        // Try to get from session storage
        token = sessionStorage.getItem('supabase.auth.token')
      }

      if (!token) {
        console.error('No auth token found')
        setLoading(false)
        return
      }

      // Fetch Google reviews
      const googleRes = await fetch('/api/integrations/google-reviews', {
        headers: { Authorization: `Bearer ${token}` },
      })

      // Fetch Yelp reviews
      const yelpRes = await fetch('/api/integrations/yelp-reviews', {
        headers: { Authorization: `Bearer ${token}` },
      })

      let gReviews: Review[] = []
      let yReviews: Review[] = []

      if (googleRes.ok) {
        const data = await googleRes.json()
        gReviews = data.reviews || []
        setGoogleReviews(gReviews)
      }

      if (yelpRes.ok) {
        const data = await yelpRes.json()
        yReviews = data.reviews || []
        setYelpReviews(yReviews)
      }

      setReviews([...gReviews, ...yReviews])
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


  if (loading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <Loader2 style={{ animation: 'spin 1s linear infinite' }} size={32} color="#3b82f6" />
        </div>
      </div>
    )
  }

  const allReviews = [...googleReviews, ...yelpReviews]
  const repliedCount = allReviews.filter(r => r.replied).length
  const pendingCount = allReviews.filter(r => !r.replied).length

  const renderReviewCard = (review: Review) => {
    const draft = drafts[review.id]
    const isDraft = draft?.status === 'draft'

    return (
      <div key={review.id} style={{ marginBottom: '1rem', border: '1px solid #e5e7eb', borderRadius: '0.5rem', padding: '1rem', backgroundColor: 'white' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
          <div>
            <div style={{ marginBottom: '0.5rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <span style={{ display: 'inline-block', padding: '0.25rem 0.5rem', borderRadius: '0.25rem', fontSize: '0.75rem', fontWeight: '500', backgroundColor: '#dbeafe', color: '#1e40af' }}>
                {review.platform}
              </span>
              <div style={{ display: 'flex', gap: '0.125rem' }}>
                {[0, 1, 2, 3, 4].map(i => (
                  <Star
                    key={i}
                    size={16}
                    style={{
                      fill: i < review.rating ? '#fbbf24' : '#d1d5db',
                      color: i < review.rating ? '#fbbf24' : '#d1d5db',
                    }}
                  />
                ))}
              </div>
            </div>
            <p style={{ fontWeight: '500', fontSize: '0.875rem' }}>{review.author}</p>
            <p style={{ fontSize: '0.75rem', color: '#6b7280' }}>
              {new Date(review.published_at).toLocaleDateString()}
            </p>
          </div>
          <div>
            {review.replied ? (
              <div style={{ display: 'flex', gap: '0.25rem', alignItems: 'center', color: '#16a34a' }}>
                <CheckCircle size={20} />
                <span style={{ fontSize: '0.75rem', fontWeight: '500' }}>Replied</span>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: '0.25rem', alignItems: 'center', color: '#b45309' }}>
                <AlertCircle size={20} />
                <span style={{ fontSize: '0.75rem', fontWeight: '500' }}>No Reply</span>
              </div>
            )}
          </div>
        </div>

        <p style={{ fontSize: '0.875rem', color: '#374151', marginBottom: '0.75rem' }}>{review.text}</p>

        {review.replied && review.reply_text && (
          <div style={{ backgroundColor: '#f3f4f6', padding: '0.75rem', borderRadius: '0.25rem', marginBottom: '0.75rem', borderLeft: '4px solid #16a34a' }}>
            <p style={{ fontSize: '0.75rem', fontWeight: '500', color: '#4b5563', marginBottom: '0.25rem' }}>Your Reply:</p>
            <p style={{ fontSize: '0.875rem', color: '#374151' }}>{review.reply_text}</p>
          </div>
        )}

        {!review.replied && (
          <div>
            {isDraft && (
              <div style={{ backgroundColor: '#eff6ff', padding: '0.75rem', borderRadius: '0.25rem', border: '1px solid #bfdbfe' }}>
                <p style={{ fontSize: '0.75rem', fontWeight: '500', color: '#4b5563', marginBottom: '0.5rem' }}>AI Draft:</p>
                <textarea
                  style={{ width: '100%', padding: '0.5rem', fontSize: '0.875rem', border: '1px solid #d1d5db', borderRadius: '0.25rem', marginBottom: '0.5rem', fontFamily: 'inherit' }}
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
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    onClick={() => submitResponse(review.id, draft.id, draft?.ai_draft || '')}
                    style={{ padding: '0.5rem 1rem', backgroundColor: '#16a34a', color: 'white', border: 'none', borderRadius: '0.25rem', fontSize: '0.875rem', cursor: 'pointer' }}
                  >
                    Post Reply
                  </button>
                  <button
                    onClick={() => {
                      const newDrafts = { ...drafts }
                      delete newDrafts[review.id]
                      setDrafts(newDrafts)
                    }}
                    style={{ padding: '0.5rem 1rem', backgroundColor: 'white', color: '#374151', border: '1px solid #d1d5db', borderRadius: '0.25rem', fontSize: '0.875rem', cursor: 'pointer' }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {!isDraft && (
              <button
                onClick={() => draftResponse(review.id)}
                style={{ width: '100%', padding: '0.5rem', backgroundColor: 'white', color: '#374151', border: '1px solid #d1d5db', borderRadius: '0.25rem', fontSize: '0.875rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
              >
                <MessageSquare size={16} />
                Draft Response
              </button>
            )}
          </div>
        )}
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1rem' }}>
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Reputation Management</h1>
          <p style={{ color: '#4b5563' }}>Monitor and respond to customer reviews from Google and Yelp</p>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
          <div style={{ border: '1px solid #e5e7eb', borderRadius: '0.5rem', padding: '1.5rem', backgroundColor: 'white' }}>
            <p style={{ fontSize: '0.875rem', color: '#4b5563', marginBottom: '0.25rem' }}>Total Reviews</p>
            <p style={{ fontSize: '1.875rem', fontWeight: 'bold' }}>{allReviews.length}</p>
          </div>
          <div style={{ border: '1px solid #e5e7eb', borderRadius: '0.5rem', padding: '1.5rem', backgroundColor: 'white' }}>
            <p style={{ fontSize: '0.875rem', color: '#4b5563', marginBottom: '0.25rem' }}>Replied</p>
            <p style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#16a34a' }}>{repliedCount}</p>
          </div>
          <div style={{ border: '1px solid #e5e7eb', borderRadius: '0.5rem', padding: '1.5rem', backgroundColor: 'white' }}>
            <p style={{ fontSize: '0.875rem', color: '#4b5563', marginBottom: '0.25rem' }}>Pending Reply</p>
            <p style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#b45309' }}>{pendingCount}</p>
          </div>
        </div>

        {/* Sync Button */}
        <div style={{ marginBottom: '1.5rem' }}>
          <button
            onClick={syncReviews}
            disabled={syncing}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: syncing ? '#e5e7eb' : '#3b82f6',
              color: syncing ? '#6b7280' : 'white',
              border: 'none',
              borderRadius: '0.25rem',
              fontSize: '0.875rem',
              cursor: syncing ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            {syncing ? (
              <>
                <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                Syncing...
              </>
            ) : (
              <>
                <RefreshCw size={16} />
                Sync Reviews
              </>
            )}
          </button>
        </div>

        {/* Tab Navigation */}
        <div style={{ display: 'flex', borderBottom: '1px solid #e5e7eb', marginBottom: '1.5rem', gap: '0' }}>
          {['all', 'google', 'yelp', 'pending'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '0.75rem 1rem',
                backgroundColor: activeTab === tab ? 'white' : 'transparent',
                color: activeTab === tab ? '#3b82f6' : '#6b7280',
                border: activeTab === tab ? '1px solid #e5e7eb' : 'none',
                borderBottom: activeTab === tab ? '2px solid #3b82f6' : '1px solid #e5e7eb',
                cursor: 'pointer',
                fontSize: '0.875rem',
              }}
            >
              {tab === 'all' && `All Reviews (${allReviews.length})`}
              {tab === 'google' && `Google (${googleReviews.length})`}
              {tab === 'yelp' && `Yelp (${yelpReviews.length})`}
              {tab === 'pending' && `Pending Reply (${pendingCount})`}
            </button>
          ))}
        </div>

        {/* Reviews List */}
        {activeTab === 'all' && (
          <div>
            {allReviews.length === 0 ? (
              <div style={{ border: '1px solid #e5e7eb', borderRadius: '0.5rem', padding: '2rem', textAlign: 'center', backgroundColor: 'white' }}>
                <p style={{ color: '#6b7280' }}>No reviews found. Connect your Google and Yelp accounts to get started.</p>
              </div>
            ) : (
              allReviews.map(review => renderReviewCard(review))
            )}
          </div>
        )}

        {activeTab === 'google' && (
          <div>
            {googleReviews.length === 0 ? (
              <div style={{ border: '1px solid #e5e7eb', borderRadius: '0.5rem', padding: '2rem', textAlign: 'center', backgroundColor: 'white' }}>
                <p style={{ color: '#6b7280' }}>No Google reviews found yet.</p>
              </div>
            ) : (
              googleReviews.map(review => renderReviewCard(review))
            )}
          </div>
        )}

        {activeTab === 'yelp' && (
          <div>
            {yelpReviews.length === 0 ? (
              <div style={{ border: '1px solid #e5e7eb', borderRadius: '0.5rem', padding: '2rem', textAlign: 'center', backgroundColor: 'white' }}>
                <p style={{ color: '#6b7280' }}>No Yelp reviews found yet.</p>
              </div>
            ) : (
              yelpReviews.map(review => renderReviewCard(review))
            )}
          </div>
        )}

        {activeTab === 'pending' && (
          <div>
            {allReviews.filter(r => !r.replied).length === 0 ? (
              <div style={{ border: '1px solid #e5e7eb', borderRadius: '0.5rem', padding: '2rem', textAlign: 'center', backgroundColor: 'white' }}>
                <CheckCircle size={48} style={{ margin: '0 auto 1rem', color: '#16a34a' }} />
                <p style={{ color: '#4b5563', fontWeight: '500' }}>All caught up! You've replied to all reviews.</p>
              </div>
            ) : (
              allReviews
                .filter(r => !r.replied)
                .map(review => renderReviewCard(review))
            )}
          </div>
        )}
      </div>
    </div>
  )
}
