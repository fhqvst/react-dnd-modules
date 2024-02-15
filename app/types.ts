export type ModuleType = 'greeting' | 'button' | 'price-ladder'

export interface IModule {
  id: string
  type: ModuleType
  title: string
  props: Record<string, any>
}

export interface IWindow {
  id: string
  col: number
  row: number
  height: number
  width: number
  modules: IModule[]
  actingModuleId?: string
  isTransient?: boolean
}

export type DroppableType = 'WINDOW' | 'GRID' | 'TABS'
