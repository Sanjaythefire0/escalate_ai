'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-toastify'

type Category = 
  | 'college_hostel' 
  | 'internet_network' 
  | 'ecommerce_refund' 
  | 'banking_upi' 
  | 'rent_landlord' 
  | 'workplace_hr' 
  | 'courier_delivery' 
  | 'hospital_billing'

type Tone = 'polite' | 'firm' | 'strict'

interface FormData {
  category: Category | ''
  tone: Tone | ''
  title: string
  description: string
  incident_date: string
  location: string
  company_or_institution: string
  recipient_name: string
  order_or_ticket_id: string
  desired_resolution: string
  proof_available: boolean
}

const STEPS = [
  { id: 1, name: 'Category & Tone', description: 'Choose your complaint type' },
  { id: 2, name: 'Incident Details', description: 'Describe what happened' },
  { id: 3, name: 'Recipient & Resolution', description: 'Who and what you want' },
]

const CATEGORIES = {
  college_hostel: 'College/Hostel Issues',
  internet_network: 'Internet/Network Problems',
  ecommerce_refund: 'E-commerce Refund',
  banking_upi: 'Banking/UPI Issues',
  rent_landlord: 'Rent/Landlord Disputes',
  workplace_hr: 'Workplace/HR Issues',
  courier_delivery: 'Courier/Delivery Problems',
  hospital_billing: 'Hospital/Billing Issues',
}

