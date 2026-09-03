import { request } from './http'
import type {
  Category,
  StoreApplicationPayload,
  StoreApplicationResponse,
  StoreInformationPayload,
} from '@/types/store'

export const storeApi = {
  // GET /api/categories/
  getCategories: () =>
    request<Category[]>('/categories/'),

  // POST /api/stores/ — يقبل FormData لأن فيه tax_document (File)
  submitApplication: (payload: StoreApplicationPayload & {
    store_information: StoreInformationPayload & { tax_document?: File | null }
  }) => {
    // إذا كان فيه ملف نستخدم FormData، غير ذلك JSON عادي
    const hasTaxDoc = !!payload.store_information.tax_document

    if (hasTaxDoc) {
      const formData = new FormData()
      const { tax_document, ...storeInfo } = payload.store_information

      formData.append('store_information', JSON.stringify(storeInfo))
      formData.append('store_contact_information', JSON.stringify(payload.store_contact_information))
      formData.append('tax_document', tax_document as File)

      return request<StoreApplicationResponse>('/stores/', {
        method: 'POST',
        body: formData,
      })
    }

    return request<StoreApplicationResponse>('/stores/', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },
}