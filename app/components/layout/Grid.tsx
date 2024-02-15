import { DndContext, DragEndEvent, DragOverEvent, PointerSensor, useDndContext, useDroppable, useSensor, useSensors } from '@dnd-kit/core'
import { arrayMove } from '@dnd-kit/sortable'
import { uniqueId } from 'lodash-es'
import { CSSProperties, ComponentPropsWithoutRef, memo, startTransition, useCallback, useMemo, useRef, useState } from 'react'
import { IWindow } from '~/types'
import { FloatingPreview, SnappingPreview } from './Preview'
import { Window } from './Window'
import { DraggableType, GRID_ID } from './constants'
import {
  addModuleToWindow,
  checkDroppableSupports,
  closeTab,
  closeWindow,
  createSnapResizeModifier,
  customCollisionDetectionAlgorithm,
  findModule,
  findModuleWindow,
  findWindow,
  getId,
  getWindowId,
  removeModuleFromWindow,
  resizeWindow,
  selectTab,
  snapMoveToGrid,
} from './utils'
import { cn } from '~/cn'

const initialModules: IWindow[] = [
  {
    id: uniqueId(),
    col: 1,
    row: 1,
    width: 2,
    height: 3,
    actingModuleId: uniqueId(),
    modules: [
      {
        id: `${parseInt(uniqueId()) - 1}`,
        type: 'price-ladder',
        title: 'BTC-USD',
        props: {
          text: 'Hello world!',
        },
      },
      {
        id: `${parseInt(uniqueId()) - 1}`,
        type: 'price-ladder',
        title: 'ETH-BTC',
        props: {
          text: 'Hello world!',
        },
      },
    ],
  },
  {
    id: uniqueId(),
    col: 3,
    row: 1,
    width: 2,
    height: 3,
    actingModuleId: uniqueId(),
    modules: [
      {
        id: `${parseInt(uniqueId()) - 1}`,
        type: 'price-ladder',
        title: 'BTC Coinbase',
        props: {
          text: 'Hello world!',
        },
      },
      {
        id: `${parseInt(uniqueId()) - 1}`,
        type: 'price-ladder',
        title: 'ETH Coinbase',
        props: {
          text: 'Hello world!',
        },
      },
    ],
  },
]

const initialModulesPriceLadders: IWindow[] = Array(100)
  .fill(0)
  .map((_, i) => ({
    id: uniqueId(),
    width: 2,
    height: 3,
    col: 1 + ((2 * i) % 32),
    row: 1 + 3 * Math.floor(i / 32),
    actingModuleId: uniqueId(),
    modules: [
      {
        id: `${parseInt(uniqueId()) - 1}`,
        type: 'price-ladder',
        title: 'BTC/SEK',
        props: {
          text: 'Hello world!',
        },
      },
      {
        id: `${parseInt(uniqueId())}`,
        type: 'price-ladder',
        title: 'ETH/SEK',
        props: {
          text: 'Hello world!',
        },
      },
    ],
  }))

const initialModulesPerformance: IWindow[] = Array(100)
  .fill(0)
  .map((_, i) => ({
    id: uniqueId(),
    col: 1 + (i % 12),
    row: 1 + Math.floor(i / 12),
    width: 1,
    height: 1,
    actingModuleId: uniqueId(),
    modules: [
      {
        id: `${parseInt(uniqueId()) - 1}`,
        type: 'greeting',
        title: 'testing again',
        props: {
          text: 'Hello world!',
        },
      },
      {
        id: `${parseInt(uniqueId())}`,
        type: 'button',
        title: 'BTC/SEK and a long title',
        props: {
          text: 'Hello world!',
        },
      },
    ],
  }))

export interface IGridProps {
  items: IWindow[]
  rows: number
  cols: number
  cellSize: number
  gapSize: number
  onCreateTab: any
  onCloseTab: any
  onSelectTab: any
  onMoveTab: any
  onMoveWindow: any
  onResizeWindow: any
}

