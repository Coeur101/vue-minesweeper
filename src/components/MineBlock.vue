<script setup lang='ts'>
import type { BlockState } from '~/types'

defineProps<{
  block: BlockState
}>()
const dev = false
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
  <button
    m="0.5" :class="getBlockClass(block)" h-10 w-10 border
  >
    <template v-if="block.revealed || !dev">
      {{ block.mine ? "💣" : block.adjacentMines }}
    </template>
    <template v-if="block.flagged">
      {{ "🚩" }}
    </template>
  </button>
</template>
