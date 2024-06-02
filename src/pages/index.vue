<script setup lang="ts" generic="T extends any, O extends any">
import MineBlock from '~/components/MineBlock.vue'
import { GamePlay } from '~/composables/index'
import Confiti from '~/components/Confiti.vue'

defineOptions({
  name: 'IndexPage',
})
const gamePlay = new GamePlay(5, 5, 5)
useStorage('minesweeperState', gamePlay.state)
const state = computed(() => gamePlay.borad)
function newGamePlay(level: 'easy' | 'medium' | 'hard') {
  switch (level) {
    case 'easy':
      gamePlay.reset(9, 9, 10)
      break

    case 'medium':
      gamePlay.reset(16, 16, 40, 'medium')
      break

    case 'hard':
      gamePlay.reset(30, 16, 99, 'hard')
      break
    default:
      break
  }
}
</script>

<template>
  <div w-auto scroll-auto p5>
    Minesweeper
    <p class="text-fuchsia font-600">
      difficulty: {{ gamePlay.state.value.difficulty }}
    </p>
    <div flex="~ gap-1 justify-center" m-2>
      <button border p-1 hover:bg-gray-1 @click="gamePlay.reset()">
        New Game
      </button>
      <button border p-1 hover:bg-gray-1 @click="newGamePlay('easy')">
        Easy
      </button>
      <button border p-1 hover:bg-gray-1 @click="newGamePlay('medium')">
        Medium
      </button>
      <button border p-1 hover:bg-gray-1 @click="newGamePlay('hard')">
        Hard
      </button>
    </div>
    <div v-for="(row, y) in state" :key="y" flex="~" justify-center>
      <MineBlock
        v-for="(block, x) in row" :key="x" :block="block" @click="gamePlay.onClick(x, y)"
        @contextmenu.prevent.stop="gamePlay.rightClick(block)"
      />
    </div>
  </div>
  <div flex="~ gap-1 justify-center" mt-5>
    <button h-7 w-20 border hover:bg-gray-1 @click="toggleDev()">
      {{ isDev ? 'NORMAL' : 'DEV' }}
    </button>
  </div>
  <Confiti :state="gamePlay.state.value.gameState === 'win'" />
</template>