export function Grid({
  rows,
  cols,
  cellSize,
  gapSize,

  onCreateTab,
  onCloseTab,
  onSelectTab,
  onMoveTab,

  onMoveWindow,
  onResizeWindow,
}: ComponentPropsWithoutRef<'div'> & IGridProps) {
  const [items, setItems] = useState(initialModules)
  const gridSize = Math.max(rows, cols)
  const snapResizeModifier = useMemo(() => createSnapResizeModifier(cellSize, gridSize), [cellSize, gridSize])

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  )

  const handleDragOver = useCallback(function handleDragOver(event: DragOverEvent) {
    const { active, over } = event
    if (!checkDroppableSupports(active, over)) {
      return
    }

    switch (active.data.current?.type) {
      case DraggableType.Module:
        const activeId = getId(active)!
        const overId = getId(over)!

        const activeContainerId = getWindowId(active)
        const overContainerId = getWindowId(over)

        const isOverOtherWindow = overContainerId != null && activeContainerId != null && overContainerId !== activeContainerId
        const isOverGrid = overId != null && activeContainerId != null && overId === GRID_ID

        if (isOverOtherWindow || isOverGrid) {
          startTransition(() =>
            setItems((prev) => {
              const next = []
              const activeModule = findModule(prev, activeId)
              if (activeModule == null) {
                throw new Error('Active module not found')
              }
              const oldWindow = findModuleWindow(prev, activeId)
              const newWindow = isOverOtherWindow ? findWindow(prev, overContainerId) : undefined

              if (!oldWindow) {
                throw new Error('Could not find old window')
              }
              if (isOverOtherWindow && !newWindow) {
                throw new Error('Could not find new window')
              }

              for (let i = 0; i < prev.length; i++) {
                const window = prev[i]
                if (window.id === oldWindow.id) {
                  // If the window is transient we just remove the whole window by not including it
                  const newWindow = removeModuleFromWindow(prev[i], activeModule.id)
                  if (!window.isTransient && newWindow.modules.length > 0) {
                    next.push(newWindow)
                  }
                  continue
                }
                if (isOverOtherWindow && window.id === newWindow!.id) {
                  next.push(addModuleToWindow(prev[i], activeModule))
                  continue
                }
                next.push(prev[i])
              }

              if (isOverGrid) {
                next.push({
                  id: uniqueId(),
                  col: active.data.current!.col,
                  row: active.data.current!.row,
                  width: active.data.current!.width,
                  height: active.data.current!.height,
                  modules: [activeModule],
                  actingModuleId: activeModule.id,
                  isTransient: true,
                })
              }

              return next
            })
          )
        }
        break
      case DraggableType.Window:
        break
      case DraggableType.WindowResizer:
        break
    }
  }, [])

  const handleDragEnd = useCallback(function handleDragEnd(event: DragEndEvent) {
    const { active, over, delta } = event

    if (!checkDroppableSupports(active, over)) {
      return
    }

    const activeId = getId(active)!
    const overId = getId(over)!
    const overContainerId = getWindowId(over)

    switch (active.data.current?.type) {
      case DraggableType.Module:
        // If over any window, or the grid, move the module to that window at the correct index
        if (overId === GRID_ID) {
          startTransition(() =>
            setItems((prev) => {
              const activeWindowId = findModuleWindow(prev, activeId)?.id
              return prev.map((window) => {
                if (window.id === activeWindowId) {
                  const { x, y } = snapMoveToGrid({
                    active,
                    transformX: delta.x,
                    transformY: delta.y,
                    cellSize,
                    gridSize,
                  })
                  return {
                    ...window,
                    actingModuleId: window.actingModuleId ?? activeId,
                    col: window.col + x,
                    row: window.row + y,
                    isTransient: false,
                  }
                }
                return {
                  ...window,
                  isTransient: false,
                }
              })
            })
          )
          return
        }

        startTransition(() =>
          setItems((prev) => {
            return prev.map((window) => {
              if (window.id === overContainerId) {
                const oldIndex = window.modules.findIndex((module) => module.id === activeId)
                const newIndex = window.modules.findIndex((module) => module.id === overId)
                return {
                  ...window,
                  modules: arrayMove(window.modules, oldIndex, newIndex),
                  actingModuleId: window.actingModuleId ?? activeId,
                }
              }
              return {
                ...window,
                isTransient: false,
              }
            })
          })
        )
        return
      case DraggableType.Window:
        // If over the grid, just move that window
        if (overId === GRID_ID) {
          startTransition(() =>
            setItems((prev) => {
              return prev.map((window) => {
                if (window.id === activeId) {
                  const next = { ...window }
                  const { x, y } = snapMoveToGrid({
                    active,
                    // TODO adjust when having extracted tab from window
                    transformX: delta.x,
                    transformY: delta.y,
                    cellSize,
                    gridSize,
                  })
                  next.col += x
                  next.row += y
                  return next
                }
                return window
              })
            })
          )
          return
        }

        // If over any other window, move the window to that window
        startTransition(() =>
          setItems((prev) => {
            let oldWindow = findWindow(prev, activeId)
            if (oldWindow == null) {
              throw new Error('Window not found')
            }
            return prev
              .filter((window) => window.id !== activeId)
              .map((window) =>
                window.id === overId
                  ? {
                      ...window,
                      modules: [...window.modules, ...oldWindow!.modules],
                      actingModuleId: oldWindow!.actingModuleId ?? window.actingModuleId,
                    }
                  : window
              )
          })
        )
        return
      case DraggableType.WindowResizer:
        startTransition(() =>
          setItems((prev) => {
            const window = prev.find((window) => window.id === activeId)
            return resizeWindow(prev, activeId, window!.width + delta.x, window!.height + delta.y)
          })
        )
        return
    }
  }, [])

  const handleChangeTab = useCallback(function handleChangeTab(windowId: string, actingModuleId: string) {
    setItems((items) => selectTab(items, windowId, actingModuleId))
  }, [])

  const handleCloseTab = useCallback(function handleCloseTab(windowId: string, actingModuleId: string) {
    setItems((items) => closeTab(items, windowId, actingModuleId))
  }, [])

  const handleCloseWindow = useCallback(function handleCloseWindow(windowId: string) {
    setItems((items) => closeWindow(items, windowId))
  }, [])

  const gridRef = useRef<HTMLDivElement>(null)

  const style = useMemo<CSSProperties>(
    () => ({
      display: 'grid',
      width: gridSize * (cellSize + gapSize) + gapSize,
      height: gridSize * (cellSize + gapSize) + gapSize,
      gridTemplateColumns: `repeat(${gridSize}, ${cellSize}px)`,
      gridTemplateRows: `repeat(${gridSize}, ${cellSize}px)`,
      // gridTemplateColumns: `repeat(auto-fill, ${cellSize}px)`,
      // gridTemplateRows: `repeat(auto-fill, ${cellSize}px)`,
      gap: gapSize,
      padding: gapSize,
      scrollbarWidth: 'none',
      '--grid-size': `${cellSize + gapSize}px`,
    }),
    [gridSize, cellSize, gapSize, items]
  )

  // TODO increase/decrease number of columns/rows when dragging to the edge
  return (
    <DndContext
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      modifiers={[snapResizeModifier]}
      sensors={sensors}
      collisionDetection={customCollisionDetectionAlgorithm}
      autoScroll={false}
    >
      <div ref={gridRef} className="overflow-auto scroll-smooth" style={{ overscrollBehavior: 'none' }}>
        <div style={style}>
          <GridLines gridSize={gridSize} />
          {items.map((item) => (
            <Window
              key={item.id}
              window={item}
              onChangeTab={handleChangeTab}
              onCloseTab={handleCloseTab}
              onCloseWindow={handleCloseWindow}
            />
          ))}
          <SnappingPreview gridRef={gridRef} cellSize={cellSize} gridSize={gridSize} gapSize={gapSize} />
          <FloatingPreview cellSize={cellSize} gridSize={gridSize} gapSize={gapSize} />
        </div>
      </div>
    </DndContext>
  )
}

const GridLines = memo(function GridLines({ gridSize }: { gridSize: number }) {
  const { active } = useDndContext()
  const droppable = useDroppable({
    id: GRID_ID,
    data: { id: GRID_ID, supports: [DraggableType.Module, DraggableType.Window, DraggableType.WindowResizer] },
  })
  return (
    <div
      className={cn('grid-lines', active && 'cursor-grabbing')}
      ref={droppable.setNodeRef}
      style={{
        opacity: active ? 1 : 0,
        gridArea: `1 / 1 / ${gridSize + 1} / ${gridSize + 1}`,
      }}
    />
  )
})
