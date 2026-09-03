import { request } from './http'
import type {
  Menu, OptionGroup, Product, Option,
  AddMenuPayload, AddOptionGroupPayload,
  AddOptionPayload, AddProductPayload,
} from '@/types/menu'

export const menuApi = {
  // ─── Menus ──────────────────────────────────────────────────
  getMenus: () => request<Menu[]>('/my/menus/'),
  addMenu: (payload: AddMenuPayload) =>
    request<Menu>('/my/menus/', { method: 'POST', body: JSON.stringify(payload) }),
  updateMenu: (id: number, payload: AddMenuPayload) =>
    request<Menu>(`/my/menus/${id}/`, { method: 'PATCH', body: JSON.stringify(payload) }),
  deleteMenu: (id: number) =>
    request<void>(`/my/menus/${id}/`, { method: 'DELETE' }),

  // ─── Option Groups ──────────────────────────────────────────
  getOptionGroups: () => request<OptionGroup[]>('/my/option-groups/'),
  addOptionGroup: (payload: AddOptionGroupPayload) =>
    request<OptionGroup>('/my/option-groups/', { method: 'POST', body: JSON.stringify(payload) }),
  updateOptionGroup: (id: number, payload: AddOptionGroupPayload) =>
    request<OptionGroup>(`/my/option-groups/${id}/`, { method: 'PATCH', body: JSON.stringify(payload) }),
  deleteOptionGroup: (id: number) =>
    request<void>(`/my/option-groups/${id}/`, { method: 'DELETE' }),

  // ─── Options ────────────────────────────────────────────────
  addOption: (payload: AddOptionPayload) =>
    request<Option>('/my/options/', { method: 'POST', body: JSON.stringify(payload) }),
  updateOption: (id: number, payload: AddOptionPayload) =>
    request<Option>(`/my/options/${id}/`, { method: 'PATCH', body: JSON.stringify(payload) }),
  deleteOption: (id: number) =>
    request<void>(`/my/options/${id}/`, { method: 'DELETE' }),

  // ─── Products ───────────────────────────────────────────────
  addProduct: (payload: AddProductPayload) => {
    const formData = buildProductFormData(payload)
    return request<Product>('/my/products/', { method: 'POST', body: formData })
  },
  updateProduct: (id: number, payload: Partial<AddProductPayload>) => {
    const formData = buildProductFormData(payload)
    return request<Product>(`/my/products/${id}/`, { method: 'PATCH', body: formData })
  },
  deleteProduct: (id: number) =>
    request<void>(`/my/products/${id}/`, { method: 'DELETE' }),
}

function buildProductFormData(payload: Partial<AddProductPayload>): FormData {
  const formData = new FormData()
  if (payload.name !== undefined) formData.append('name', payload.name)
  if (payload.menu !== undefined) formData.append('menu', String(payload.menu))
  if (payload.price !== undefined) formData.append('price', String(payload.price))
  if (payload.description !== undefined) formData.append('description', payload.description)
  if (payload.options !== undefined) {
    // DRF يقبل مفاتيح متكررة كمصفوفة — سطر append منفصل لكل خيار
    payload.options.forEach((id) => formData.append('options', String(id)))
  }
  if (payload.image) formData.append('image', payload.image)
  return formData
}