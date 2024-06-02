import type { BlockState } from '~/types'
/**
 * 关于棋盘内部的逻辑全部抽离
 */
export class GamePlay {
  // 设置这个扫雷的画布大小
  WIDTH = 12
  HEIGHT = 12
  isMineGenerated = false
  state = ref<BlockState[][]>([])
  // 周围的边界值 排列组合
  diretions = [
    [-1, -1],
    [-1, 0],
    [-1, 1],
    [0, -1],
    [0, 1],
    [1, -1],
    [1, 0],
    [1, 1],
  ]

  // 炸弹个数
  MINE_COUNT = 0
  constructor(public width: number, public height: number) {
    this.HEIGHT = height
    this.WIDTH = width
    this.reset()
  }

  // 随机生成炸弹
  generateMines(currentBlock: BlockState) {
    for (const row of this.state.value) {
      for (const block of row) {
        // 当前点击的周围不生成地雷
        if (Math.abs(currentBlock.x - block.x) <= 1) {
          continue
        }
        if (Math.abs(currentBlock.y - block.y) <= 1) {
          continue
        }
        // 十分之一的概率会出现地雷
        if (Math.random() < 0.3) {
          block.mine = true
          this.MINE_COUNT++
        }
      }
    }
  }

  // 计算格子边上有几个炸弹
  updateAdjacentMines() {
    this.state.value.forEach((row) => {
      row.forEach((block) => {
        // 已经又炸弹了就return
        if (block.mine) {
          return
        }
        // 计算周围有多少炸弹
        this.getSibliing(block).forEach((item) => {
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
  expendZero(block: BlockState) {
    if (block.adjacentMines || block.mine) {
      return
    }
    this.getSibliing(block).forEach((item) => {
      if (!item.revealed && !item.flagged) {
        item.revealed = true
        // 递归翻开全部为0的格子
        this.expendZero(item)
      }
    })
  }

  // 抽离获取点击边缘的各个地方的逻辑
  getSibliing(block: BlockState) {
    return this.diretions.map(([dx, dy]) => {
      const x2 = block.x + dx
      const y2 = block.y + dy
      if (x2 >= this.WIDTH || x2 < 0 || y2 >= this.HEIGHT || y2 < 0) {
        return undefined
      }
      return this.state.value[y2][x2]
    }).filter(Boolean) as BlockState[]
  }

  /**
   * 重置
   */
  reset = () => {
    this.state.value = Array.from({ length: this.HEIGHT }, (_, y) =>
      Array.from({ length: this.WIDTH }, (_, x): BlockState => {
        return {
          x,
          y,
          adjacentMines: 0,
          revealed: false,
        }
      }))
    this.isMineGenerated = false
  }

  // 游戏完成的逻辑
  gameYes() {
    if (!this.isMineGenerated) {
      return
    }
    // 拍平数组
    const blocks = this.state.value.flat()
    if (blocks.filter(block => block.flagged && block.mine).length === this.MINE_COUNT) {
      // alert("你找到了所有的炸弹")
    }
  }

  onClick(x: number, y: number) {
    if (!this.isMineGenerated) {
      this.generateMines(this.state.value[y][x])
      this.updateAdjacentMines()
      this.isMineGenerated = true
    }
    this.expendZero(this.state.value[y][x])
    this.state.value[y][x].revealed = true
    if (this.state.value[y][x].mine) {
      // 把棋盘上的所有带炸弹的格子都给翻开
      this.state.value.forEach((row) => {
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
  rightClick(block: BlockState) {
    if (block.revealed)
      return
    block.flagged = !block.flagged
    this.gameYes()
  }
}
