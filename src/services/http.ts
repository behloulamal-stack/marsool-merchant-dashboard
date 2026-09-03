const API_BASE = `${import.meta.env.VITE_APP_SERVER_URL || ''}/api`

// ─── ApiError ─────────────────────────────────────────────────────────────────
export class ApiError extends Error {
  status: number
  body: string
  data: unknown

  constructor(status: number, body: string) {
    super(`Request failed: ${status} - ${body}`)
    this.name = 'ApiError'
    this.status = status
    this.body = body
    try {
      this.data = JSON.parse(body)
    } catch {
      this.data = null
    }
  }
}

// ─── Error message extractor ──────────────────────────────────────────────────
export function apiErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof ApiError) {
    // 1. محاولة استخراج الرسالة القادمة من الباك إند لأي كود خطأ (400, 401, 403, 422, إلخ)
    if (err.data && typeof err.data === 'object') {
      const data = err.data as Record<string, unknown>
      if (typeof data.detail === 'string') return data.detail
      if (typeof data.message === 'string') return data.message

      // البحث داخل الأخطاء المتشعبة (Validation Errors)
      for (const value of Object.values(data)) {
        if (Array.isArray(value) && typeof value[0] === 'string') return value[0]
        if (value && typeof value === 'object') {
          for (const nested of Object.values(value as Record<string, unknown>)) {
            if (Array.isArray(nested) && typeof nested[0] === 'string') return nested[0]
          }
        }
      }
    }

    // 2. رسائل احتياطية افتراضية في حال لم يرجع الباك إند نص خطأ صريح
    const messages: Record<number, string> = {
      401: 'غير مصرح لك بهذه العملية',
      403: 'الوصول محظور',
      404: 'المورد غير موجود',
      429: 'لقد تجاوزت الحد المسموح به، حاول لاحقاً',
    }
    return messages[err.status] ?? (err.status >= 500 ? 'خطأ في الخادم' : 'حدث خطأ غير متوقع')
  }

  if (err instanceof TypeError) return 'تعذر الاتصال بالخادم، تحقق من اتصالك'
  return fallback
}

// ─── Core request ─────────────────────────────────────────────────────────────
export async function request<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`
  const url = `${API_BASE}${cleanEndpoint}`

  const isFormData = options.body instanceof FormData
  const headers: Record<string, string> = {}

  if (!isFormData) {
    headers['Content-Type'] = 'application/json'
  }

  // 🛑 تحصين: التأكد أن التوكن ليس null ولا undefined كنص
  const token = localStorage.getItem('access_token')
  if (token && token !== 'undefined' && token !== 'null') {
    headers['Authorization'] = `Bearer ${token}`
  }

  // دمج أي Headers مخصصة ممررة للطلب
  if (options.headers) {
    Object.assign(headers, options.headers as Record<string, string>)
  }

  // 🛑 تنظيف: لو أُرسل الهيدر بشكل فارغ أو غير صالح قم بحذفه كلياً لتفادي رفض Django للطلب
  if (!headers['Authorization'] || headers['Authorization'].includes('undefined')) {
    delete headers['Authorization']
  }

  const response = await fetch(url, { ...options, headers })

  if (!response.ok) {
    const errorText = await response.text()
    throw new ApiError(response.status, errorText)
  }

  if (response.status === 204) return {} as T

  return response.json()
}