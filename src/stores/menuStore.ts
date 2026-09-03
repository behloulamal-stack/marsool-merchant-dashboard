import { defineStore } from 'pinia'
import { ref } from 'vue'
import { menuApi } from '@/services/menuService'
import { apiErrorMessage } from '@/services/http'
import type {
  Menu, OptionGroup,
  AddMenuPayload, AddOptionGroupPayload,
  AddOptionPayload, AddProductPayload,
} from '@/types/menu'

export const useMenuStore = defineStore('menu', () => {
  const menus        = ref<Menu[]>([])
  const optionGroups = ref<OptionGroup[]>([])
  const loading      = ref(false)
  const submitting   = ref(false)
  const error        = ref<string | null>(null)

  async function fetchMenus() {
    menus.value = await menuApi.getMenus()
  }

  async function fetchOptionGroups() {
    optionGroups.value = await menuApi.getOptionGroups()
  }

  async function fetchAllData() {
    loading.value = true
    error.value = null
    try {
      await Promise.all([fetchMenus(), fetchOptionGroups()])
    } catch (err) {
      error.value = apiErrorMessage(err, 'فشل تحميل بيانات القائمة')
    } finally {
      loading.value = false
    }
  }

  // ── مساعد عام: ينفّذ أي عملية كتابة، ثم يعيد الجلب لضمان تناسق العرض ──
  async function runMutation(action: () => Promise<unknown>, fallbackMsg: string) {
    submitting.value = true
    error.value = null
    try {
      await action()
      await fetchAllData()
      return true
    } catch (err) {
      error.value = apiErrorMessage(err, fallbackMsg)
      return false
    } finally {
      submitting.value = false
    }
  }

  // ── Menus ──
  const addMenu    = (payload: AddMenuPayload) => runMutation(() => menuApi.addMenu(payload), 'فشل إضافة الفئة')
  const updateMenu = (id: number, payload: AddMenuPayload) => runMutation(() => menuApi.updateMenu(id, payload), 'فشل تعديل الفئة')
  const deleteMenu = (id: number) => runMutation(() => menuApi.deleteMenu(id), 'فشل حذف الفئة')

  // ── Option Groups ──
  const addOptionGroup    = (payload: AddOptionGroupPayload) => runMutation(() => menuApi.addOptionGroup(payload), 'فشل إضافة مجموعة الخيارات')
  const updateOptionGroup = (id: number, payload: AddOptionGroupPayload) => runMutation(() => menuApi.updateOptionGroup(id, payload), 'فشل تعديل المجموعة')
  const deleteOptionGroup = (id: number) => runMutation(() => menuApi.deleteOptionGroup(id), 'فشل حذف المجموعة')

  // ── Options ──
  const addOption    = (payload: AddOptionPayload) => runMutation(() => menuApi.addOption(payload), 'فشل إضافة الخيار')
  const updateOption = (id: number, payload: AddOptionPayload) => runMutation(() => menuApi.updateOption(id, payload), 'فشل تعديل الخيار')
  const deleteOption = (id: number) => runMutation(() => menuApi.deleteOption(id), 'فشل حذف الخيار')

  // ── Products ──
  const addProduct    = (payload: AddProductPayload) => runMutation(() => menuApi.addProduct(payload), 'فشل إضافة المنتج')
  const updateProduct = (id: number, payload: Partial<AddProductPayload>) => runMutation(() => menuApi.updateProduct(id, payload), 'فشل تعديل المنتج')
  const deleteProduct = (id: number) => runMutation(() => menuApi.deleteProduct(id), 'فشل حذف المنتج')

  return {
    menus, optionGroups, loading, submitting, error,
    fetchAllData,
    addMenu, updateMenu, deleteMenu,
    addOptionGroup, updateOptionGroup, deleteOptionGroup,
    addOption, updateOption, deleteOption,
    addProduct, updateProduct, deleteProduct,
  }
})