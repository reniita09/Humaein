// src/api/client.ts
import axios from 'axios'

/**
 * API client for HUMAEIN
 * - Always sends `X-Tenant-ID: HUMAEIN`
 * - Handles token in localStorage
 * - Provides isAuthenticated() JWT check
 */

const API_BASE = import.meta.env.VITE_API_BASE || 'https://humaein-backend.onrender.com'
const TENANT_ID = 'HUMAEIN'

export const api = axios.create({
  baseURL: API_BASE,
})

// ----------------- token helpers -----------------
const TOKEN_KEY = 'humaein_token'

export function setToken(token: string) {
  try {
    localStorage.setItem(TOKEN_KEY, token)
  } catch (e) {
    console.warn('setToken failed', e)
  }
}

export function getToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

export function clearToken() {
  try {
    localStorage.removeItem(TOKEN_KEY)
  } catch {}
}

// ----------------- JWT payload decode -----------------
function decodeJwtPayload(token: string) {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null
    const payload = parts[1]
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/')
    const json = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    )
    return JSON.parse(json)
  } catch {
    return null
  }
}

export function isAuthenticated(): boolean {
  const token = getToken()
  if (!token) return false
  const payload = decodeJwtPayload(token)
  if (!payload) return false
  if (payload.exp && typeof payload.exp === 'number') {
    const nowSec = Math.floor(Date.now() / 1000)
    return payload.exp > nowSec
  }
  return true
}

// ----------------- request interceptor -----------------
// Always attach Authorization (if token) and X-Tenant-ID: HUMAEIN
api.interceptors.request.use(config => {
  if (!config.headers) config.headers = {}

  const token = getToken()
  if (token) config.headers.Authorization = `Bearer ${token}`

  // always send default tenant header
  config.headers['X-Tenant-ID'] = TENANT_ID

  // don’t override Content-Type — browser/axios sets boundary correctly
  delete config.headers['Content-Type']
  delete config.headers['content-type']

  return config
})

// ----------------- login helper -----------------
export async function login(email: string, password: string) {
  const params = new URLSearchParams()
  params.append('username', email)
  params.append('password', password)

  const res = await api.post('/api/auth/login', params, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  })
  const token = (res.data as any).access_token
  if (token) setToken(token)
  return res.data
}

export default {
  api,
  login,
  setToken,
  getToken,
  clearToken,
  isAuthenticated,
}
