<template>
  <div class="login-bg">
    <div class="login-card">

      <!-- Logo / Icon -->
      <div class="login-icon">
        <v-icon size="48" color="primary">mdi-store-check-outline</v-icon>
      </div>

      <!-- Title -->
      <h2 class="login-title">{{ step === 'phone' ? 'تسجيل الدخول' : 'أدخل رمز التحقق' }}</h2>
      <p class="login-subtitle">
        {{ step === 'phone'
          ? 'سوف نرسل لك رمزاً للتحقق من هاتفك وحسابك'
          : `تم إرسال رمز مكون من 6 أرقام إلى ${phone}`
        }}
      </p>

      <!-- ── Step 1: Phone ── -->
      <Transition name="fade" mode="out-in">
        <v-form
          v-if="step === 'phone'"
          key="phone"
          ref="phoneFormRef"
          @submit.prevent="submitPhone"
        >
          <v-text-field
            v-model="phone"
            :rules="phoneRules"
            label="رقم الهاتف"
            placeholder="0771234567"
            variant="outlined"
            rounded="lg"
            dir="ltr"
            class="mb-3"
            :disabled="auth.loading"
            autofocus
          />

          <v-alert
            v-if="auth.error"
            type="error"
            variant="tonal"
            class="mb-3"
            dir="rtl"
            density="compact"
          >
            {{ auth.error }}
          </v-alert>

          <v-btn
            type="submit"
            color="primary"
            rounded="pill"
            size="large"
            block
            :loading="auth.loading"
          >
            أرسل الرمز
          </v-btn>
        </v-form>

        <!-- ── Step 2: OTP ── -->
        <v-form
          v-else
          key="otp"
          ref="otpFormRef"
          @submit.prevent="submitOTP"
        >
          <!-- OTP inputs — 6 خانات منفصلة -->
          <div class="otp-row">
            <input
              v-for="(_, i) in 6"
              :key="i"
              :ref="el => { if (el) otpRefs[i] = el as HTMLInputElement }"
              v-model="otpDigits[i]"
              class="otp-input"
              type="text"
              inputmode="numeric"
              maxlength="1"
              @input="onOtpInput(i)"
              @keydown.backspace="onBackspace(i)"
              @paste.prevent="onPaste"
            />
          </div>

          <!-- Countdown + Resend -->
          <div class="resend-row">
            <span v-if="countdown > 0" class="countdown">
              إعادة الإرسال بعد {{ countdown }}s
            </span>
            <v-btn
              v-else
              variant="text"
              size="small"
              color="primary"
              :loading="auth.loading"
              @click="resendOTP"
            >
              إعادة إرسال الرمز
            </v-btn>
          </div>

          <v-alert
            v-if="auth.error"
            type="error"
            variant="tonal"
            class="mb-3"
            dir="rtl"
            density="compact"
          >
            {{ auth.error }}
          </v-alert>

          <v-btn
            type="submit"
            color="primary"
            rounded="pill"
            size="large"
            block
            :loading="auth.loading"
            :disabled="otpCode.length < 6"
          >
            تحقق
          </v-btn>

          <!-- Back -->
          <v-btn
            variant="text"
            block
            class="mt-2"
            @click="step = 'phone'"
          >
            تغيير رقم الهاتف
          </v-btn>

        </v-form>
      </Transition>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

const router = useRouter()
const auth   = useAuthStore()

// ── State ────────────────────────────────────────────────────────────────────
const step         = ref<'phone' | 'otp'>('phone')
const phone        = ref('')
const phoneFormRef = ref()
const otpFormRef   = ref()
const otpDigits    = ref<string[]>(Array(6).fill(''))
const otpRefs      = ref<HTMLInputElement[]>([])

// Countdown timer
const countdown    = ref(0)
let   countdownTimer: ReturnType<typeof setInterval> | null = null

// ── Computed ──────────────────────────────────────────────────────────────────
const otpCode = computed(() => otpDigits.value.join(''))

// ── Validation ────────────────────────────────────────────────────────────────
const phoneRules = [
  (v: string) => !!v || 'رقم الهاتف مطلوب',
  
]

