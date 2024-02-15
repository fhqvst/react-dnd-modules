import { useDraggable } from '@dnd-kit/core'
import { useSortable } from '@dnd-kit/sortable'
import { CSS, Transform } from '@dnd-kit/utilities'
import { CSSProperties, memo, useMemo } from 'react'
import { cn } from '~/cn'
import { IModule, IWindow } from '~/types'
import { DraggableType } from './constants'
import { SyntheticListenerMap } from '@dnd-kit/core/dist/hooks/utilities'

export function Tab({ module, window, onChangeTab }: { module: IModule; window: IWindow; onChangeTab: any }) {
  const { height, width, col, row } = window
  const sortable = useSortable({
    id: `${module.id}-move-tab`,
    data: {
      type: DraggableType.Module,
      supports: [DraggableType.Module, DraggableType.WindowResizer],
      id: module.id,
      windowId: window.id,
      height,
      width,
      row,
      col,
    },
  })
  return (
    <TabInner
      module={module}
      setNodeRef={sortable.setNodeRef}
      actingModuleId={window.actingModuleId}
      onChangeTab={onChangeTab}
      isDragging={sortable.isDragging}
      transition={sortable.active ? sortable.transition : undefined}
      transform={sortable.transform}
      listeners={sortable.listeners}
    />
  )
}

export const TabInner = memo(function TabInner({
  module,
  setNodeRef,
  transition,
  transform,
  isDragging,
  listeners,
  actingModuleId,
  onChangeTab,
}: {
  setNodeRef: any
  module: IModule
  actingModuleId?: string
  onChangeTab: any
  isDragging: boolean
  transform: Transform | null
  transition?: string
  listeners?: SyntheticListenerMap
}) {
  const style: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <button
      ref={setNodeRef}
      className={cn(
        `relative transition-colors text-ellipsis whitespace-nowrap active:text-slate-600 border-b-2 border-b-transparent py-1 mx-2`,
        actingModuleId === module.id && `text-slate-300 active:text-slate-400 border-b-2 border-b-slate-400`,
        isDragging && `active:text-sky-500 text-sky-500 border-b-sky-500`
      )}
      onClick={() => onChangeTab?.(module.id)}
      style={style}
      {...listeners}
    >
      {module.title}
    </button>
  )
})
