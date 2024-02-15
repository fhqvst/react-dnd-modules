import { DragOverlay, useDndContext } from '@dnd-kit/core'
import { CSSProperties, MutableRefObject, useMemo } from 'react'
import { createSnappingPreviewModifier, getWindowId } from './utils'
import { DraggableType, GRID_ID } from './constants'

const dragOverlayStyle: CSSProperties = {
  left: 0,
  top: 0,
}
export function SnappingPreview({
  gridRef,
  cellSize,
  gridSize,
  gapSize,
}: {
  cellSize: number
  gridSize: number
  gapSize: number
  gridRef: MutableRefObject<HTMLDivElement | null>
}) {
  const { active, over } = useDndContext()
  const modifiers = useMemo(() => [createSnappingPreviewModifier(gridRef, cellSize, gridSize, gapSize)], [cellSize, gridSize, gapSize])
  if (active?.data.current == null) {
    return null
  }

  const { width, height, type } = active.data.current
  const previewWidth = width * cellSize + (width - 1) * gapSize
  const previewHeight = height * cellSize + (height - 1) * gapSize

  const isMovingWindow = type === DraggableType.Window && over?.data.current?.id === GRID_ID
  const isExtractingTab = type === DraggableType.Module && over?.data.current?.id === GRID_ID

  return (
    <DragOverlay modifiers={modifiers} transition={'0ms'} style={dragOverlayStyle}>
      {(isMovingWindow || isExtractingTab) && (
        <div style={{ width: previewWidth, height: previewHeight }} className="bg-sky-600/10 border border-sky-600/50 rounded-sm" />
      )}
    </DragOverlay>
  )
}

export function FloatingPreview({ cellSize, gridSize, gapSize }: { cellSize: number; gridSize: number; gapSize: number }) {
  const { active, over, activeNode } = useDndContext()
  if (active?.data.current == null) {
    return null
  }

  const { width, height, type } = active.data.current
  const isMovingWindow = type === DraggableType.Window
  const isExtractingTab = type === DraggableType.Module

  const activeContainerId = getWindowId(active)
  const overContainerId = getWindowId(over)

  const previewWidth = width * cellSize + (width - 1) * gapSize
  const previewHeight = height * cellSize + (height - 1) * gapSize
  return (
    <DragOverlay transition="50ms" className="cursor-grabbing">
      {isMovingWindow && (
        <div style={{ width: previewWidth, height: previewHeight }} className="bg-slate-900 border border-slate-800 rounded-sm shadow-xl" />
      )}
      {isExtractingTab && activeContainerId !== overContainerId && (
        <div
          style={{ width: activeNode?.clientWidth, height: activeNode?.clientHeight }}
          className="bg-slate-900 border border-slate-800 rounded-sm shadow-xl"
        />
      )}
    </DragOverlay>
  )
}
