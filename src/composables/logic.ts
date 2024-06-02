import type { BlockState, GameState } from '~/types'
/**
 * 关于棋盘内部的逻辑全部抽离
 */
export class GamePlay {
  state = ref() as Ref<GameState>

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

  constructor(public WIDTH: number, public HEIGHT: number, public MINES_COUNT: number) {
    this.reset()
  }

  get borad() {
    return this.state.value.borad
  }

  // 计算范围内的随机数
  getRandomInt(min: number, max: number) {
    return Math.round(Math.random() * (max - min) + min)
  }

  // 随机生成炸弹
  generateMines(currentBlock: BlockState) {
    const randomMines = () => {
      const x = this.getRandomInt(0, this.WIDTH - 1)
      const y = this.getRandomInt(0, this.HEIGHT - 1)
      if (Math.abs(currentBlock.x - x) <= 1) {
        return false
      }
      if (Math.abs(currentBlock.y - y) <= 1) {
        return false
      }
      if (this.borad[y][x].mine) {
        return false
      }
      this.borad[y][x].mine = true
      return true
    }
    // 通过炸弹的个个数来遍历哪几个格子需要放置炸弹
    Array.from({ length: this.MINES_COUNT }, () => false).forEach(() => {
      let placed = false
      // 不断调用随机生成炸弹的函数，直到成功为止
      while (!placed) {
        placed = randomMines()
      }
    })
  }

  // 计算格子边上有几个炸弹
  updateAdjacentMines() {
    this.borad.forEach((row) => {
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
      return this.state.value.borad[y2][x2]
    }).filter(Boolean) as BlockState[]
  }

  /**
   * 重置
   */
  reset = () => {
    this.state.value = {
      borad: Array.from({ length: this.HEIGHT }, (_, y) =>
        Array.from({ length: this.WIDTH }, (_, x): BlockState => {
          return {
            x,
            y,
            adjacentMines: 0,
            revealed: false,
          }
        })),
      isMineGenerated: false,
      gameState: 'play',
    }
  }

  // 游戏完成的逻辑
  gameYes() {
    if (!this.state.value.isMineGenerated) {
      return
    }
    // 拍平数组
    const blocks = this.state.value.borad.flat()
    if (blocks.filter(block => block.flagged && block.mine).length === this.MINES_COUNT) {
      this.state.value.gameState = 'win'
      // alert("你找到了所有的炸弹")
    }
  }

  onClick(x: number, y: number) {
    // 判断是否胜利或失败，然后短路
    if (this.state.value.gameState === 'lose' || this.state.value.gameState === 'win') {
      return
    }
    if (!this.state.value.isMineGenerated) {
      this.generateMines(this.state.value.borad[y][x])
      this.updateAdjacentMines()
      this.state.value.isMineGenerated = true
    }
    this.expendZero(this.state.value.borad[y][x])
    this.state.value.borad[y][x].revealed = true
    if (this.state.value.borad[y][x].mine) {
      // 把棋盘上的所有带炸弹的格子都给翻开
      this.state.value.borad.forEach((row) => {
        row.forEach((block) => {
          if (block.mine) {
            block.revealed = true
            block.flagged = false
          }
        })
      })
      this.state.value.gameState = 'lose'
      // window.alert("BOOM! 游戏结束")
    }
  }

  // 右键标记
  rightClick(block: BlockState) {
    // 判断是否胜利或失败，然后短路
    if (this.state.value.gameState === 'lose' || this.state.value.gameState === 'win') {
      return
    }
    if (block.revealed)
      return
    block.flagged = !block.flagged
    this.gameYes()
  }
}
