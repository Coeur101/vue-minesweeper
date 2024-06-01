<script setup lang="ts" generic="T extends any, O extends any">
import MineBlock from '~/components/MineBlock.vue'
import type { BlockState } from '~/types'

defineOptions({
  name: 'IndexPage',
})
// 设置这个扫雷的画布大小
const WIDTH = 10
const HEIGHT = 10
let isMineGenerated = false
// 炸弹个数
let MINE_COUNT = 0
const state = ref(
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

// 随机生成炸弹
function generateMines(currentBlock: BlockState) {
  for (const row of state.value) {
    for (const block of row) {
      // 当前点击的周围不生成地雷
      if (Math.abs(currentBlock.x - block.x) <= 1) {
        continue
      }
      if (Math.abs(currentBlock.y - block.y) <= 1) {
        continue
      }
      // 十分之一的概率会出现地雷
      if (Math.random() < 0.1) {
        block.mine = true
        MINE_COUNT++
      }
    }
  }
}
// 计算格子边上有几个炸弹
function updateAdjacentMines() {
  state.value.forEach((row) => {
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

/**
 * 点击后查看周围的格子是否是0然后全部展开
 */
function expendZero(block: BlockState) {
  if (block.adjacentMines || block.mine) {
    return
  }
  getSibliing(block).forEach((item) => {
    if (!item.revealed && !item.flagged) {
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
    return state.value[y2][x2]
  }).filter(Boolean) as BlockState[]
}
// 游戏完成的逻辑
function gameYes() {
  if (!isMineGenerated) {
    return
  }
  // 拍平数组
  const blocks = state.value.flat()
  if (blocks.filter(block => block.flagged && block.mine).length === MINE_COUNT) {
    // alert("你找到了所有的炸弹")
  }
}
function onClick(x: number, y: number) {
  if (!isMineGenerated) {
    generateMines(state.value[y][x])
    updateAdjacentMines()
    isMineGenerated = true
  }
  expendZero(state.value[y][x])
  state.value[y][x].revealed = true
  if (state.value[y][x].mine) {
    // 把棋盘上的所有带炸弹的格子都给翻开
    state.value.forEach((row) => {
      row.forEach((block) => {
        if (block.mine) {
          block.revealed = true
          block.flagged = false
        }
      })
    })
    // window.alert("BOOM! 游戏结束")
  }
}
// 右键标记
function rightClick(block: BlockState) {
  if (block.revealed)
    return
  block.flagged = !block.flagged
  gameYes()
}
</script>

<template>
  <div>
    Minesweeper
    <div v-for="(row, y) in state" :key="y" flex="~" justify-center>
      <MineBlock
        v-for="(block, x) in row" :key="x" :block="block"
        @click="onClick(x, y)" @contextmenu.prevent.stop="rightClick(block)"
      />
    </div>
  </div>
</template>
