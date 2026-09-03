export interface Option {
  id: number
  name: string
  price: string | number
  calories?: number | null
  option_group?: number
}

export interface OptionGroup {
  id: number
  name: string
  options: Option[]
}

export interface Product {
  id: number
  name: string
  menu: number
  description?: string | null
  price: string | number
  image?: string | null
  calories?: number | null
  grouped_options?: Record<string, Option[]>
}

export interface Menu {
  id: number
  name: string
  products?: Product[]
}

export interface AddMenuPayload {
  name: string
}

export interface AddOptionGroupPayload {
  name: string
}

export interface AddOptionPayload {
  option_group: number
  name: string
  price: number
  calories?: number | null
}

export interface AddProductPayload {
  name: string
  menu: number
  price: number
  description?: string
  options?: number[]
  image?: File | null
}