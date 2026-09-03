<template>
  <v-app>
    <v-main>
      <v-row no-gutters class="min-h-screen">

        <!-- ── Left: Hero image ── -->
        <v-col cols="12" md="5" class="hero-panel d-none d-md-flex">
          <div class="hero-overlay">
            <h1 class="hero-title">انضم إلى مرسول،<br>احصل على طرق أكثر<br>لتنمية عملك</h1>
          </div>
        </v-col>

        <!-- ── Right: Form ── -->
        <v-col cols="12" md="7" class="form-panel">
          <div class="form-wrapper">

            <!-- Header -->
            <div class="form-header">
              <h2 class="form-title">إستمارة تسجيل</h2>
            </div>

            <!-- Stepper -->
            <div class="stepper-bar">
              <div
                v-for="(step, i) in steps"
                :key="step.key"
                class="stepper-item"
              >
                <div
                  class="stepper-circle"
                  :class="{
                    'active': currentStep === i,
                    'done': currentStep > i,
                  }"
                >
                  <v-icon v-if="currentStep > i" size="18">mdi-check</v-icon>
                  <v-icon v-else size="18">{{ step.icon }}</v-icon>
                </div>
                <span class="stepper-label">{{ step.title }}</span>
                <div v-if="i < steps.length - 1" class="stepper-line" :class="{ 'done': currentStep > i }" />
              </div>
            </div>

            <!-- Step Content -->
            <div class="step-content">
              <Transition name="slide-fade" mode="out-in">

                <StoreInfoStep
                  v-if="currentStep === 0"
                  key="step0"
                  @next="goNext"
                />

                <ContactInfoStep
                  v-else-if="currentStep === 1"
                  key="step1"
                  @next="goNext"
                  @back="goBack"
                />

                <ReviewStep
                  v-else-if="currentStep === 2"
                  key="step2"
                  @back="goBack"
                  @submit="handleSubmit"
                />

              </Transition>
            </div>

          </div>
        </v-col>
      </v-row>
    </v-main>

    <!-- Success Dialog -->
    <v-dialog v-model="showSuccess" max-width="420" persistent>
      <v-card class="success-card text-center pa-8">
        <v-icon size="64" color="success" class="mb-4">mdi-check-circle-outline</v-icon>
        <h2 class="mb-2">تم استلام طلبك!</h2>
        <p class="text-medium-emphasis mb-6">
          سيتم مراجعة طلبك من قبل الإدارة وسيصلك إشعار على أرقام هواتف المالكين عند القبول.
        </p>
        <v-btn color="primary" rounded="pill" size="large" block @click="handleSuccessClose">
          حسناً
        </v-btn>
      </v-card>
    </v-dialog>

  </v-app>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useStoreRegistrationStore } from '@/stores/storeStore'
import StoreInfoStep from './StoreInfoStep.vue'
import ContactInfoStep from './ContactInfoStep.vue'
import ReviewStep      from './ReviewStep.vue'

const store       = useStoreRegistrationStore()
const currentStep = ref(0)
const showSuccess = ref(false)

const steps = [
  { key: 'store_info',   title: 'معلومات المتجر',   icon: 'mdi-store-outline' },
  { key: 'contact_info', title: 'جهات اتصال المتجر', icon: 'mdi-phone-outline' },
  { key: 'review',       title: 'مراجعة',            icon: 'mdi-clipboard-check-outline' },
]

onMounted(() => store.fetchCategories())

function goNext()  { currentStep.value++ }
function goBack()  { currentStep.value-- }

async function handleSubmit() {
  const result = await store.submitApplication()
  if (result.success) showSuccess.value = true
}

function handleSuccessClose() {
  showSuccess.value = false
  store.reset()
  currentStep.value = 0
}
</script>

<style scoped>
.min-h-screen { min-height: 100vh; }

/* Hero */
.hero-panel {
  background: url('/hero-bg.jpg') center/cover no-repeat;
  position: relative;
  align-items: flex-end;
}
.hero-overlay {
  background: linear-gradient(to top, rgba(0,0,0,.7) 0%, transparent 60%);
  width: 100%;
  padding: 48px 40px;
}
.hero-title {
  color: #fff;
  font-size: 2rem;
  font-weight: 700;
  line-height: 1.5;
  direction: rtl;
}

/* Form panel */
.form-panel {
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fafafa;
  padding: 40px 24px;
}
.form-wrapper {
  width: 100%;
  max-width: 560px;
}
.form-header { margin-bottom: 32px; text-align: right; }
.form-title  { font-size: 1.5rem; font-weight: 700; }

/* Stepper */
.stepper-bar {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  margin-bottom: 36px;
  direction: rtl;
  gap: 0;
}
.stepper-item {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-direction: row-reverse;
}
.stepper-circle {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #e0e0e0;
  color: #9e9e9e;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  transition: all .25s;
}
.stepper-circle.active { background: #f5c518; color: #fff; }
.stepper-circle.done   { background: #4caf50; color: #fff; }
.stepper-label {
  font-size: .8rem;
  color: #757575;
  white-space: nowrap;
}
.stepper-line {
  width: 48px;
  height: 2px;
  background: #e0e0e0;
  margin: 0 8px;
  transition: background .25s;
}
.stepper-line.done { background: #4caf50; }

/* Transitions */
.slide-fade-enter-active,
.slide-fade-leave-active { transition: all .2s ease; }
.slide-fade-enter-from   { opacity: 0; transform: translateX(-16px); }
.slide-fade-leave-to     { opacity: 0; transform: translateX(16px); }

/* Success card */
.success-card { border-radius: 20px !important; }
</style>