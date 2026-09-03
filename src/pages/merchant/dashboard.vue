<template>
  <v-app class="dashboard-app">
    <!-- ── 1. Top Navbar (Teal Bar) ── -->
    <header class="merchant-header">
      <div class="header-left">
        <button class="header-link" @click="handleLogout">تسجيل خروج</button>
        <div class="header-nav flex-row-reverse">
          <span class="nav-item">DISPATCHERS</span>
          <span class="nav-item">BRANCH USERS</span>
          <span class="nav-item">SUPER USERS</span>
          <span class="nav-item">BRANCHES</span>
          <span class="nav-item">WORK SHIFTS</span>
          <span class="nav-item active">MENU</span>
        </div>
      </div>
      <div class="header-right">
        <span class="shop-title">Menu Items - {{ storeName }}</span>
        <v-icon color="white" size="20" class="ml-2">mdi-chevron-right</v-icon>
      </div>
    </header>

    <!-- ── 2. Action Sub-Header Bar ── -->
    <div class="action-bar">
      <div class="action-tabs">
        <button class="tab-btn" :class="{ active: activeTab === 'categories' }" @click="activeTab = 'categories'">
          <v-icon size="20">mdi-tag-outline</v-icon>
          <span>CATEGORIES (الفئات)</span>
        </button>
        <button class="tab-btn" :class="{ active: activeTab === 'addons' }" @click="activeTab = 'addons'">
          <v-icon size="20">mdi-puzzle-outline</v-icon>
          <span>ADDONS (الخيارات)</span>
        </button>
        <button class="tab-btn" :class="{ active: activeTab === 'products' }" @click="activeTab = 'products'">
          <v-icon size="20">mdi-package-variant-closed</v-icon>
          <span>PRODUCTS (المنتجات)</span>
        </button>
      </div>

      <div class="action-filter">
        <v-select
          v-model="selectedCategoryFilter"
          :items="filterCategories"
          item-title="name"
          item-value="id"
          density="compact"
          variant="underlined"
          hide-details
          class="category-select"
        />
      </div>
    </div>

    <!-- ── 3. Main Workspace Area ── -->
    <v-main class="workspace-area">
      <v-container fluid class="pa-6">
        <v-alert v-if="menuStore.error" type="error" variant="tonal" closable class="mb-4" dir="rtl">
          {{ menuStore.error }}
        </v-alert>

        <div v-if="menuStore.loading" class="text-center py-12">
          <v-progress-circular indeterminate color="#13a89e" size="50" />
        </div>

        <template v-else>
          <!-- CATEGORIES TAB -->
          <div v-if="activeTab === 'categories'" dir="rtl">
            <div class="d-flex justify-space-between align-center mb-4">
              <h2 class="section-heading">قوائم الفئات (Menus)</h2>
              <v-btn color="#13a89e" class="text-white" rounded="lg" @click="openAddMenu">
                <v-icon start>mdi-plus</v-icon> إضافة فئة جديدة
              </v-btn>
            </div>

            <v-row>
              <v-col v-for="menu in menuStore.menus" :key="menu.id" cols="12" sm="6" md="4">
                <v-card variant="outlined" class="pa-4 card-item" rounded="lg">
                  <div class="d-flex justify-space-between align-center">
                    <span class="font-weight-bold text-h6">{{ menu.name }}</span>
                    <div class="d-flex align-center">
                      <v-chip size="small" color="#13a89e" class="ml-1">
                        {{ menu.products?.length || 0 }} منتجات
                      </v-chip>
                      <v-btn icon="mdi-pencil" size="x-small" variant="text" @click="openEditMenu(menu)" />
                      <v-btn icon="mdi-delete-outline" size="x-small" variant="text" color="error" @click="confirmDeleteMenu(menu)" />
                    </div>
                  </div>
                </v-card>
              </v-col>
            </v-row>
          </div>

          <!-- ADDONS / OPTION GROUPS TAB -->
          <div v-else-if="activeTab === 'addons'" dir="rtl">
            <div class="d-flex justify-space-between align-center mb-4">
              <h2 class="section-heading">مجموعات الإضافات (Option Groups)</h2>
              <div>
                <v-btn color="#13a89e" class="text-white ml-2" rounded="lg" @click="openAddOptionGroup">
                  <v-icon start>mdi-plus</v-icon> إضافة مجموعة
                </v-btn>
                <v-btn variant="outlined" color="#13a89e" rounded="lg" @click="openAddOption">
                  <v-icon start>mdi-plus</v-icon> إضافة خيار لمجموعة
                </v-btn>
              </div>
            </div>

            <v-row>
              <v-col v-for="group in menuStore.optionGroups" :key="group.id" cols="12" md="6">
                <v-card variant="outlined" class="pa-4 card-item" rounded="lg">
                  <div class="d-flex justify-space-between align-center mb-3">
                    <h3 class="text-h6 color-teal">{{ group.name }}</h3>
                    <div>
                      <v-btn icon="mdi-pencil" size="x-small" variant="text" @click="openEditOptionGroup(group)" />
                      <v-btn icon="mdi-delete-outline" size="x-small" variant="text" color="error" @click="confirmDeleteOptionGroup(group)" />
                    </div>
                  </div>
                  <v-divider class="mb-3" />
                  <v-list density="compact" class="bg-transparent">
                    <v-list-item v-for="opt in group.options" :key="opt.id" class="px-0">
                      <template #title>{{ opt.name }}</template>
                      <template #append>
                        <span class="font-weight-bold text-success">{{ opt.price }} د.ج</span>
                        <span v-if="opt.calories" class="text-caption text-grey mr-2">
                          ({{ opt.calories }} سعرة)
                        </span>
                        <v-btn icon="mdi-pencil" size="x-small" variant="text" @click="openEditOption(opt, group.id)" />
                        <v-btn icon="mdi-delete-outline" size="x-small" variant="text" color="error" @click="confirmDeleteOption(opt)" />
                      </template>
                    </v-list-item>
                    <v-list-item v-if="!group.options?.length">
                      <span class="text-caption text-grey">لا توجد خيارات معرّفة بعد</span>
                    </v-list-item>
                  </v-list>
                </v-card>
              </v-col>
            </v-row>
          </div>

          <!-- PRODUCTS TAB -->
          <div v-else-if="activeTab === 'products'" dir="rtl">
            <div class="d-flex justify-space-between align-center mb-4">
              <h2 class="section-heading">المنتجات (Products)</h2>
              <v-btn color="#13a89e" class="text-white" rounded="lg" @click="openAddProduct">
                <v-icon start>mdi-plus</v-icon> إضافة منتج جديد
              </v-btn>
            </div>

            <v-row>
              <template v-for="menu in filteredMenus" :key="menu.id">
                <v-col v-for="prod in menu.products" :key="prod.id" cols="12" sm="6" md="4" lg="3">
                  <v-card rounded="lg" variant="outlined" class="product-card">
                    <v-img :src="prod.image || '/placeholder-food.png'" height="160" cover class="bg-grey-lighten-3" />
                    <v-card-text>
                      <div class="font-weight-bold text-subtitle-1">{{ prod.name }}</div>
                      <div class="text-caption text-grey mb-2">{{ prod.description || 'لا يوجد وصف' }}</div>
                      <div class="d-flex justify-space-between align-center">
                        <span class="text-h6 color-teal">{{ prod.price }} د.ج</span>
                        <v-chip size="x-small" variant="tonal">{{ menu.name }}</v-chip>
                      </div>
                    </v-card-text>
                    <v-card-actions>
                      <v-btn size="small" variant="text" color="#13a89e" @click="openEditProduct(prod)">تعديل</v-btn>
                      <v-btn size="small" variant="text" color="error" @click="confirmDeleteProduct(prod)">حذف</v-btn>
                    </v-card-actions>
                  </v-card>
                </v-col>
              </template>
            </v-row>
          </div>
        </template>
      </v-container>

      <v-btn icon="mdi-plus" color="#18bbb0" size="large" elevation="6" class="fab-btn" @click="openDefaultAddModal" />
    </v-main>

    <!-- ── DIALOG: Add/Edit Category ── -->
    <v-dialog v-model="dialogs.category" max-width="500" persistent>
      <v-card rounded="0" class="pa-6 text-center dialog-modal">
        <h2 class="dialog-title mb-6">{{ editingId.category ? 'تعديل الفئة' : 'Add New Category' }}</h2>
        <v-text-field
          v-model="forms.category.name"
          label="Category Name"
          variant="underlined"
          color="#13a89e"
          class="mb-4"
          hide-details
          autofocus
        />
        <div class="d-flex justify-start mt-6">
          <v-btn variant="text" color="#13a89e" class="font-weight-bold" :loading="menuStore.submitting" @click="submitCategory">
            DONE
          </v-btn>
          <v-btn variant="text" color="grey" class="mr-2" :disabled="menuStore.submitting" @click="dialogs.category = false">
            CANCEL
          </v-btn>
        </div>
      </v-card>
    </v-dialog>

    <!-- ── DIALOG: Add/Edit Option Group ── -->
    <v-dialog v-model="dialogs.optionGroup" max-width="500" persistent>
      <v-card rounded="0" class="pa-6 text-center dialog-modal">
        <h2 class="dialog-title mb-6">{{ editingId.optionGroup ? 'تعديل المجموعة' : 'Add Option Group' }}</h2>
        <v-text-field
          v-model="forms.optionGroup.name"
          label="Option Group Name (مثال: الإضافات)"
          variant="underlined"
          color="#13a89e"
          class="mb-4"
          hide-details
        />
        <div class="d-flex justify-start mt-6">
          <v-btn variant="text" color="#13a89e" class="font-weight-bold" :loading="menuStore.submitting" @click="submitOptionGroup">
            DONE
          </v-btn>
          <v-btn variant="text" color="grey" @click="dialogs.optionGroup = false">CANCEL</v-btn>
        </div>
      </v-card>
    </v-dialog>

    <!-- ── DIALOG: Add/Edit Option ── -->
    <v-dialog v-model="dialogs.option" max-width="500" persistent>
      <v-card rounded="0" class="pa-6 dialog-modal" dir="rtl">
        <h2 class="dialog-title mb-6 text-center">{{ editingId.option ? 'تعديل الخيار' : 'إضافة خيار فرعي' }}</h2>
        <v-select
          v-model="forms.option.option_group"
          :items="menuStore.optionGroups"
          item-title="name"
          item-value="id"
          label="المجموعة"
          variant="underlined"
          color="#13a89e"
          class="mb-3"
        />
        <v-text-field v-model="forms.option.name" label="اسم الخيار (مثال: جبن إضافي)" variant="underlined" color="#13a89e" class="mb-3" />
        <v-text-field v-model.number="forms.option.price" label="السعر (د.ج)" type="number" variant="underlined" color="#13a89e" class="mb-3" />
        <v-text-field v-model.number="forms.option.calories" label="السعرات الحرارية (اختياري)" type="number" variant="underlined" color="#13a89e" class="mb-3" />
        <div class="d-flex justify-start mt-6">
          <v-btn variant="text" color="#13a89e" class="font-weight-bold" :loading="menuStore.submitting" @click="submitOption">
            حفظ
          </v-btn>
          <v-btn variant="text" color="grey" @click="dialogs.option = false">إلغاء</v-btn>
        </div>
      </v-card>
    </v-dialog>

    <!-- ── DIALOG: Add/Edit Product ── -->
    <v-dialog v-model="dialogs.product" max-width="600" persistent>
      <v-card rounded="0" class="pa-6 dialog-modal" dir="rtl">
        <h2 class="dialog-title mb-6 text-center">{{ editingId.product ? 'تعديل المنتج' : 'إضافة منتج جديد' }}</h2>
        <v-text-field v-model="forms.product.name" label="اسم المنتج" variant="underlined" color="#13a89e" class="mb-3" />
        <v-select
          v-model="forms.product.menu"
          :items="menuStore.menus"
          item-title="name"
          item-value="id"
          label="الفئة / القائمة"
          variant="underlined"
          color="#13a89e"
          class="mb-3"
        />
        <v-text-field v-model.number="forms.product.price" label="السعر (د.ج)" type="number" variant="underlined" color="#13a89e" class="mb-3" />
        <v-textarea v-model="forms.product.description" label="الوصف" rows="2" variant="underlined" color="#13a89e" class="mb-3" />
        <v-select
          v-model="forms.product.options"
          :items="allOptionsList"
          item-title="label"
          item-value="id"
          label="الخيارات المتاحة للمنتج"
          multiple
          chips
          variant="underlined"
          color="#13a89e"
          class="mb-3"
        />
        <v-file-input
          v-model="forms.product.image"
          :label="editingId.product ? 'صورة جديدة (اختياري — اتركيها فارغة للاحتفاظ بالحالية)' : 'صورة المنتج'"
          accept="image/*"
          variant="underlined"
          color="#13a89e"
          class="mb-3"
        />

        <div class="d-flex justify-start mt-6">
          <v-btn variant="text" color="#13a89e" class="font-weight-bold" :loading="menuStore.submitting" @click="submitProduct">
            حفظ المنتج
          </v-btn>
          <v-btn variant="text" color="grey" @click="dialogs.product = false">إلغاء</v-btn>
        </div>
      </v-card>
    </v-dialog>
  </v-app>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { useMenuStore } from '@/stores/menuStore'
