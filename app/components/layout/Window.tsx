import { useDraggable, useDroppable } from '@dnd-kit/core'
import {
  CSSProperties,
  ComponentPropsWithoutRef,
  PropsWithChildren,
  forwardRef,
  memo,
  startTransition,
  useCallback,
  useEffect,
  useState,
} from 'react'
import { cn } from '~/cn'
import { IModule, IWindow } from '~/types'
import { StatusBar } from './StatusBar'
import { TitleBar } from './TitleBar'
import { toGridSpan } from './utils'
import { DraggableType } from './constants'
import { Module } from './Module'

export const Window = memo(function Window({
  window,
  onCloseTab,
  onCloseWindow,
  onChangeTab,
}: {
  window: IWindow
  onCloseTab: any
  onCloseWindow: any
  onChangeTab: any
}) {
  const { id, isTransient, col, row, width, height, modules, actingModuleId } = window
  const droppable = useDroppable({
    id: `${id}-add-to-window-droppable`,
    data: { id, col, row, width, height, supports: [DraggableType.Window, DraggableType.Module, DraggableType.WindowResizer] },
  })
  const movable = useDraggable({
    id: `${id}-move-window-draggable`,
    data: { type: DraggableType.Window, id, col, row, width, height },
  })
  const resizable = useDraggable({
    id: `${id}-resize-window-draggable`,
    data: { type: DraggableType.WindowResizer, id, col, row, width, height },
  })

  const [style, setStyle] = useState<CSSProperties>({
    gridColumn: toGridSpan(col, width),
    gridRow: toGridSpan(row, height),
  })
  useEffect(() => {
    const nextStyle: CSSProperties = {
      gridColumn: toGridSpan(col, width),
      gridRow: toGridSpan(row, height),
      zIndex: 1,
    }

    const isBeingDroppedInto =
      droppable.isOver && (droppable.active?.data.current?.type === `window` || droppable.active?.data.current?.type === `tab`)

    const isResizing = resizable.transform != null

    if (isBeingDroppedInto) {
      nextStyle.outline = '2px solid var(--grid-droppable-outline)'
      startTransition(() => setStyle(nextStyle))
      return
    }
    if (isTransient && droppable.active?.data.current?.type === DraggableType.Module) {
      nextStyle.zIndex = 0
    }
    if (isResizing) {
      nextStyle.gridColumn = toGridSpan(col, width + resizable.transform!.x)
      nextStyle.gridRow = toGridSpan(row, height + resizable.transform!.y)
      startTransition(() => setStyle(nextStyle))
      return
    }
    startTransition(() => setStyle(nextStyle))
  }, [id, col, row, width, height, isTransient, droppable.isOver, resizable.transform, movable.transform])

  const handleRemove = useCallback(
    () => (modules.length > 1 ? onCloseTab(id, actingModuleId) : onCloseWindow(id)),
    [id, actingModuleId, modules]
  )
  const handleChangeTab = useCallback((actingModuleId: string) => onChangeTab(id, actingModuleId), [id, onChangeTab])

  return (
    <Wrapper ref={droppable.setNodeRef} style={style}>
      <TitleBar
        window={window}
        ref={movable.setNodeRef}
        listeners={movable.listeners}
        onChangeTab={handleChangeTab}
        onRemove={handleRemove}
      />
      <Modules modules={modules} actingModuleId={actingModuleId} />
      <StatusBar modules={modules} actingModuleId={actingModuleId} ref={resizable.setNodeRef} {...resizable.listeners} />
    </Wrapper>
  )
})

function Modules({ modules, actingModuleId }: { modules: IModule[]; actingModuleId?: string }) {
  return (
    <div className={cn('flex bg-slate-900 flex-1 overflow-auto', modules.length === 0 && `justify-center items-center bg-slate-900`)}>
      {modules.length ? modules.map((module) => (module.id === actingModuleId ? <Module key={module.id} {...module} /> : null)) : null}
    </div>
  )
}

export const Wrapper = forwardRef<HTMLDivElement, PropsWithChildren<ComponentPropsWithoutRef<'div'>>>(function Wrapper(
  { children, className, ...props },
  ref
) {
  return (
    <div
      ref={ref}
      {...props}
      className={cn('flex relative text-slate-500 text-xs bg-slate-900 border border-slate-800 flex-col rounded-sm', className)}
    >
      {children}
    </div>
  )
})

export const Content = memo(
  forwardRef<HTMLDivElement, ComponentPropsWithoutRef<'div'>>(function Content({ children, className, ...props }, ref) {
    return (
      <div ref={ref} {...props}>
        {children}
      </div>
    )
  })
)
