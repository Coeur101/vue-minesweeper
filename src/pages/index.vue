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
  adjacentMines: number
}
// 设置这个扫雷的画布大小
const WIDTH = 10
const HEIGHT = 10
let isMineGenerated = false
const dev = false
const state = reactive(
  Array.from({ length: HEIGHT }, (_, y) =>
    Array.from({ length: WIDTH }, (_, x): BlockState => {
      return {
        x,
        y,
        adjacentMines: 0,
        revealed: false,
      }
    })),
)
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
  state.forEach((row) => {
    row.forEach((block) => {
      // 已经又炸弹了就return
      if (block.mine) {
        return
      }
      // 计算周围有多少炸弹
      getSibliing(block).forEach((item) => {
        if (item.mine) {
          block.adjacentMines += 1
        }
      })
    })
  })
}
// 交互
function getBlockClass(item: BlockState) {
  if (!item.revealed) {
    return 'bg-gray-500/50'
  }
  return item.mine ? 'bg-red-500' : NumberColors[item.adjacentMines as number]
}
/**
 * 点击后查看周围的格子是否是0然后全部展开
 */
function expendZero(block: BlockState) {
  if (block.adjacentMines || block.mine) {
    return
  }
  getSibliing(block).forEach((item) => {
    if (!item.revealed) {
      item.revealed = true
      // 递归翻开全部为0的格子
      expendZero(item)
    }
  })
}
// 抽离获取点击边缘的各个地方的逻辑
function getSibliing(block: BlockState) {
  return diretions.map(([dx, dy]) => {
    const x2 = block.x + dx
    const y2 = block.y + dy
    if (x2 >= WIDTH || x2 < 0 || y2 >= HEIGHT || y2 < 0) {
      return undefined
    }
    return state[y2][x2]
  }).filter(Boolean) as BlockState[]
}
function onClick(x: number, y: number) {
  if (!isMineGenerated) {
    generateMines(state[y][x])
    updateAdjacentMines()
    isMineGenerated = true
  }
  expendZero(state[y][x])
  state[y][x].revealed = true

  if (state[y][x].mine) {
    // 把棋盘上的所有带炸弹的格子都给翻开
    state.forEach((row) => {
      row.forEach((block) => {
        if (block.mine) {
          block.revealed = true
        }
      })
    })

    // window.alert("BOOM! 游戏结束")
  }
}
// 右键标记
function rightClick(block: BlockState) {
  block.revealed = false

  block.flagged = !block.flagged
}
// 随机生成炸弹
function generateMines(currentBlock: BlockState) {
  for (const row of state) {
    for (const block of row) {
      // 当前点击的周围不生成地雷
      if (Math.abs(currentBlock.x - block.x) <= 1) {
        continue
      }
      if (Math.abs(currentBlock.y - block.y) <= 1) {
        continue
      }
      // 十分之一的概率会出现地雷
      block.mine = Math.random() < 0.1
    }
  }
}
</script>

<template>
  <div>
    Minesweeper
    <div v-for="(row, y) in state" :key="y" flex="~" justify-center>
      <button
        v-for="(item, x) in row" :key="x" m="0.5" :class="getBlockClass(item)" h-10 w-10 border hover:bg-gray
        @contextmenu.prevent.stop="rightClick(item)" @click="onClick(x, y)"
      >
        <template v-if="item.revealed || !dev">
          {{ item.mine ? "💣" : item.adjacentMines }}
        </template>
        <template v-if="item.flagged && !item.revealed">
          {{ "🚩" }}
        </template>
      </button>
    </div>
  </div>
</template>
