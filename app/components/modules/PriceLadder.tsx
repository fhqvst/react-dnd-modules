import { startTransition, useEffect, useRef, useState } from 'react'

const levels = Array(12)
  .fill(0)
  .map((_, i) => ({
    price: 50000 + 500 * (1 + i),
    size: 5 * (i + 1),
    amount: 1000 * 5 * (i + 1),
  }))

const buy = [...levels]
const sell = [...levels]

function createLevel(index: number) {
  const price = 50000 + 500 * (1 + index)
  const size = parseFloat((1 + Math.random()).toFixed(4))
  return {
    price,
    size,
    amount: parseFloat((price * size).toFixed(2)),
  }
}

function createWs(onLevels: any, { interval }: { interval: number }) {
  const intervals = setInterval(() => {
    onLevels({
      buy: buy.map((_, i) => createLevel(i)),
      sell: sell.map((_, i) => createLevel(i)),
    })
  }, interval)
  return () => clearInterval(intervals)
}

export function PriceLadder() {
  const [levels, setLevels] = useState({ buy, sell })
  const d = useRef(0)
  useEffect(() => {
    if (d.current) return
    const interval = 100 + Math.random() * 100
    createWs(
      (levels) => {
        startTransition(() => setLevels(levels))
      },
      { interval }
    )
    d.current = 1
  }, [])

  return (
    <div className="px-2 w-full text-slate-400">
      <table className="w-full table-fixed">
        <thead>
          <tr className="bg-slate-900 sticky top-0 text-right">
            <th className="text-left py-2 w-1/3">Px.</th>
            <th className="w-1/3 pl-2">Size</th>
            <th className="w-1/3 pl-2">Amt.</th>
          </tr>
        </thead>
        <tbody className="font-mono">
          {levels.sell.map((level, i) => (
            <tr key={i} className="text-right hover:bg-slate-800">
              <td className="text-left price-ladder--price-column-sell">{level.price}</td>
              <td>{level.size}</td>
              <td>{level.amount}</td>
            </tr>
          ))}
          <tr className="">
            <td colSpan={3} className="text-left text-emerald-600 font-bold border-y border-slate-800">
              52,000
            </td>
          </tr>
          {levels.buy.map((level, i) => (
            <tr key={i} className="text-right hover:bg-slate-800">
              <td className="text-left price-ladder--price-column-buy">{level.price}</td>
              <td>{level.size}</td>
              <td>{level.amount}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