import type { Menu, OptionGroup, Option, Product } from '@/types/menu'

const router = useRouter()
const authStore = useAuthStore()
const menuStore = useMenuStore()

const activeTab = ref<'categories' | 'addons' | 'products'>('categories')
const selectedCategoryFilter = ref<number | null>(null)

const storeName = computed(() => authStore.user?.full_name || 'My Shop')

// Dialog controllers
const dialogs = reactive({
  category: false,
  optionGroup: false,
  option: false,
  product: false,
})

// حالة التعديل: null = وضع "إضافة"، رقم = وضع "تعديل" لهذا الـ id
const editingId = reactive({
  category: null as number | null,
  optionGroup: null as number | null,
  option: null as number | null,
  product: null as number | null,
})

// Forms state
const forms = reactive({
  category: { name: '' },
  optionGroup: { name: '' },
  option: { option_group: null as number | null, name: '', price: 0, calories: null as number | null },
  product: {
    name: '',
    menu: null as number | null,
    price: 0,
    description: '',
    options: [] as number[],
    image: null as File | null,
  },
})

const allOptionsList = computed(() => {
  const list: { id: number; label: string }[] = []
  menuStore.optionGroups.forEach((group) => {
    group.options?.forEach((opt) => {
      if (opt.id) {
        list.push({ id: opt.id, label: `${group.name} - ${opt.name} (${opt.price} د.ج)` })
      }
    })
  })
  return list
})

