<script setup lang='ts'>
import type { BlockState } from '~/types'
import { isDev } from '~/composables'

defineProps<{
  block: BlockState
}>()
const NumberColors = [
  'text-transparent',
  'text-red-500',
  'text-orange-500',
  'text-yellow-500',
  'text-green-500',
  'text-blue-500',
  'text-indigo-500',
  'text-purple-500',
  'text-pink-500',
]
// 交互
function getBlockClass(item: BlockState) {
  if (item.flagged) {
    return 'bg-gray-500/50'
  }
  if (!item.revealed) {
    return 'bg-gray-500/50 hover:bg-gray'
  }
  return item.mine ? 'bg-red-500' : NumberColors[item.adjacentMines as number]
}
</script>

<template>
  <button m="0.5" :class="getBlockClass(block)" min-h-10 min-w-10 border font-600>
    <template v-if="block.revealed || isDev">
      {{ block.mine ? "💣" : block.adjacentMines }}
    </template>
    <template v-if="block.flagged && !block.revealed">
      {{ "🚩" }}
    </template>
  </button>
</template>
