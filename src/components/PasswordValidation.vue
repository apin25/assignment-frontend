<script setup lang="ts">
import { computed } from 'vue'
import { AlertTriangle } from 'lucide-vue-next'

interface Props {
  password: string
  showValidation?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showValidation: true
})

const passwordLength = computed(() => props.password.length)
const isPasswordValid = computed(() => passwordLength.value >= 8)
const shouldShowWarning = computed(() => 
  props.showValidation && props.password.length > 0 && !isPasswordValid.value
)
</script>

<template>
  <div
    v-if="shouldShowWarning"
    class="mt-2 bg-orange-50 border border-orange-200 rounded-md p-3 flex items-start"
  >
    <AlertTriangle class="h-4 w-4 text-orange-400 mt-0.5 mr-2 flex-shrink-0" />
    <p class="text-sm text-orange-800">
      Please lengthen this text to 8 characters or more (you are currently using {{ passwordLength }} characters).
    </p>
  </div>
</template>
