<script setup lang="ts">
import { withQuery } from 'ufo'
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useScriptTriggerElement } from '../composables/useScriptTriggerElement'
import type { ElementScriptTrigger } from '#nuxt-scripts/types'

const props = defineProps<{
  serve: string
  placement: string
  format: string
  /**
   * Defines the trigger event to load the script.
   */
  trigger?: ElementScriptTrigger
}>()

const emit = defineEmits<{
  error: [error: string | Event]
  ready: [HTMLScriptElement]
}>()

const attrId = `_carbonads_js`
const carbonadsEl = ref<HTMLElement | null>(import.meta.client ? document.getElementById(attrId) : null)
// syncs to useScript status
const status = ref('awaitingLoad')

function loadCarbon() {
  if (!carbonadsEl.value) {
    return
  }
  status.value = 'loading'
  const script = document.createElement('script')
  script.setAttribute('src', withQuery('https://cdn.carbonads.com/carbon.js', {
    serve: props.serve,
    placement: props.placement,
    format: props.format,
  }))
  script.setAttribute('id', attrId)
  script.onerror = (err) => {
    if (status.value !== 'error') {
      status.value = 'error'
      emit('error', err)
    }
  }
  script.onload = () => {
    if (status.value !== 'loaded') {
      status.value = 'loaded'
      emit('ready', script)
    }
  }
  carbonadsEl.value.appendChild(script)
}

const trigger = useScriptTriggerElement({ trigger: props.trigger, el: carbonadsEl })
onMounted(() => {
  if (trigger === 'onNuxtReady') {
    loadCarbon()
  }
  else {
    trigger.then(loadCarbon)
  }
})

const rootAttrs = computed(() => {
  return {
    ...(trigger instanceof Promise ? trigger.ssrAttrs || {} : {}),
  }
})

onBeforeUnmount(() => {
  if (carbonadsEl.value) {
    carbonadsEl.value.remove()
  }
})
</script>

<template>
  <div ref="carbonadsEl" v-bind="rootAttrs">
    <slot v-if="status === 'awaitingLoad'" name="awaitingLoad" />
    <slot v-else-if="status === 'loading'" name="loading" />
    <slot v-else-if="status === 'error'" name="error" />
  </div>
</template>