// ── Countdown ─────────────────────────────────────────────────────────────────
function startCountdown(seconds = 60) {
  countdown.value = seconds
  countdownTimer  = setInterval(() => {
    if (countdown.value <= 0) {
      clearInterval(countdownTimer!)
      return
    }
    countdown.value--
  }, 1000)
}

onUnmounted(() => { if (countdownTimer) clearInterval(countdownTimer) })

// ── Step 1: Send OTP ──────────────────────────────────────────────────────────
async function submitPhone() {
  const { valid } = await phoneFormRef.value.validate()
  if (!valid) return

  const result = await auth.requestOTP(phone.value)
  if (result.success) {
    otpDigits.value = Array(6).fill('')
    step.value = 'otp'
    startCountdown(60)
    // focus على أول خانة بعد الانتقال
    setTimeout(() => otpRefs.value[0]?.focus(), 100)
  }
}

// ── Step 2: Verify OTP ────────────────────────────────────────────────────────
async function submitOTP() {
  if (otpCode.value.length < 6) return

  const result = await auth.verifyOTP(phone.value, otpCode.value)
  if (result.success) {
    router.push('/merchant/dashboard')
  }
}

async function resendOTP() {
  const result = await auth.requestOTP(phone.value)
  if (result.success) {
    otpDigits.value = Array(6).fill('')
    startCountdown(60)
    setTimeout(() => otpRefs.value[0]?.focus(), 100)
  }
}

// ── OTP input UX ──────────────────────────────────────────────────────────────
function onOtpInput(i: number) {
  const val = otpDigits.value[i]
  // نسمح بالأرقام فقط
  otpDigits.value[i] = val.replace(/\D/g, '').slice(-1)
  // انتقل للخانة التالية
  if (otpDigits.value[i] && i < 5) {
    otpRefs.value[i + 1]?.focus()
  }
  // auto-submit إذا اكتملت الخانات
  if (otpCode.value.length === 6) submitOTP()
}

function onBackspace(i: number) {
  if (!otpDigits.value[i] && i > 0) {
    otpDigits.value[i - 1] = ''
    otpRefs.value[i - 1]?.focus()
  }
}

function onPaste(e: ClipboardEvent) {
  const text = e.clipboardData?.getData('text') ?? ''
  const digits = text.replace(/\D/g, '').slice(0, 6).split('')
  digits.forEach((d, i) => { otpDigits.value[i] = d })
  otpRefs.value[Math.min(digits.length, 5)]?.focus()
  if (digits.length === 6) setTimeout(submitOTP, 100)
}
</script>

<style scoped>
.login-bg {
  min-height: 100vh;
  background: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

.login-card {
  background: #fff;
  border-radius: 24px;
  padding: 48px 40px;
  width: 100%;
  max-width: 440px;
  box-shadow: 0 4px 24px rgba(0,0,0,.08);
  text-align: center;
  direction: rtl;
}

.login-icon   { margin-bottom: 20px; }
.login-title  { font-size: 1.4rem; font-weight: 700; margin-bottom: 8px; }
.login-subtitle {
  color: #757575;
  font-size: .9rem;
  margin-bottom: 28px;
  line-height: 1.6;
}

/* OTP inputs */
.otp-row {
  display: flex;
  gap: 10px;
  justify-content: center;
  margin-bottom: 16px;
  direction: ltr;
}
.otp-input {
  width: 48px;
  height: 56px;
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  font-size: 1.4rem;
  font-weight: 700;
  text-align: center;
  outline: none;
  transition: border-color .2s;
  background: #fafafa;
}
.otp-input:focus { border-color: #1976d2; background: #fff; }

/* Resend */
.resend-row {
  text-align: center;
  margin-bottom: 16px;
  min-height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.countdown { font-size: .85rem; color: #9e9e9e; }

/* Transition */
.fade-enter-active, .fade-leave-active { transition: opacity .2s, transform .2s; }
.fade-enter-from { opacity: 0; transform: translateX(20px); }
.fade-leave-to   { opacity: 0; transform: translateX(-20px); }
</style>