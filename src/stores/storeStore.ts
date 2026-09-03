import { defineStore } from 'pinia'
import { ref } from 'vue'
import { storeApi } from '@/services/storeServices'
import { apiErrorMessage } from '@/services/http'
import type {
  Category,
  StoreInformationPayload,
  StoreContactInformationPayload,
} from '@/types/store'

export const useStoreRegistrationStore = defineStore('storeRegistration', () => {

  // ─── State ──────────────────────────────────────────────────────────────────
  const categories   = ref<Category[]>([])
  const loading      = ref(false)
  const submitting   = ref(false)
  const error        = ref<string | null>(null)
  const successId    = ref<number | null>(null)    // store_id بعد نجاح الإرسال

  // Form data — يتملى خطوة بخطوة
  const storeInfo = ref<Partial<StoreInformationPayload>>({
    is_tax_registered: false,
  })

  const contactInfo = ref<Partial<StoreContactInformationPayload>>({
    number_of_owners: 1,
    owners: [{ founder_name: '', phone_number: '', email: '', position: '' }],
  })

  // ─── Actions ────────────────────────────────────────────────────────────────
  async function fetchCategories() {
    if (categories.value.length) return   // cache بسيط: ما نجيبهمش مرتين
    loading.value = true
    error.value = null
    try {
      categories.value = await storeApi.getCategories()
    } catch (err) {
      error.value = apiErrorMessage(err, 'فشل تحميل الفئات')
    } finally {
      loading.value = false
    }
  }

  async function submitApplication() {
    submitting.value = true
    error.value = null
    try {
      const response = await storeApi.submitApplication({
        store_information: storeInfo.value as StoreInformationPayload,
        store_contact_information: contactInfo.value as StoreContactInformationPayload,
      })
      successId.value = response.store_id
      return { success: true as const, storeId: response.store_id }
    } catch (err) {
      error.value = apiErrorMessage(err, 'فشل إرسال الطلب')
      return { success: false as const, message: error.value }
    } finally {
      submitting.value = false
    }
  }

  function reset() {
    storeInfo.value = { is_tax_registered: false }
    contactInfo.value = {
      number_of_owners: 1,
      owners: [{ founder_name: '', phone_number: '', email: '', position: '' }],
    }
    error.value = null
    successId.value = null
  }

  return {
    // state
    categories,
    loading,
    submitting,
    error,
    successId,
    storeInfo,
    contactInfo,
    // actions
    fetchCategories,
    submitApplication,
    reset,
  }
})