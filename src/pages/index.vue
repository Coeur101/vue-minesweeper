<script setup lang="ts" generic="T extends any, O extends any">
import MineBlock from '~/components/MineBlock.vue'
import { GamePlay } from '~/composables/index'

defineOptions({
  name: 'IndexPage',
})
const gamePlay = new GamePlay(12, 12)
const state = gamePlay.state
</script>

<template>
  <div>
    Minesweeper
    <div v-for="(row, y) in state" :key="y" flex="~" justify-center>
      <MineBlock
        v-for="(block, x) in row" :key="x" :block="block" @click="gamePlay.onClick(x, y)"
        @contextmenu.prevent.stop="gamePlay.rightClick(block)"
      />
    </div>
  </div>
  <div flex="~ gap-1 justify-center" mt-5>
    <button h-7 w-20 border hover:bg-gray-1 @click="gamePlay.reset">
      RESET
    </button>
    <button h-7 w-20 border hover:bg-gray-1 @click="toggleDev()">
      {{ isDev ? 'DEV' : 'NORMAL' }}
    </button>
  </div>
</template>
