<template>
  <v-form ref="formRef" @submit.prevent="submit">

    <!-- عدد المالكين -->
    <v-text-field
      v-model.number="contact.number_of_owners"
      label="عدد المالكين"
      type="number"
      min="1"
      max="10"
      variant="outlined"
      rounded="lg"
      dir="rtl"
      class="mb-2"
      @update:model-value="syncOwners"
    />

    <!-- بيانات كل مالك -->
    <div
      v-for="(owner, i) in contact.owners"
      :key="i"
      class="owner-card mb-4"
    >
      <div class="owner-header">
        <span class="owner-title">المالك {{ i + 1 }}</span>
      </div>

      <div class="owner-fields">
        <v-text-field
          v-model="owner.founder_name"
          :rules="rules.founderNameRules"
          label="الاسم الكامل"
          variant="outlined"
          rounded="lg"
          dir="rtl"
        />
        <v-text-field
          v-model="owner.phone_number"
          :rules="rules.ownerPhoneRules"
          label="رقم الهاتف"
          variant="outlined"
          rounded="lg"
          dir="ltr"
        />
        <v-text-field
          v-model="owner.email"
          :rules="rules.ownerEmailRules"
          label="البريد الإلكتروني"
          variant="outlined"
          rounded="lg"
          dir="ltr"
        />
        <v-text-field
          v-model="owner.position"
          :rules="rules.positionRules"
          label="المنصب"
          variant="outlined"
          rounded="lg"
          dir="rtl"
        />
      </div>
    </div>

    <!-- Error -->
    <v-alert v-if="store.error" type="error" variant="tonal" class="mb-4" dir="rtl">
      {{ store.error }}
    </v-alert>

    <!-- Buttons -->
    <div class="btn-row">
      <v-btn variant="outlined" rounded="pill" size="large" @click="emit('back')">
        رجوع
      </v-btn>
      <v-btn type="submit" color="primary" rounded="pill" size="large">
        التالي
      </v-btn>
    </div>

  </v-form>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useStoreRegistrationStore } from '@/stores/storeStore'
import { useStoreForm } from '@/composables/useStoreForm'
import type { OwnerPayload } from '@/types/store'

const emit = defineEmits<{ next: []; back: [] }>()

const store   = useStoreRegistrationStore()
const rules   = useStoreForm()
const formRef = ref()
const contact = store.contactInfo

function emptyOwner(): OwnerPayload {
  return { founder_name: '', phone_number: '', email: '', position: '' }
}

// نزيد أو نحذف المالكين حسب العدد المدخل
function syncOwners(count: number) {
  const current = contact.owners?.length ?? 0
  if (count > current) {
    for (let i = current; i < count; i++) {
      contact.owners?.push(emptyOwner())
    }
  } else {
    contact.owners?.splice(count)
  }
}

async function submit() {
  const { valid } = await formRef.value.validate()
  if (valid) emit('next')
}
</script>

<style scoped>
.owner-card {
  border: 1px solid #e0e0e0;
  border-radius: 16px;
  padding: 20px;
  background: #fff;
}
.owner-header {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 16px;
}
.owner-title {
  font-weight: 600;
  font-size: .95rem;
  color: #424242;
}
.owner-fields { display: flex; flex-direction: column; gap: 4px; }
.btn-row {
  display: flex;
  justify-content: space-between;
  gap: 12px;
}
.btn-row .v-btn { flex: 1; }
</style>