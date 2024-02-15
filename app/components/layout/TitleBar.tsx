import { SyntheticListenerMap } from '@dnd-kit/core/dist/hooks/utilities'
import { SortableContext, horizontalListSortingStrategy, rectSwappingStrategy } from '@dnd-kit/sortable'
import { IconGripHorizontal, IconX } from '@tabler/icons-react'
import { memo, forwardRef, ComponentPropsWithoutRef, useMemo } from 'react'
import { cn } from '~/cn'
import { IWindow } from '~/types'
import { Tab } from './Tab'
import { useDroppable } from '@dnd-kit/core'
import { DraggableType } from './constants'

export interface ITitleBarProps {
  window: IWindow
  onRemove?: any
  onChangeTab?: any
  listeners?: SyntheticListenerMap
}

export const TitleBar = memo(
  forwardRef<HTMLDivElement, ComponentPropsWithoutRef<'div'> & ITitleBarProps>(function TitleBar(
    { window, onRemove, onChangeTab, children, className, listeners, ...props },
    ref
  ) {
    const { id: windowId, col, row, width, height, modules } = window
    const droppable = useDroppable({
      id: `${windowId}-title-bar`,
      data: { supports: [DraggableType.Module, DraggableType.WindowResizer], id: windowId, windowId, col, row, width, height },
    })
    return (
      <div
        ref={ref}
        {...props}
        className={cn('border-b border-b-slate-800 bg-slate-900 flex items-stretch overflow-x-hidden justify-between', className)}
      >
        <TitleBarInner
          window={window}
          onRemove={onRemove}
          onChangeTab={onChangeTab}
          listeners={listeners}
          setNodeRef={droppable.setNodeRef}
        />
      </div>
    )
  })
)

export const TitleBarInner = memo(
  forwardRef<HTMLDivElement, ComponentPropsWithoutRef<'div'> & ITitleBarProps & { setNodeRef: any }>(function TitleBarInner(
    { window, onRemove, onChangeTab, children, className, listeners, setNodeRef, ...props },
    ref
  ) {
    const items = useMemo(() => window.modules.map((module) => `${module.id}-move-tab`), [window.modules])
    return (
      <>
        <div className="cursor-grab flex items-center p-1 border-r border-slate-800" {...listeners}>
          <IconGripHorizontal size={16} />
        </div>
        <div ref={setNodeRef} className="flex-1 overflow-hidden">
          <div className="flex-1 self-stretch flex items-center overflow-auto" style={{ scrollbarWidth: 'none' }}>
            <SortableContext items={items} strategy={horizontalListSortingStrategy}>
              {window.modules.map((module) => {
                return <Tab key={module.id} window={window} module={module} onChangeTab={onChangeTab} />
              })}
            </SortableContext>
          </div>
        </div>
        <div className="flex items-center justify-end p-1 border-l border-l-slate-800 bg-slate-900">
          <button onClick={onRemove} className="hover:cursor-pointer">
            <IconX size={16} />
          </button>
        </div>
      </>
    )
  })
)
