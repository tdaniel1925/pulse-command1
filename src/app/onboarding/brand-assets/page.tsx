'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import OnboardingNav from '@/components/OnboardingNav'
import {
  Globe,
  Loader2,
  CheckCircle2,
  Pencil,
  Upload,
  ArrowRight,
  ImageIcon,
  Palette,
  Mic2,
  Building2,
} from 'lucide-react'

const TONE_OPTIONS = [
  'Professional',
  'Friendly',
  'Bold',
  'Authoritative',
  'Casual',
  'Inspirational',
]

const INDUSTRIES = [
  'Healthcare',
  'Finance',
  'Real Estate',
  'Fitness & Wellness',
  'Food & Beverage',
  'Legal',
  'Education',
  'Technology',
  'Retail',
  'Home Services',
  'Beauty & Personal Care',
  'Other',
]

interface ScanData {
  businessName?: string
  tagline?: string
  description?: string
  industry?: string
  primaryColor?: string
  toneOfVoice?: string
  logoUrl?: string
}

export default function BrandAssetsPage() {
  const router = useRouter()

  // Website scan state
  const [websiteUrl, setWebsiteUrl] = useState('')
  const [scanning, setScanning] = useState(false)
  const [scanned, setScanned] = useState(false)
  const [scanData, setScanData] = useState<ScanData | null>(null)
  const [scanError, setScanError] = useState('')
  const [editingScan, setEditingScan] = useState(false)

  // Brand color state
  const [primaryColor, setPrimaryColor] = useState('#2563eb')
  const [secondaryColor, setSecondaryColor] = useState('#1e40af')

  // Logo state
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreviewUrl, setLogoPreviewUrl] = useState('')
  const [logoStorageUrl, setLogoStorageUrl] = useState('')
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [useScannedLogo, setUseScannedLogo] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Brand voice state
  const [toneOfVoice, setToneOfVoice] = useState('')
  const [industry, setIndustry] = useState('')
  const [businessDescription, setBusinessDescription] = useState('')

  // Save state
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')

  async function handleScan() {
    if (!websiteUrl.trim()) return
    setScanning(true)
    setScanError('')
    try {
      const res = await fetch('/api/onboarding/scan-website', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: websiteUrl.trim() }),
      })
      const json = await res.json()
      if (!res.ok || !json.success) {
        setScanError(json.error ?? 'Scan failed. Please try again.')
      } else {
        const d: ScanData = json.data
        setScanData(d)
        setScanned(true)
        setEditingScan(false)
        if (d.primaryColor) setPrimaryColor(d.primaryColor)
        if (d.toneOfVoice) {
          const matched = TONE_OPTIONS.find(
            (t) => t.toLowerCase() === d.toneOfVoice?.toLowerCase()
          )
          if (matched) setToneOfVoice(matched)
        }
        if (d.industry) {
          const matched = INDUSTRIES.find(
            (i) => i.toLowerCase() === d.industry?.toLowerCase()
          )
          if (matched) setIndustry(matched)
        }
        if (d.description) setBusinessDescription(d.description)
        if (d.logoUrl) setUseScannedLogo(false) // don't auto-select, let user choose
      }
    } catch {
      setScanError('Scan failed. Check your connection and try again.')
    } finally {
      setScanning(false)
    }
  }

  async function handleLogoFile(file: File) {
    setLogoFile(file)
    setLogoPreviewUrl(URL.createObjectURL(file))
    setUseScannedLogo(false)
    setUploadingLogo(true)
    try {
      const form = new FormData()
      form.append('logo', file)
      const res = await fetch('/api/onboarding/upload-logo', {
        method: 'POST',
        body: form,
      })
      const json = await res.json()
      if (json.success && json.url) {
        setLogoStorageUrl(json.url)
      }
    } catch {
      // Keep local preview; storage URL stays empty — will skip saving
    } finally {
      setUploadingLogo(false)
    }
  }

  function handleFileInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) handleLogoFile(file)
  }

  function handleDropZoneDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (file) handleLogoFile(file)
  }

  async function handleContinue() {
    setSaving(true)
    setSaveError('')
    try {
      const effectiveLogoUrl = useScannedLogo
        ? scanData?.logoUrl ?? ''
        : logoStorageUrl

      const res = await fetch('/api/onboarding/save-brand-assets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          primaryColor,
          secondaryColor,
          logoUrl: effectiveLogoUrl,
          businessDescription,
          tagline: scanData?.tagline ?? '',
          industry,
          website: websiteUrl.trim() || undefined,
          toneOfVoice,
        }),
      })
      const json = await res.json()
      if (!res.ok || !json.success) {
        setSaveError(json.error ?? 'Could not save. Please try again.')
        setSaving(false)
        return
      }
      router.push('/onboarding/record-video')
    } catch {
      setSaveError('Something went wrong. Please try again.')
      setSaving(false)
    }
  }

  const effectiveLogoPreview = useScannedLogo
    ? scanData?.logoUrl
    : logoPreviewUrl || undefined

  return (
    <>
      <OnboardingNav current="brand-assets" />

      <main className="min-h-screen bg-neutral-50">
        {/* Header banner */}
        <div className="bg-gradient-to-r from-primary-700 via-primary-600 to-indigo-600 py-12 px-4 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            Set Up Your Brand
          </h1>
          <p className="text-primary-100 text-base max-w-xl mx-auto">
            We&apos;ll use this to make sure every piece of content looks and sounds like you.
          </p>
        </div>

        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">

          {/* Section 1: Website Scan */}
          <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-6">
            <div className="flex items-center gap-2 mb-1">
              <Globe className="w-5 h-5 text-primary-600" />
              <h2 className="text-base font-bold text-neutral-900">Your Website</h2>
            </div>
            <p className="text-xs text-neutral-500 mb-4">
              Paste your website URL and we&apos;ll pull your brand info automatically.
            </p>

            <div className="flex gap-2">
              <input
                type="url"
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleScan()}
                placeholder="https://yourbusiness.com"
                className="flex-1 px-4 py-2.5 border border-neutral-200 rounded-xl text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <button
                onClick={handleScan}
                disabled={scanning || !websiteUrl.trim()}
                className="flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white text-sm font-semibold rounded-xl hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {scanning ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Scanning…</>
                ) : (
                  'Scan Website'
                )}
              </button>
            </div>

            {scanError && (
              <p className="mt-2 text-xs text-red-600">{scanError}</p>
            )}

            {scanned && scanData && !editingScan && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-xl">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                    <span className="text-xs font-semibold text-green-800">Found from your website</span>
                  </div>
                  <button
                    onClick={() => setEditingScan(true)}
                    className="flex items-center gap-1 text-xs text-neutral-500 hover:text-neutral-700 transition-colors"
                  >
                    <Pencil className="w-3 h-3" /> Edit
                  </button>
                </div>

                <div className="space-y-1.5">
                  {scanData.businessName && (
                    <div className="flex gap-2">
                      <span className="text-xs text-neutral-500 w-28 flex-shrink-0">Business Name</span>
                      <span className="text-xs font-medium text-neutral-800">{scanData.businessName}</span>
                    </div>
                  )}
                  {scanData.tagline && (
                    <div className="flex gap-2">
                      <span className="text-xs text-neutral-500 w-28 flex-shrink-0">Tagline</span>
                      <span className="text-xs font-medium text-neutral-800">{scanData.tagline}</span>
                    </div>
                  )}
                  {scanData.description && (
                    <div className="flex gap-2">
                      <span className="text-xs text-neutral-500 w-28 flex-shrink-0">Description</span>
                      <span className="text-xs font-medium text-neutral-800">{scanData.description}</span>
                    </div>
                  )}
                  {scanData.primaryColor && (
                    <div className="flex gap-2 items-center">
                      <span className="text-xs text-neutral-500 w-28 flex-shrink-0">Primary Color</span>
                      <span
                        className="w-4 h-4 rounded-full border border-neutral-200 flex-shrink-0"
                        style={{ backgroundColor: scanData.primaryColor }}
                      />
                      <span className="text-xs font-medium text-neutral-800">{scanData.primaryColor}</span>
                    </div>
                  )}
                  {scanData.logoUrl && (
                    <div className="flex gap-2 items-center">
                      <span className="text-xs text-neutral-500 w-28 flex-shrink-0">Logo / OG Image</span>
                      <Image
                        src={scanData.logoUrl}
                        alt="Detected logo"
                        width={80}
                        height={32}
                        className="h-8 w-auto object-contain rounded border border-neutral-200 bg-neutral-50 px-1"
                        unoptimized
                      />
                    </div>
                  )}
                </div>

                <div className="mt-3 flex items-center gap-2">
                  <span className="text-xs text-neutral-600">Looks right?</span>
                  <button
                    onClick={() => setEditingScan(false)}
                    className="text-xs px-3 py-1 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Yes, use this
                  </button>
                  <button
                    onClick={() => setEditingScan(true)}
                    className="text-xs px-3 py-1 border border-neutral-200 text-neutral-600 font-medium rounded-lg hover:bg-neutral-50 transition-colors"
                  >
                    Edit
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Section 2: Brand Colors */}
          <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-6">
            <div className="flex items-center gap-2 mb-1">
              <Palette className="w-5 h-5 text-primary-600" />
              <h2 className="text-base font-bold text-neutral-900">Brand Colors</h2>
            </div>
            <p className="text-xs text-neutral-500 mb-5">
              These colors will be used across your landing pages and content.
            </p>

            <div className="space-y-4">
              {/* Primary */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Primary Color
                </label>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <input
                      type="color"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="w-12 h-10 rounded-lg border border-neutral-200 cursor-pointer p-0.5 bg-white"
                    />
                  </div>
                  <input
                    type="text"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    maxLength={7}
                    className="w-32 px-3 py-2 border border-neutral-200 rounded-xl text-sm font-mono text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="#2563eb"
                  />
                  <div
                    className="w-10 h-10 rounded-xl border border-neutral-200 flex-shrink-0"
                    style={{ backgroundColor: primaryColor }}
                  />
                </div>
              </div>

              {/* Secondary */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Secondary Color
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={secondaryColor}
                    onChange={(e) => setSecondaryColor(e.target.value)}
                    className="w-12 h-10 rounded-lg border border-neutral-200 cursor-pointer p-0.5 bg-white"
                  />
                  <input
                    type="text"
                    value={secondaryColor}
                    onChange={(e) => setSecondaryColor(e.target.value)}
                    maxLength={7}
                    className="w-32 px-3 py-2 border border-neutral-200 rounded-xl text-sm font-mono text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="#1e40af"
                  />
                  <div
                    className="w-10 h-10 rounded-xl border border-neutral-200 flex-shrink-0"
                    style={{ backgroundColor: secondaryColor }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Logo Upload */}
          <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-6">
            <div className="flex items-center gap-2 mb-1">
              <ImageIcon className="w-5 h-5 text-primary-600" />
              <h2 className="text-base font-bold text-neutral-900">Your Logo</h2>
            </div>
            <p className="text-xs text-neutral-500 mb-5">
              Upload your logo file (PNG, SVG, or JPG). It will appear on your content and pages.
            </p>

            {/* Drop zone */}
            <div
              onClick={() => !uploadingLogo && fileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDropZoneDrop}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                uploadingLogo
                  ? 'border-neutral-200 bg-neutral-50 cursor-not-allowed'
                  : 'border-neutral-300 hover:border-primary-400 hover:bg-primary-50'
              }`}
            >
              {uploadingLogo ? (
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
                  <p className="text-sm text-neutral-500">Uploading…</p>
                </div>
              ) : effectiveLogoPreview && !useScannedLogo ? (
                <div className="flex flex-col items-center gap-3">
                  <Image
                    src={effectiveLogoPreview}
                    alt="Logo preview"
                    width={160}
                    height={60}
                    className="max-h-16 w-auto object-contain"
                    unoptimized
                  />
                  <p className="text-xs text-neutral-500">Click to replace</p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <Upload className="w-8 h-8 text-neutral-400" />
                  <p className="text-sm font-medium text-neutral-700">
                    Drop your logo here or <span className="text-primary-600">browse</span>
                  </p>
                  <p className="text-xs text-neutral-400">PNG, SVG, JPG — max 5MB</p>
                </div>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/svg+xml,image/jpeg"
              className="hidden"
              onChange={handleFileInputChange}
            />

            {/* OG image option */}
            {scanData?.logoUrl && !logoFile && (
              <div className="mt-4 p-3 bg-neutral-50 border border-neutral-200 rounded-xl flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Image
                    src={scanData.logoUrl}
                    alt="Website OG image"
                    width={64}
                    height={32}
                    className="h-8 w-auto object-contain rounded border border-neutral-200 bg-white px-1"
                    unoptimized
                  />
                  <div>
                    <p className="text-xs font-medium text-neutral-700">Found from your website</p>
                    <p className="text-xs text-neutral-500">OG image detected</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setUseScannedLogo(!useScannedLogo)
                    setLogoFile(null)
                    setLogoPreviewUrl('')
                  }}
                  className={`text-xs px-3 py-1.5 rounded-lg font-semibold border transition-colors ${
                    useScannedLogo
                      ? 'bg-primary-600 text-white border-primary-600'
                      : 'border-neutral-300 text-neutral-600 hover:bg-neutral-100'
                  }`}
                >
                  {useScannedLogo ? 'Using this' : 'Use this instead'}
                </button>
              </div>
            )}
          </div>

          {/* Section 4: Brand Voice */}
          <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-6">
            <div className="flex items-center gap-2 mb-1">
              <Mic2 className="w-5 h-5 text-primary-600" />
              <h2 className="text-base font-bold text-neutral-900">Brand Voice</h2>
            </div>
            <p className="text-xs text-neutral-500 mb-4">
              How do you want to sound? This shapes the tone of every AI-written piece.
            </p>

            <div className="flex flex-wrap gap-2">
              {TONE_OPTIONS.map((tone) => (
                <button
                  key={tone}
                  onClick={() => setToneOfVoice(tone === toneOfVoice ? '' : tone)}
                  className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
                    toneOfVoice === tone
                      ? 'bg-primary-600 text-white border-primary-600'
                      : 'bg-white text-neutral-700 border-neutral-200 hover:border-primary-300 hover:text-primary-700'
                  }`}
                >
                  {tone}
                </button>
              ))}
            </div>
          </div>

          {/* Section 5: Industry */}
          <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-6">
            <div className="flex items-center gap-2 mb-1">
              <Building2 className="w-5 h-5 text-primary-600" />
              <h2 className="text-base font-bold text-neutral-900">Industry</h2>
            </div>
            <p className="text-xs text-neutral-500 mb-4">
              We&apos;ll tailor content templates and campaign ideas to your sector.
            </p>

            <select
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              className="w-full px-4 py-2.5 border border-neutral-200 rounded-xl text-sm text-neutral-900 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">Select your industry…</option>
              {INDUSTRIES.map((ind) => (
                <option key={ind} value={ind}>{ind}</option>
              ))}
            </select>
          </div>

          {/* Error */}
          {saveError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
              {saveError}
            </div>
          )}

          {/* CTA */}
          <div className="flex justify-end pb-10">
            <button
              onClick={handleContinue}
              disabled={saving}
              className="flex items-center gap-2 px-8 py-3 bg-primary-600 text-white font-bold rounded-xl hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm shadow-sm"
            >
              {saving ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</>
              ) : (
                <>Continue to Avatar Video <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </div>

        </div>
      </main>
    </>
  )
}
