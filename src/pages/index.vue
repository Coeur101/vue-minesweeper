<script setup lang="ts" generic="T extends any, O extends any">
defineOptions({
  name: 'IndexPage',
})
interface BlockState {
  x: number
  y: number
  // 是否被翻开
  revealed?: boolean
  // 是否被标记
  flagged?: boolean
  // 是否是地雷
  mine?: boolean
  // 附近的地雷数
  adjacentMines?: number
}
// 设置这个扫雷的画布大小
const WIDTH = 10
const HEIGHT = 10
const state = reactive(
  Array.from({ length: HEIGHT }, (_, y) =>
    Array.from({ length: WIDTH }, (_, x): BlockState => {
      return {
        x,
        y,
      }
    })),
)
function onClick(x: number, y: number) {
  state[y][x].revealed = true
  // if (state[y][x].mine) {
  //   window.alert('游戏结束')
  // }
}
function rightClick(block: BlockState) {
  block.revealed = false
  block.flagged = !block.flagged
}
// 随机生成炸弹
function generateMines() {
  for (const row of state) {
    for (const block of row) {
      // 十分之一的概率会出现地雷
      block.mine = Math.random() < 0.3
      // 全部盖住
      block.revealed = false
      block.adjacentMines = 0
    }
  }
}
// 周围的边界值 排列组合
const diretions = [
  [-1, -1],
  [-1, 0],
  [-1, 1],
  [0, -1],
  [0, 1],
  [1, -1],
  [1, 0],
  [1, 1],
]
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
// 计算格子边上有几个炸弹
function updateAdjacentMines() {
  state.forEach((row, y) => {
    row.forEach((block, x) => {
      // 已经又炸弹了就return
      if (block.mine) {
        return
      }
      // 计算周围有多少炸弹
      diretions.forEach(([dx, dy]) => {
        const x2 = x + dx
        const y2 = y + dy
        if (x2 >= WIDTH || x2 < 0 || y2 >= HEIGHT || y2 < 0) {
          return
        }
        block.adjacentMines = state[y2][x2].mine
          ? (block.adjacentMines as number) + 1
          : block.adjacentMines
      })
    })
  })
}
// 交互
function getBlockClass(item: BlockState) {
  if (!item.revealed) {
    return 'bg-gray-500/10'
  }
  return item.mine ? 'bg-red-500' : NumberColors[item.adjacentMines as number]
}
generateMines()
updateAdjacentMines()
</script>

<template>
  <div>
    Minesweeper
    <div v-for="(row, y) in state" :key="y" flex="~" justify-center>
      <button
        v-for="(item, x) in row"
        :key="x"
        m="0.5"
        :class="getBlockClass(item)"
        h-10
        w-10
        border
        hover:bg-gray
        @contextmenu.prevent.stop="rightClick(item)"
        @click="onClick(x, y)"
      >
        <template v-if="item.revealed">
          {{ item.mine ? "💣" : item.adjacentMines }}
        </template>
        <template v-if="item.flagged && !item.revealed">
          {{ "🚩" }}
        </template>
      </button>
    </div>
  </div>
</template>
