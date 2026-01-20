'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-toastify'
import Link from 'next/link'

interface ComplaintResult {
  request_id: string
  whatsapp_message: string
  email_subject: string
  email_body: string
  escalation_subject: string
  escalation_body: string
  followup_message: string
  tips: string[]
  required_placeholders: string[]
}

export default function ResultPage() {
  const router = useRouter()
  const [result, setResult] = useState<ComplaintResult | null>(null)
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({
    whatsapp: false,
    email: false,
    escalation: false,
    followup: false,
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Get result from sessionStorage
    const stored = sessionStorage.getItem('complaintResult')
    if (!stored) {
      router.push('/builder')
      return
    }
    
    try {
      setResult(JSON.parse(stored))
    } catch (error) {
      console.error('Error parsing result:', error)
      router.push('/builder')
    }
  }, [router])

  const toggleExpand = (card: string) => {
    setExpandedCards(prev => ({ ...prev, [card]: !prev[card] }))
  }

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast.success(`${label} copied to clipboard!`)
    } catch (error) {
      toast.error('Failed to copy to clipboard')
    }
  }

  const downloadPDF = (content: string, filename: string) => {
    // Simple text download - in production, use a proper PDF library
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast.success('Download started!')
  }

  const handleGenerateAgain = () => {
    router.push('/builder')
  }

  const handleEditInputs = () => {
    router.push('/builder')
  }

  if (!result) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading results...</p>
        </div>
      </div>
    )
  }

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text
    return text.slice(0, maxLength) + '...'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">E</span>
              </div>
              <span className="text-xl font-bold text-gray-900">EscalateAI</span>
            </Link>
            <div className="flex items-center space-x-4">
              <button onClick={handleEditInputs} className="btn-secondary text-sm">
                Edit Inputs
              </button>
              <button onClick={handleGenerateAgain} className="btn-primary text-sm">
                Generate Again
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Success Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Complaint Generated!</h1>
              <p className="text-gray-600">Your professional complaint drafts are ready</p>
            </div>
          </div>
          
          {result.required_placeholders.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-yellow-600 mt-0.5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div>
                  <h3 className="text-sm font-semibold text-yellow-800 mb-1">Replace Placeholders</h3>
                  <p className="text-sm text-yellow-700">
                    Before sending, replace these placeholders: {result.required_placeholders.join(', ')}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Tips Section */}
        {result.tips && result.tips.length > 0 && (
          <div className="card mb-8 bg-primary-50 border-primary-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">💡 Tips</h2>
            <ul className="space-y-2">
              {result.tips.map((tip, index) => (
                <li key={index} className="text-gray-700 flex items-start">
                  <span className="text-primary-600 mr-2">•</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Output Cards */}
        <div className="grid gap-6">
          {/* WhatsApp Message */}
          <div className="card">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">WhatsApp Message</h2>
                  <p className="text-sm text-gray-500">Ready to send via WhatsApp</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => copyToClipboard(result.whatsapp_message, 'WhatsApp message')}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Copy
                </button>
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-gray-800 whitespace-pre-wrap">
                {expandedCards.whatsapp 
                  ? result.whatsapp_message 
                  : truncateText(result.whatsapp_message, 300)}
              </p>
              {result.whatsapp_message.length > 300 && (
                <button
                  onClick={() => toggleExpand('whatsapp')}
                  className="mt-2 text-sm text-primary-600 hover:text-primary-700 font-medium"
                >
                  {expandedCards.whatsapp ? 'Show less' : 'Show more'}
                </button>
              )}
            </div>
          </div>

          {/* Email Complaint */}
          <div className="card">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Email Complaint</h2>
                  <p className="text-sm text-gray-500">Professional email format</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => copyToClipboard(`${result.email_subject}\n\n${result.email_body}`, 'Email')}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Copy
                </button>
                <button
                  onClick={() => downloadPDF(`${result.email_subject}\n\n${result.email_body}`, 'complaint-email.txt')}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Download
                </button>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Subject:</label>
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                  <p className="text-gray-800 font-medium">{result.email_subject}</p>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Body:</label>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-800 whitespace-pre-wrap">
                    {expandedCards.email 
                      ? result.email_body 
                      : truncateText(result.email_body, 400)}
                  </p>
                  {result.email_body.length > 400 && (
                    <button
                      onClick={() => toggleExpand('email')}
                      className="mt-2 text-sm text-primary-600 hover:text-primary-700 font-medium"
                    >
                      {expandedCards.email ? 'Show less' : 'Show more'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Escalation Email */}
          <div className="card">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Escalation Email</h2>
                  <p className="text-sm text-gray-500">For higher authorities</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => copyToClipboard(`${result.escalation_subject}\n\n${result.escalation_body}`, 'Escalation email')}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Copy
                </button>
                <button
                  onClick={() => downloadPDF(`${result.escalation_subject}\n\n${result.escalation_body}`, 'escalation-email.txt')}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Download
                </button>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Subject:</label>
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                  <p className="text-gray-800 font-medium">{result.escalation_subject}</p>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Body:</label>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-800 whitespace-pre-wrap">
                    {expandedCards.escalation 
                      ? result.escalation_body 
                      : truncateText(result.escalation_body, 400)}
                  </p>
                  {result.escalation_body.length > 400 && (
                    <button
                      onClick={() => toggleExpand('escalation')}
                      className="mt-2 text-sm text-primary-600 hover:text-primary-700 font-medium"
                    >
                      {expandedCards.escalation ? 'Show less' : 'Show more'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Follow-up Message */}
          <div className="card">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Follow-up Message</h2>
                  <p className="text-sm text-gray-500">For future reference</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => copyToClipboard(result.followup_message, 'Follow-up message')}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Copy
                </button>
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-gray-800 whitespace-pre-wrap">
                {expandedCards.followup 
                  ? result.followup_message 
                  : truncateText(result.followup_message, 300)}
              </p>
              {result.followup_message.length > 300 && (
                <button
                  onClick={() => toggleExpand('followup')}
                  className="mt-2 text-sm text-primary-600 hover:text-primary-700 font-medium"
                >
                  {expandedCards.followup ? 'Show less' : 'Show more'}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <button onClick={handleEditInputs} className="btn-secondary">
            Edit Inputs
          </button>
          <button onClick={handleGenerateAgain} className="btn-primary">
            Generate New Complaint
          </button>
        </div>
      </main>
    </div>
  )
}