const filterCategories = computed(() => [
  { id: null, name: 'All Categories' },
  ...menuStore.menus.map((m) => ({ id: m.id, name: m.name })),
])

const filteredMenus = computed(() => {
  if (!selectedCategoryFilter.value) return menuStore.menus
  return menuStore.menus.filter((m) => m.id === selectedCategoryFilter.value)
})

onMounted(() => {
  menuStore.fetchAllData()
})

function handleLogout() {
  authStore.logout()
  router.push('/merchant/login')
}

// ── فتح نافذة "إضافة" (تصفير الفورم + editingId = null) ──
function openAddMenu()        { editingId.category = null; forms.category.name = ''; dialogs.category = true }
function openAddOptionGroup() { editingId.optionGroup = null; forms.optionGroup.name = ''; dialogs.optionGroup = true }
function openAddOption()      { editingId.option = null; forms.option = { option_group: null, name: '', price: 0, calories: null }; dialogs.option = true }
function openAddProduct()     { editingId.product = null; forms.product = { name: '', menu: null, price: 0, description: '', options: [], image: null }; dialogs.product = true }

function openDefaultAddModal() {
  if (activeTab.value === 'categories') openAddMenu()
  else if (activeTab.value === 'addons') openAddOptionGroup()
  else if (activeTab.value === 'products') openAddProduct()
}

