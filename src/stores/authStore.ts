import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { request, apiErrorMessage } from '@/services/http'

interface AuthUser {
  phone_number: string
  full_name: string
  role: string
  is_verified: boolean
}

interface MerchantVerifyResponse {
  access: string
  refresh: string
  user: AuthUser
}

export const useAuthStore = defineStore('auth', () => {

  const accessToken  = ref<string | null>(localStorage.getItem('access_token'))
  const refreshToken = ref<string | null>(localStorage.getItem('refresh_token'))
  const user         = ref<AuthUser | null>(null)
  const loading      = ref(false)
  const error        = ref<string | null>(null)

  const isAuthenticated = computed(() => !!accessToken.value)
  const isMerchant      = computed(() => user.value?.role === 'merchant')

  const stored = localStorage.getItem('auth_user')
  if (stored) {
    try { user.value = JSON.parse(stored) } catch { /* ignore */ }
  }

  function applyTokens(access: string, refresh: string, authUser: AuthUser) {
    accessToken.value  = access
    refreshToken.value = refresh
    user.value         = authUser
    localStorage.setItem('access_token', access)
    localStorage.setItem('refresh_token', refresh)
    localStorage.setItem('auth_user', JSON.stringify(authUser))
  }

  // ── Step 1: Request OTP ──────────────────────────────────────────────────────
  async function requestOTP(phone_number: string) {
    loading.value = true
    error.value   = null
    try {
      await request('/auth/request-otp/', {
        method: 'POST',
        body: JSON.stringify({ phone_number }),
      })
      return { success: true as const }
    } catch (err) {
      error.value = apiErrorMessage(err, 'فشل إرسال الرمز')
      return { success: false as const, message: error.value }
    } finally {
      loading.value = false
    }
  }

  // ── Step 2: Verify OTP — إصلاح: endpoint خاص بالتجار، مو العام ──────────────
  async function verifyOTP(phone_number: string, otp_code: string) {
    loading.value = true
    error.value   = null
    try {
      const res = await request<MerchantVerifyResponse>('/auth/verify-otp/', {
        method: 'POST',
        body: JSON.stringify({ phone_number, otp_code }),
      })
      applyTokens(res.access, res.refresh, res.user)
      return { success: true as const }
    } catch (err) {
      error.value = apiErrorMessage(err, 'حدث خطأ غير متوقع')
      return { success: false as const, message: error.value }
    } finally {
      loading.value = false
    }
  }

  function logout() {
    accessToken.value  = null
    refreshToken.value = null
    user.value         = null
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('auth_user')
  }

  return {
    accessToken, refreshToken, user,
    isAuthenticated, isMerchant,
    loading, error,
    requestOTP, verifyOTP, logout,
  }
})