import type { Active, CollisionDetection, Modifier, Over } from '@dnd-kit/core'
import { closestCenter, pointerWithin, rectIntersection } from '@dnd-kit/core'
import { IModule, IWindow } from '~/types'
import { DraggableType, GRID_ID } from './constants'
import { MutableRefObject } from 'react'

export interface SnapToGridParams {
  active: Active | null | undefined
  transformX: number
  transformY: number
  cellSize: number
  gridSize: number
}

export function snapMoveToGrid({ active, transformX, transformY, cellSize, gridSize }: SnapToGridParams): { x: number; y: number } {
  if (active?.data.current == null) {
    return { x: transformX, y: transformY }
  }

  const x = Math.round(transformX / cellSize)
  const y = Math.round(transformY / cellSize)

  return {
    x: clamp(x, 1 - active.data.current.col, gridSize - active.data.current.col - active.data.current.width + 1),
    y: clamp(y, -active.data.current.row, gridSize - active.data.current.row - active.data.current.height + 1),
  }
}

export function snapResizeToGrid({ active, transformX, transformY, cellSize, gridSize }: SnapToGridParams): { x: number; y: number } {
  if (active?.data.current?.type !== DraggableType.WindowResizer) {
    return { x: transformX, y: transformY }
  }

  const x = Math.round(transformX / cellSize)
  const y = Math.round(transformY / cellSize)

  return {
    x: clamp(x, 1 - active.data.current.width, gridSize - active.data.current.col - active.data.current.width + 1),
    y: clamp(y, 1 - active.data.current.height, gridSize - active.data.current.row - active.data.current.height + 1),
  }
}

export function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

export function createSnappingPreviewModifier(
  gridRef: MutableRefObject<HTMLDivElement | null>,
  cellSize: number,
  gridSize: number,
  gapSize: number
): Modifier {
  return ({ transform, active, over }) => {
    if (active?.data.current == null || over == null) {
      return transform
    }
    const { type, row, col } = active.data.current
    if (over.id === GRID_ID && (type === DraggableType.Window || type === DraggableType.Module)) {
      const { x, y } = snapMoveToGrid({
        active,
        transformX: transform.x,
        transformY: transform.y,
        cellSize,
        gridSize,
      })

      const offset = {
        x: (gridRef?.current?.offsetLeft ?? 0) - (gridRef?.current?.scrollLeft ?? 0),
        y: (gridRef?.current?.offsetTop ?? 0) - (gridRef?.current?.scrollTop ?? 0),
      }

      return {
        ...transform,
        // Extra gapsize for grid padding. Not sure why we need -1 though.
        x: offset.x + (col + x - 1) * (cellSize + gapSize) + gapSize,
        y: offset.y + (row + y - 1) * (cellSize + gapSize) + gapSize,
      }
    }

    return transform
  }
}

export function createSnapResizeModifier(cellSize: number, gridSize: number = 0): Modifier {
  return ({ transform, active, activatorEvent }) => {
    if (activatorEvent == null || active?.data.current?.type !== DraggableType.WindowResizer) {
      return transform
    }
    return {
      ...transform,
      ...snapResizeToGrid({
        active,
        transformX: transform.x,
        transformY: transform.y,
        cellSize,
        gridSize,
      }),
    }
  }
}

export const customCollisionDetectionAlgorithm: CollisionDetection = (args) => {
  if (!args.pointerCoordinates) {
    // sanity check
    return []
  }

  // Get all elements at the pointer coordinates. This excludes elements which are overflowed,
  // so it won't include the droppable elements that are scrolled out of view.
  const targetElements = document.elementsFromPoint(args.pointerCoordinates.x, args.pointerCoordinates.y)

  const filteredDroppableContainers = args.droppableContainers.filter((container) => {
    if (!container.node.current) {
      return false
    }
    // Remove self
    if (container.data.current?.id === args.active.data.current?.id) {
      return false
    }
    return true
  })

  // Run the provided collision detection with the filtered droppable elements.
  return pointerWithin({
    ...args,
    droppableContainers: filteredDroppableContainers,
  })
}

export function toGridSpan(cell: number, size: number) {
  return `${cell} / ${cell + size}`
}

// TODO rename 'tab' to 'module'

export function closeTab(items: IWindow[], windowId: string, moduleId: string) {
  return items.map((window) => {
    if (window.id === windowId) {
      return {
        ...window,
        modules: window.modules.filter((module) => module.id !== moduleId),
        actingModuleId: window.actingModuleId === moduleId ? window.modules[0]?.id : window.actingModuleId,
      }
    }
    return window
  })
}

export function closeWindow(items: IWindow[], windowId: string) {
  return items.filter((window) => window.id !== windowId)
}

export function selectTab(items: IWindow[], windowId: string, moduleId: string) {
  return items.map((window) => {
    if (window.id === windowId) {
      return {
        ...window,
        actingModuleId: moduleId,
      }
    }
    return window
  })
}

export function moveTabToGrid(items: IWindow[], windowId: string, moduleId: string) {}

export function moveWindowOnGrid(items: IWindow[], windowId: string, col: number, row: number) {}

export function moveWindowToWindow(items: IWindow[], sourceWindowId: string, targetWindowId: string) {}

export function moveTabToWindow(items: IWindow[], windowId: string, moduleId: string) {}

export function resizeWindow(items: IWindow[], windowId: string, width: number, height: number) {
  return items.map((window) => {
    if (window.id === windowId) {
      return {
        ...window,
        width,
        height,
      }
    }
    return window
  })
}

export function checkDroppableSupports(active: Active | null, over: Over | null): boolean {
  return over?.data.current?.supports != null && over?.data.current?.supports.includes(active?.data.current?.type)
}

export function getDraggableType(active: Active | null): DraggableType | undefined {
  return active?.data.current?.type
}

export function getId(active: Active | Over | null): string | undefined {
  return active?.data.current?.id
}

export function getWindowId(active: Active | Over | null): string | undefined {
  return active?.data.current?.windowId
}

export function checkIsOverOtherWindow(active: Active | null, over: Over | null): boolean {
  return active != null && over != null && active.id !== over.id
}

export function removeModuleFromWindow(window: IWindow, moduleId: string): IWindow {
  const newModules = window.modules.filter((module) => module.id !== moduleId)
  return {
    ...window,
    modules: newModules,
    actingModuleId: window.actingModuleId === moduleId ? newModules[0]?.id : window.actingModuleId,
  }
}

export function addModuleToWindow(window: IWindow, module: IModule): IWindow {
  return {
    ...window,
    modules: [...window.modules, module],
  }
}

export function findModule(windows: IWindow[], moduleId: string): IModule | undefined {
  for (const window of windows) {
    for (const module of window.modules) {
      if (module.id === moduleId) {
        return module
      }
    }
  }
}

export function findWindow(windows: IWindow[], windowId: string): IWindow | undefined {
  return windows.find((window) => window.id === windowId)
}

export function findModuleWindow(windows: IWindow[], moduleId: string): IWindow | undefined {
  return windows.find((window) => window.modules.some((module) => module.id === moduleId))
}

export function isModuleInWindow(window: IWindow, moduleId: string): boolean {
  return window.modules.some((module) => module.id === moduleId)
}
