export interface BlockState {
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