export default function BuilderPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({})
  
  const [formData, setFormData] = useState<FormData>({
    category: '',
    tone: '',
    title: '',
    description: '',
    incident_date: '',
    location: '',
    company_or_institution: '',
    recipient_name: '',
    order_or_ticket_id: '',
    desired_resolution: '',
    proof_available: false,
  })

  const updateField = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const validateStep = (step: number): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {}

    if (step === 1) {
      if (!formData.category) newErrors.category = 'Please select a category'
      if (!formData.tone) newErrors.tone = 'Please select a tone'
    }

    if (step === 2) {
      if (!formData.title || formData.title.length < 5) {
        newErrors.title = 'Title must be at least 5 characters'
      }
      if (!formData.description || formData.description.length < 20) {
        newErrors.description = 'Description must be at least 20 characters'
      }
    }

    if (step === 3) {
      if (!formData.desired_resolution || formData.desired_resolution.length < 5) {
        newErrors.desired_resolution = 'Desired resolution must be at least 5 characters'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 3))
    }
  }

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1))
  }

  const handleSubmit = async () => {
    if (!validateStep(3)) {
      return
    }

    setLoading(true)
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
      const response = await fetch(`${apiUrl}/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.detail || 'Failed to generate complaint')
      }

      const result = await response.json()
      
      // Store in sessionStorage and redirect
      sessionStorage.setItem('complaintResult', JSON.stringify(result))
      router.push('/result')
    } catch (error: any) {
      toast.error(error.message || 'Failed to generate complaint. Please try again.')
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <a href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">E</span>
              </div>
              <span className="text-xl font-bold text-gray-900">EscalateAI</span>
            </a>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Stepper */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-8">
            {STEPS.map((step, index) => (
              <div key={step.id} className="flex-1 flex items-center">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors ${
                      currentStep >= step.id
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {step.id}
                  </div>
                  <div className="mt-2 text-center">
                    <div className={`text-sm font-medium ${
                      currentStep >= step.id ? 'text-gray-900' : 'text-gray-500'
                    }`}>
                      {step.name}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">{step.description}</div>
                  </div>
                </div>
                {index < STEPS.length - 1 && (
                  <div
                    className={`h-0.5 flex-1 mx-2 transition-colors ${
                      currentStep > step.id ? 'bg-primary-600' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form Card */}
        <div className="card mb-8">
          {/* Step 1: Category & Tone */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Category & Tone</h2>
                <p className="text-gray-600">Select the type of complaint and the tone you want to use</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Complaint Category <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => updateField('category', e.target.value)}
                  className={`input-field ${errors.category ? 'border-red-500' : ''}`}
                >
                  <option value="">Select a category</option>
                  {Object.entries(CATEGORIES).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
                {errors.category && (
                  <p className="mt-1 text-sm text-red-600">{errors.category}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tone <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {(['polite', 'firm', 'strict'] as Tone[]).map((tone) => (
                    <button
                      key={tone}
                      type="button"
                      onClick={() => updateField('tone', tone)}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        formData.tone === tone
                          ? 'border-primary-600 bg-primary-50'
                          : 'border-gray-200 hover:border-gray-300'
                      } ${errors.tone ? 'border-red-500' : ''}`}
                    >
                      <div className="font-semibold text-gray-900 capitalize mb-1">{tone}</div>
                      <div className="text-sm text-gray-600">
                        {tone === 'polite' && 'Courteous and respectful'}
                        {tone === 'firm' && 'Direct with clear expectations'}
                        {tone === 'strict' && 'Formal and demanding'}
                      </div>
                    </button>
                  ))}
                </div>
                {errors.tone && (
                  <p className="mt-1 text-sm text-red-600">{errors.tone}</p>
                )}
              </div>
            </div>
          )}

          {/* Step 2: Incident Details */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Incident Details</h2>
                <p className="text-gray-600">Tell us what happened and when</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Complaint Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => updateField('title', e.target.value)}
                  placeholder="e.g., Delayed refund for order #12345"
                  className={`input-field ${errors.title ? 'border-red-500' : ''}`}
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-600">{errors.title}</p>
                )}
                <p className="mt-1 text-sm text-gray-500">A brief summary of your complaint (min. 5 characters)</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => updateField('description', e.target.value)}
                  rows={6}
                  placeholder="Describe the incident in detail. Include what happened, when it occurred, and how it affected you..."
                  className={`input-field ${errors.description ? 'border-red-500' : ''}`}
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                )}
                <p className="mt-1 text-sm text-gray-500">Detailed description (min. 20 characters)</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Incident Date
                  </label>
                  <input
                    type="date"
                    value={formData.incident_date}
                    onChange={(e) => updateField('incident_date', e.target.value)}
                    className="input-field"
                  />
                  <p className="mt-1 text-sm text-gray-500">When did this happen?</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => updateField('location', e.target.value)}
                    placeholder="e.g., Mumbai, India"
                    className="input-field"
                  />
                  <p className="mt-1 text-sm text-gray-500">Where did this occur?</p>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Recipient & Resolution */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Recipient & Resolution</h2>
                <p className="text-gray-600">Who are you contacting and what do you want?</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company/Institution
                  </label>
                  <input
                    type="text"
                    value={formData.company_or_institution}
                    onChange={(e) => updateField('company_or_institution', e.target.value)}
                    placeholder="e.g., Amazon India"
                    className="input-field"
                  />
                  <p className="mt-1 text-sm text-gray-500">Name of the organization</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Recipient Name
                  </label>
                  <input
                    type="text"
                    value={formData.recipient_name}
                    onChange={(e) => updateField('recipient_name', e.target.value)}
                    placeholder="e.g., Customer Support Team"
                    className="input-field"
                  />
                  <p className="mt-1 text-sm text-gray-500">Who should receive this?</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Order/Ticket ID
                </label>
                <input
                  type="text"
                  value={formData.order_or_ticket_id}
                  onChange={(e) => updateField('order_or_ticket_id', e.target.value)}
                  placeholder="e.g., #12345 or REF-789012"
                  className="input-field"
                />
                <p className="mt-1 text-sm text-gray-500">Reference number if available</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Desired Resolution <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.desired_resolution}
                  onChange={(e) => updateField('desired_resolution', e.target.value)}
                  rows={4}
                  placeholder="What resolution are you seeking? e.g., Full refund of ₹5,000 within 7 business days..."
                  className={`input-field ${errors.desired_resolution ? 'border-red-500' : ''}`}
                />
                {errors.desired_resolution && (
                  <p className="mt-1 text-sm text-red-600">{errors.desired_resolution}</p>
                )}
                <p className="mt-1 text-sm text-gray-500">Be specific about what you want (min. 5 characters)</p>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="proof_available"
                  checked={formData.proof_available}
                  onChange={(e) => updateField('proof_available', e.target.checked)}
                  className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
                <label htmlFor="proof_available" className="ml-2 text-sm text-gray-700">
                  I have proof/documentation available (receipts, screenshots, etc.)
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between">
          <button
            onClick={handleBack}
            disabled={currentStep === 1}
            className="btn-secondary"
          >
            Back
          </button>

          {currentStep < 3 ? (
            <button
              onClick={handleNext}
              className="btn-primary"
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="btn-primary"
            >
              {loading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generating...
                </span>
              ) : (
                'Generate Complaint'
              )}
            </button>
          )}
        </div>
      </main>
    </div>
  )
}

