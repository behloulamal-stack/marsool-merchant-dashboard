// كل الـ validation rules في مكان واحد — تستخدمها كل الـ steps
export function useStoreForm() {

  // ─── Shared rules ───────────────────────────────────────────────────────────
  const required = (label: string) =>
    (v: unknown) => !!v || `${label} مطلوب`

  const phoneRule = (v: string) =>
    /^\+?[0-9]{9,15}$/.test(v) || 'صيغة رقم الهاتف غير صحيحة'

  const emailRule = (v: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || 'البريد الإلكتروني غير صحيح'

  const minLength = (n: number) =>
    (v: string) => (v && v.length >= n) || `يجب أن يكون ${n} أحرف على الأقل`

  // ─── Step 1: Store Information ───────────────────────────────────────────────
  const tradeNameRules = [
    required('اسم المؤسسة'),
    minLength(2),
  ]

  const commercialRegRules = [
    required('رقم السجل التجاري'),
    (v: string) => /^[A-Za-z0-9\-\/]{5,30}$/.test(v) || 'صيغة رقم السجل غير صحيحة',
  ]

  const categoryRules = [
    required('الفئة'),
  ]

  const wilayaRules = [
    required('الولاية'),
  ]

  const taxDocRules = [
    (v: File | null) => !v || v.size <= 5_000_000 || 'حجم الملف يجب أن لا يتجاوز 5MB',
    (v: File | null) => !v || ['application/pdf', 'image/jpeg', 'image/png'].includes(v.type)
      || 'يجب أن يكون الملف PDF أو صورة',
  ]

  // ─── Step 2: Owner ───────────────────────────────────────────────────────────
  const founderNameRules = [
    required('اسم المالك'),
    minLength(3),
  ]

  const ownerPhoneRules  = [required('رقم الهاتف'), phoneRule]
  const ownerEmailRules  = [required('البريد الإلكتروني'), emailRule]
  const positionRules    = [required('المنصب')]

  return {
    tradeNameRules,
    commercialRegRules,
    categoryRules,
    wilayaRules,
    taxDocRules,
    founderNameRules,
    ownerPhoneRules,
    ownerEmailRules,
    positionRules,
  }
}