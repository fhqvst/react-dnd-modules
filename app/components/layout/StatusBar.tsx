import { IconChevronDownRight } from '@tabler/icons-react'
import { memo, forwardRef, ComponentPropsWithoutRef } from 'react'
import { cn } from '~/cn'
import { IModule } from '~/types'

export interface IStatusBarProps {
  modules: IModule[]
  actingModuleId?: string
}

export const StatusBar = memo(
  forwardRef<HTMLDivElement, ComponentPropsWithoutRef<'div'> & IStatusBarProps>(function StatusBar(
    { children, modules, actingModuleId, className, ...props },
    ref
  ) {
    return (
      <div ref={ref} {...props} className={cn('bg-slate-900 flex flex-shrink justify-end w-full', className)}>
        <button className="hover:cursor-nwse-resize">
          <IconChevronDownRight size={16} />
        </button>
      </div>
    )
  })
)
