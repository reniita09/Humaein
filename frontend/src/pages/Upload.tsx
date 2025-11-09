// src/pages/Upload.tsx
import React, { useCallback, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api/client'
import { Loader2, Upload as UploadIcon, FileText, FileSpreadsheet, X } from 'lucide-react'
import { motion } from 'framer-motion'

export default function Upload() {
  const [claimsFile, setClaimsFile] = useState<File | null>(null)
  const [techFile, setTechFile] = useState<File | null>(null)
  const [medFile, setMedFile] = useState<File | null>(null)
  const [status, setStatus] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  // refs for inputs to support click-to-open
  const techRef = useRef<HTMLInputElement | null>(null)
  const medRef = useRef<HTMLInputElement | null>(null)
  const claimsRef = useRef<HTMLInputElement | null>(null)

  // tenant helper: prefer runtime stored tenant, fallback to env var
  const getTenant = () => {
    try {
      return localStorage.getItem('humaein_tenant') || ''
    } catch {
      return  ''
    }
  }

  // debug helper: print FormData entries
  const logFormData = (fd: FormData) => {
    const arr: Array<[string, any]> = []
    for (const entry of fd.entries()) arr.push([entry[0], entry[1]])
    // eslint-disable-next-line no-console
    console.debug('FormData ->', arr)
  }

  // helper: config that removes Content-Type so browser adds proper boundary
  const makeMultipartConfig = (tenant?: string | null) => {
    const headers: Record<string, string> = {}
    if (tenant) headers['X-Tenant-ID'] = tenant

    return {
      headers,
      // transformRequest runs in the browser before sending; delete Content-Type here so
      // the browser can set multipart boundary automatically.
      transformRequest: (data: any, headersObj: any) => {
        if (headersObj) {
          // axios normalizes header names; remove any Content-Type we didn't want
          delete headersObj['Content-Type']
          delete headersObj['content-type']
        }
        return data
      },
    }
  }

  // upload rules (technical/medical)
  const uploadRules = async (file: File, kind: 'technical' | 'medical') => {
    if (!file) throw new Error('No file provided')
    const fd = new FormData()
    fd.append('kind', kind)
    fd.append('file', file)

    logFormData(fd)

    const tenant = getTenant()
    try {
      return await api.post('/api/upload/rules', fd, makeMultipartConfig(tenant))
    } catch (err: any) {
      // fallback: some backends expect "rules" field instead of "file"
      if (err?.response?.status === 422) {
        // eslint-disable-next-line no-console
        console.warn('uploadRules: "file" returned 422 — trying fallback "rules" field')
        const fd2 = new FormData()
        fd2.append('kind', kind)
        fd2.append('rules', file)
        logFormData(fd2)
        return await api.post('/api/upload/rules', fd2, makeMultipartConfig(tenant))
      }
      throw err
    }
  }

  // upload claims (single call)
  const uploadClaims = async (file: File) => {
    if (!file) throw new Error('No claims file provided')
    const fd = new FormData()
    fd.append('file', file)

    logFormData(fd)

    const tenant = getTenant()
    return api.post('/api/upload/claims', fd, makeMultipartConfig(tenant))
  }

  const onRun = async () => {
    setError(null)
    try {
      setIsLoading(true)
      setStatus('Uploading files...')

      // Technical rules
      if (techFile) {
        try {
          await uploadRules(techFile, 'technical')
        } catch (err: any) {
          // surface server detail if available
          // eslint-disable-next-line no-console
          console.error('Technical rules upload error ->', err?.response ?? err)
          const srv = err?.response?.data ?? err?.message
          setError(`Technical rules upload failed: ${typeof srv === 'string' ? srv : JSON.stringify(srv)}`)
          setIsLoading(false)
          setStatus('')
          return
        }
      }

      // Medical rules
      if (medFile) {
        try {
          await uploadRules(medFile, 'medical')
        } catch (err: any) {
          // eslint-disable-next-line no-console
          console.error('Medical rules upload error ->', err?.response ?? err)
          const srv = err?.response?.data ?? err?.message
          setError(`Medical rules upload failed: ${typeof srv === 'string' ? srv : JSON.stringify(srv)}`)
          setIsLoading(false)
          setStatus('')
          return
        }
      }

      // Claims file
      if (!claimsFile) {
        setStatus('')
        setError('Please select a claims file before validating.')
        setIsLoading(false)
        return
      }

      try {
        const { data } = await uploadClaims(claimsFile)
        setStatus('Processing validation...')
        // short UX delay
        await new Promise(resolve => setTimeout(resolve, 1200))
        navigate(`/results/${data.job_id}`)
      } catch (err: any) {
        // eslint-disable-next-line no-console
        console.error('Claims upload error ->', err?.response ?? err)
        const srv = err?.response?.data ?? err?.message
        setError(`Claims upload failed: ${typeof srv === 'string' ? srv : JSON.stringify(srv)}`)
        setIsLoading(false)
        setStatus('')
        return
      }
    } catch (e: any) {
      // eslint-disable-next-line no-console
      console.error('Upload failed (outer):', e)
      setError(e?.message || 'Upload failed. Please try again.')
      setIsLoading(false)
      setStatus('')
    }
  }

  // drag & drop helpers (generic)
  const handleDrop = useCallback((e: React.DragEvent, setter: (f: File | null) => void) => {
    e.preventDefault()
    e.stopPropagation()
    const file = e.dataTransfer.files?.[0] ?? null
    if (file) setter(file)
  }, [])

  const prevent = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const removeFile = (which: 'tech' | 'med' | 'claims') => {
    if (which === 'tech') setTechFile(null)
    if (which === 'med') setMedFile(null)
    if (which === 'claims') setClaimsFile(null)
  }

  return (
    <section className="min-h-[80vh] flex items-center justify-center bg-white py-12 px-4 pt-24">
      <motion.div
        className="w-full max-w-3xl bg-gray-50 border border-gray-200 rounded-2xl shadow-lg p-8"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Upload Files</h1>
            <p className="text-sm text-gray-600">Add your rule files and claims data to start validation.</p>
          </div>

          <div className="text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <UploadIcon className="w-5 h-5 text-teal-600" />
              <span>Secure • Encrypted</span>
            </div>
          </div>
        </div>

        {/* Upload areas */}
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          {/* Technical rules */}
          <div
            onDragOver={prevent}
            onDragEnter={prevent}
            onDrop={(e) => handleDrop(e, setTechFile)}
            className="flex flex-col"
          >
            <label className="mb-2 text-sm font-medium text-gray-700 flex items-center gap-2">
              <FileText className="w-4 h-4 text-teal-600" /> Technical Rules
            </label>

            <div
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter') techRef.current?.click() }}
              onClick={() => techRef.current?.click()}
              className={`flex items-center justify-center h-28 rounded-lg border-2 ${
                techFile ? 'border-teal-600 bg-white' : 'border-dashed border-gray-200 bg-white/50'
              } focus:outline-none cursor-pointer transition-all`}
              aria-label="Drop technical rules file here or click to select"
            >
              {techFile ? (
                <div className="px-4 text-sm text-gray-800 flex items-center justify-between w-full">
                  <div className="truncate">{techFile.name}</div>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); removeFile('tech') }}
                    aria-label="Remove technical rules"
                    className="ml-3 text-gray-400 hover:text-red-500"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="text-center text-sm text-gray-500">
                  Drag & drop .pdf <br /> or click to select
                </div>
              )}

              <input
                ref={techRef}
                type="file"
                accept=".json,.pdf"
                className="hidden"
                onChange={(e) => setTechFile(e.target.files?.[0] ?? null)}
              />
            </div>
          </div>

          {/* Medical rules */}
          <div
            onDragOver={prevent}
            onDragEnter={prevent}
            onDrop={(e) => handleDrop(e, setMedFile)}
            className="flex flex-col"
          >
            <label className="mb-2 text-sm font-medium text-gray-700 flex items-center gap-2">
              <FileText className="w-4 h-4 text-teal-600" /> Medical Rules
            </label>

            <div
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter') medRef.current?.click() }}
              onClick={() => medRef.current?.click()}
              className={`flex items-center justify-center h-28 rounded-lg border-2 ${
                medFile ? 'border-teal-600 bg-white' : 'border-dashed border-gray-200 bg-white/50'
              } focus:outline-none cursor-pointer transition-all`}
              aria-label="Drop medical rules file here or click to select"
            >
              {medFile ? (
                <div className="px-4 text-sm text-gray-800 flex items-center justify-between w-full">
                  <div className="truncate">{medFile.name}</div>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); removeFile('med') }}
                    aria-label="Remove medical rules"
                    className="ml-3 text-gray-400 hover:text-red-500"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="text-center text-sm text-gray-500">
                  Drag & drop .pdf <br /> or click to select
                </div>
              )}

              <input
                ref={medRef}
                type="file"
                accept=".json,.pdf"
                className="hidden"
                onChange={(e) => setMedFile(e.target.files?.[0] ?? null)}
              />
            </div>
          </div>

          {/* Claims data */}
          <div
            onDragOver={prevent}
            onDragEnter={prevent}
            onDrop={(e) => handleDrop(e, setClaimsFile)}
            className="flex flex-col"
          >
            <label className="mb-2 text-sm font-medium text-gray-700 flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-teal-600" /> Claims Data
            </label>

            <div
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter') claimsRef.current?.click() }}
              onClick={() => claimsRef.current?.click()}
              className={`flex items-center justify-center h-28 rounded-lg border-2 ${
                claimsFile ? 'border-teal-600 bg-white' : 'border-dashed border-gray-200 bg-white/50'
              } focus:outline-none cursor-pointer transition-all`}
              aria-label="Drop claims file here or click to select"
            >
              {claimsFile ? (
                <div className="px-4 text-sm text-gray-800 flex items-center justify-between w-full">
                  <div className="truncate">{claimsFile.name}</div>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); removeFile('claims') }}
                    aria-label="Remove claims file"
                    className="ml-3 text-gray-400 hover:text-red-500"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="text-center text-sm text-gray-500">
                  Drag & drop .xlsx <br /> or click to select
                </div>
              )}

              <input
                ref={claimsRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                className="hidden"
                onChange={(e) => setClaimsFile(e.target.files?.[0] ?? null)}
              />
            </div>
          </div>
        </div>

        {/* status & actions */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex-1 min-w-0">
            {error && <div className="text-red-500 text-sm mb-2">{error}</div>}
            {status && !isLoading && <div className="text-sm text-gray-600 mb-2">{status}</div>}
            {isLoading && (
              <div className="flex items-center gap-3 text-sm text-gray-600 mb-2">
                <Loader2 className="w-4 h-4 animate-spin text-gray-500" />
                <span>{status || 'Processing...'}</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => { setTechFile(null); setMedFile(null); setClaimsFile(null); setError(null); setStatus('') }}
              disabled={isLoading}
              className="px-4 py-2 rounded-lg border border-gray-200 bg-white text-sm text-gray-700 hover:bg-gray-50 transition"
            >
              Reset
            </button>

            <button
              onClick={onRun}
              disabled={isLoading}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-teal-600 text-white font-semibold hover:bg-teal-700 disabled:opacity-60 transition"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing</span>
                </>
              ) : (
                <>
                  <UploadIcon className="w-4 h-4" />
                  <span>Validate</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* small help text */}
        <p className="mt-4 text-xs text-gray-500">
          Accepted formats — Rules: <code className="font-mono">.pdf</code>. Claims: <code className="font-mono">.xlsx</code>.
        </p>
      </motion.div>
    </section>
  )
}
