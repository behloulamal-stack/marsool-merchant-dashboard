// ─── Category ────────────────────────────────────────────────────────────────
export interface Category {
  id: number
  name: string
  image: string | null
}

// ─── Store Information (Step 1) ───────────────────────────────────────────────
export interface StoreInformationPayload {
  trade_name: string
  commercial_registration_number: string
  category: number
  nation: string
  wilaya: string
  is_tax_registered: boolean
  tax_document?: File | null
}

// ─── Owner ────────────────────────────────────────────────────────────────────
export interface OwnerPayload {
  founder_name: string
  phone_number: string
  email: string
  position: string
}

// ─── Store Contact Information (Step 2) ──────────────────────────────────────
export interface StoreContactInformationPayload {
  number_of_owners: number
  owners: OwnerPayload[]
}

// ─── Full Application Payload (POST /api/stores/) ────────────────────────────
export interface StoreApplicationPayload {
  store_information: StoreInformationPayload
  store_contact_information: StoreContactInformationPayload
}

// ─── API Response ─────────────────────────────────────────────────────────────
export interface StoreApplicationResponse {
  message: string
  store_id: number
}

// ─── Stepper Steps ───────────────────────────────────────────────────────────
export type StepKey = 'store_info' | 'contact_info' | 'review'

export interface Step {
  key: StepKey
  title: string
  icon: string
}