// ── فتح نافذة "تعديل" (تعبئة الفورم بالبيانات الحالية) ──
function openEditMenu(menu: Menu) {
  editingId.category = menu.id
  forms.category.name = menu.name
  dialogs.category = true
}

function openEditOptionGroup(group: OptionGroup) {
  editingId.optionGroup = group.id
  forms.optionGroup.name = group.name
  dialogs.optionGroup = true
}

function openEditOption(opt: Option, groupId: number) {
  editingId.option = opt.id
  forms.option = {
    option_group: groupId,
    name: opt.name,
    price: Number(opt.price),
    calories: opt.calories ?? null,
  }
  dialogs.option = true
}

function openEditProduct(prod: Product) {
  editingId.product = prod.id
  forms.product = {
    name: prod.name,
    menu: prod.menu,
    price: Number(prod.price),
    description: prod.description || '',
    options: Object.values(prod.grouped_options || {}).flat().map((o) => o.id),
    image: null, // null = نحتفظ بالصورة القديمة إلا لو اختارت صورة جديدة
  }
  dialogs.product = true
}

// ── حذف مع تأكيد ──
async function confirmDeleteMenu(menu: Menu) {
  if (confirm(`سيتم حذف "${menu.name}" وكل منتجاته المرتبطة. متأكدة؟`)) {
    await menuStore.deleteMenu(menu.id)
  }
}
async function confirmDeleteOptionGroup(group: OptionGroup) {
  if (confirm(`سيتم حذف "${group.name}" وكل خياراتها. متأكدة؟`)) {
    await menuStore.deleteOptionGroup(group.id)
  }
}
async function confirmDeleteOption(opt: Option) {
  if (confirm(`سيتم حذف "${opt.name}" وإزالته من أي منتج مرتبط به. متأكدة؟`)) {
    await menuStore.deleteOption(opt.id)
  }
}
async function confirmDeleteProduct(prod: Product) {
  if (confirm(`سيتم حذف "${prod.name}" نهائياً. متأكدة؟`)) {
    await menuStore.deleteProduct(prod.id)
  }
}

