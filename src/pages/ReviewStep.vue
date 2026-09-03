<template>
  <div>
    <!-- Store Info Summary -->
    <div class="review-section">
      <h3 class="section-title">معلومات المتجر</h3>
      <div class="info-grid">
        <ReviewRow label="الاسم التجاري"       :value="info.trade_name" />
        <ReviewRow label="رقم السجل التجاري"   :value="info.commercial_registration_number" />
        <ReviewRow label="الفئة"               :value="categoryName" />
        <ReviewRow label="الدولة"              :value="info.nation" />
        <ReviewRow label="الولاية"             :value="wilayaLabel" />
        <ReviewRow
          label="مسجل في الضرائب"
          :value="info.is_tax_registered ? 'نعم' : 'لا'"
        />
      </div>
    </div>

    <v-divider class="my-4" />

    <!-- Owners Summary -->
    <div class="review-section">
      <h3 class="section-title">المالكون ({{ contact.number_of_owners }})</h3>
      <div
        v-for="(owner, i) in contact.owners"
        :key="i"
        class="owner-summary mb-3"
      >
        <p class="owner-index">المالك {{ i + 1 }}</p>
        <div class="info-grid">
          <ReviewRow label="الاسم"       :value="owner.founder_name" />
          <ReviewRow label="الهاتف"      :value="owner.phone_number" />
          <ReviewRow label="البريد"      :value="owner.email" />
          <ReviewRow label="المنصب"      :value="owner.position" />
        </div>
      </div>
    </div>

    <!-- Error -->
    <v-alert v-if="store.error" type="error" variant="tonal" class="mb-4" dir="rtl">
      {{ store.error }}
    </v-alert>

    <!-- Buttons -->
    <div class="btn-row mt-6">
      <v-btn
        variant="outlined"
        rounded="pill"
        size="large"
        :disabled="store.submitting"
        @click="emit('back')"
      >
        رجوع
      </v-btn>
      <v-btn
        color="primary"
        rounded="pill"
        size="large"
        :loading="store.submitting"
        @click="emit('submit')"
      >
        إرسال الطلب
      </v-btn>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useStoreRegistrationStore } from '@/stores/storeStore'

const emit  = defineEmits<{ back: []; submit: [] }>()
const store = useStoreRegistrationStore()
const info  = store.storeInfo
const contact = store.contactInfo

const wilayas: Record<string, string> = {
  '45': 'النعامة / Naâma',
  '16': 'الجزائر / Alger',
  '31': 'وهران / Oran',
}

const categoryName = computed(() =>
  store.categories.find(c => c.id === info.category)?.name ?? '-'
)

const wilayaLabel = computed(() =>
  wilayas[info.wilaya ?? ''] ?? info.wilaya ?? '-'
)
</script>

<!-- ReviewRow — مكون مضمّن صغير لعرض الصفوف -->
<script lang="ts">
import { defineComponent, h } from 'vue'

export const ReviewRow = defineComponent({
  props: {
    label: String,
    value: String,
  },
  setup(props) {
    return () =>
      h('div', { class: 'review-row' }, [
        h('span', { class: 'review-label' }, props.label),
        h('span', { class: 'review-value' }, props.value ?? '-'),
      ])
  },
})
</script>

<style scoped>
.review-section { direction: rtl; }
.section-title  { font-size: 1rem; font-weight: 700; margin-bottom: 12px; color: #212121; }
.info-grid      { display: flex; flex-direction: column; gap: 8px; }

:deep(.review-row) {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
}
:deep(.review-label) { color: #757575; font-size: .9rem; }
:deep(.review-value) { font-weight: 600; font-size: .9rem; }

.owner-summary { background: #f9f9f9; border-radius: 12px; padding: 16px; }
.owner-index   { font-weight: 700; font-size: .85rem; color: #1976d2; margin-bottom: 8px; }

.btn-row {
  display: flex;
  justify-content: space-between;
  gap: 12px;
}
.btn-row .v-btn { flex: 1; }
</style>