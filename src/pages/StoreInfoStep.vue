<template>
  <v-form ref="formRef" @submit.prevent="submit">
    <div class="fields-grid">

      <!-- Store Name -->
      <v-text-field
        v-model="info.trade_name"
        :rules="rules.tradeNameRules"
        label="الاسم التجاري - Store Name"
        placeholder="أدخل اسم لوحة المحل"
        variant="outlined"
        rounded="lg"
        dir="rtl"
      />

      <!-- Commercial Registration Number -->
      <v-text-field
        v-model="info.commercial_registration_number"
        :rules="rules.commercialRegRules"
        label="رقم السجل التجاري - Commercial Number"
        placeholder="يجب أن يكون مكوناً من 10 أرقام"
        variant="outlined"
        rounded="lg"
        dir="rtl"
      />

      <!-- Category -->
      <v-select
        v-model="info.category"
        :rules="rules.categoryRules"
        :items="store.categories"
        :loading="store.loading"
        item-title="name"
        item-value="id"
        label="التصنيف - Category"
        variant="outlined"
        rounded="lg"
        dir="rtl"
      />

      <!-- Nation (static for now) -->
      <v-select
        v-model="info.nation"
        :rules="rules.wilayaRules"
        :items="nations"
        item-title="label"
        item-value="value"
        label="الدولة - Country"
        variant="outlined"
        rounded="lg"
        dir="rtl"
      />

      <!-- Wilaya -->
      <v-select
        v-model="info.wilaya"
        :rules="rules.wilayaRules"
        :items="wilayas"
        item-title="label"
        item-value="value"
        label="الولاية - Wilaya"
        variant="outlined"
        rounded="lg"
        dir="rtl"
      />

      <!-- Tax registered -->
      <v-switch
        v-model="info.is_tax_registered"
        label="منشأتي مسجلة في الضرائب"
        color="primary"
        dir="rtl"
        inset
      />

      <!-- Tax document (only if is_tax_registered) -->
      <v-file-input
        v-if="info.is_tax_registered"
        v-model="taxFile"
        :rules="rules.taxDocRules"
        label="وثيقة التسجيل الضريبي"
        accept=".pdf,image/*"
        prepend-icon="mdi-paperclip"
        variant="outlined"
        rounded="lg"
        dir="rtl"
      />

    </div>

    <!-- Error -->
    <v-alert
      v-if="store.error"
      type="error"
      variant="tonal"
      class="mb-4"
      dir="rtl"
    >
      {{ store.error }}
    </v-alert>

    <!-- Next button -->
    <v-btn
      type="submit"
      color="primary"
      rounded="pill"
      size="large"
      block
      class="mt-2"
    >
      التالي
    </v-btn>
  </v-form>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useStoreRegistrationStore } from '@/stores/storeStore'
import { useStoreForm } from '@/composables/useStoreForm'

const emit = defineEmits<{ next: [] }>()

const store   = useStoreRegistrationStore()
const rules   = useStoreForm()
const formRef = ref()
const info    = store.storeInfo
const taxFile = ref<File | null>(null)

// نربطو الملف بالـ store
watch(taxFile, (file) => { info.tax_document = file })

const nations = [{ label: 'الجزائر', value: 'الجزائر' }]
const wilayas = [
  { label: 'النعامة / Naâma', value: '45' },
  { label: 'الجزائر / Alger', value: '16' },
  { label: 'وهران / Oran',    value: '31' },
]

async function submit() {
  const { valid } = await formRef.value.validate()
  if (valid) emit('next')
}
</script>

<style scoped>
.fields-grid { display: flex; flex-direction: column; gap: 4px; }
</style>