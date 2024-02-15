import type { MetaFunction } from '@remix-run/node'
import { useCallback, useState } from 'react'
import { Grid } from '~/components/layout/Grid'
import { IWindow } from '~/types'

export const meta: MetaFunction = () => {
  return [{ title: 'New Remix App' }, { name: 'description', content: 'Welcome to Remix!' }]
}

let _id = 1
const uniqueId = () => `${_id++}`

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
        type: 'greeting',
        title: 'BTC-USD',
        props: {
          text: 'Hello world!',
        },
      },
      {
        id: `${parseInt(uniqueId()) - 1}`,
        type: 'button',
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
    width: 3,
    height: 2,
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
        id: `${parseInt(uniqueId()) - 1}`,
        type: 'button',
        title: 'BTC/SEK and a long title',
        props: {
          text: 'Hello world!',
        },
      },
    ],
  },
  {
    id: uniqueId(),
    col: 1,
    row: 3,
    width: 4,
    height: 2,
    modules: [],
    actingModuleId: undefined,
  },
]

export default function Index() {
  const [items, setItems] = useState(initialModules)

  const cellSize = 100
  const gridSize = 32
  const gapSize = 4

  const handleCreateTab = useCallback(function handleCreateTab() {}, [])

  const handleCloseTab = useCallback(function handleCloseTab() {}, [])

  const handleSelectTab = useCallback(function handleSelectTab() {}, [])

  const handleMoveTab = useCallback(function handleMoveTab() {}, [])

  const handleMoveWindow = useCallback(function handleMoveWindow() {}, [])

  const handleResizeWindow = useCallback(function handleResizeWindow() {}, [])

  return (
    <div className="flex flex-col w-screen h-screen overflow-hidden">
      <div className="bg-slate-800 flex-shrink-0 h-16 border-b border-slate-700"></div>
      <div className="flex items-stretch overflow-hidden w-screen">
        <div className="w-[200px] flex-shrink-0 bg-slate-800 border-r border-slate-700"></div>
        <Grid
          items={items}
          rows={gridSize}
          cols={gridSize}
          cellSize={cellSize}
          gapSize={gapSize}
          onCreateTab={handleCreateTab}
          onCloseTab={handleCloseTab}
          onSelectTab={handleSelectTab}
          onMoveTab={handleMoveTab}
          onMoveWindow={handleMoveWindow}
          onResizeWindow={handleResizeWindow}
        />
        <div className="w-[200px] flex-shrink-0 bg-slate-800 border-l border-slate-700"></div>
      </div>
    </div>
  )
}