// ── Submit Actions (تفرّق بين إضافة/تعديل حسب editingId) ──
async function submitCategory() {
  if (!forms.category.name) return
  const success = editingId.category
    ? await menuStore.updateMenu(editingId.category, { name: forms.category.name })
    : await menuStore.addMenu({ name: forms.category.name })
  if (success) dialogs.category = false
}

async function submitOptionGroup() {
  if (!forms.optionGroup.name) return
  const success = editingId.optionGroup
    ? await menuStore.updateOptionGroup(editingId.optionGroup, { name: forms.optionGroup.name })
    : await menuStore.addOptionGroup({ name: forms.optionGroup.name })
  if (success) dialogs.optionGroup = false
}

async function submitOption() {
  if (!forms.option.option_group || !forms.option.name) return
  const payload = {
    option_group: forms.option.option_group,
    name: forms.option.name,
    price: forms.option.price,
    calories: forms.option.calories,
  }
  const success = editingId.option
    ? await menuStore.updateOption(editingId.option, payload)
    : await menuStore.addOption(payload)
  if (success) dialogs.option = false
}

async function submitProduct() {
  if (!forms.product.menu || !forms.product.name || !forms.product.price) return
  const payload = {
    name: forms.product.name,
    menu: forms.product.menu,
    price: forms.product.price,
    description: forms.product.description,
    options: forms.product.options,
    image: forms.product.image,
  }
  const success = editingId.product
    ? await menuStore.updateProduct(editingId.product, payload)
    : await menuStore.addProduct(payload)
  if (success) dialogs.product = false
}
</script>

<style scoped>
.dashboard-app {
  background-color: #f4f5f7;
  font-family: 'Roboto', 'Cairo', sans-serif;
}

.merchant-header {
  background-color: #0d818a;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  color: #ffffff;
}

.header-left { display: flex; align-items: center; gap: 20px; }
.header-link { background: none; border: none; color: #b2dfdb; font-size: 0.85rem; cursor: pointer; }
.header-nav { display: flex; gap: 16px; }
.nav-item { font-size: 0.8rem; font-weight: 500; color: #b2dfdb; cursor: pointer; }
.nav-item.active { color: #ffffff; border-bottom: 2px solid #ffffff; }
.header-right { display: flex; align-items: center; }
.shop-title { font-size: 0.95rem; font-weight: 600; }

.action-bar {
  background-color: #13a89e;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  color: white;
}

.action-tabs { display: flex; gap: 24px; }
.tab-btn {
  background: none; border: none; color: rgba(255, 255, 255, 0.8);
  display: flex; align-items: center; gap: 8px;
  font-size: 0.85rem; font-weight: 600; cursor: pointer;
  padding: 8px 12px; border-radius: 4px; transition: background 0.2s;
}
.tab-btn.active, .tab-btn:hover { color: #ffffff; background-color: rgba(255, 255, 255, 0.15); }
.category-select { width: 200px; color: white; }
:deep(.category-select .v-field__input) { color: white !important; }

.workspace-area { min-height: calc(100vh - 104px); position: relative; }
.section-heading { font-size: 1.25rem; font-weight: 700; color: #333333; }
.card-item { border-color: #e0e0e0; background: #ffffff; }
.color-teal { color: #13a89e; }

.fab-btn { position: fixed; bottom: 24px; right: 24px; z-index: 99; }

.dialog-modal { box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3) !important; }
.dialog-title { font-size: 1.5rem; font-weight: 700; color: #212121; }
</style>