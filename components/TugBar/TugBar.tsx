import { useEffect, useState, } from 'react'
import './TugBar.css'
import { convertToPercentage, } from '@/utils/functions'

const TugBar = ({ timeControl, blueTime, isBlueTurn, }: { timeControl: string | null, blueTime: number, isBlueTurn: boolean }) => {
  const totalTime = timeControl ? parseInt(timeControl) * 2 : 60
  const [blueWidth, setBlueWidth,] = useState(convertToPercentage(blueTime / totalTime))

  useEffect(() => {
    setBlueWidth(convertToPercentage(blueTime / totalTime))
  }, [blueTime, totalTime,])

  return (
    <div id="tug-bar" className="w-3/4">
      <div id="tug-timers" className="flex justify-around text-center mb-3">
        <div className={'text-3xl w-20 py-1 ' + (isBlueTurn ? 'text-black bg-white rounded-lg' : '')}>{Math.abs(blueTime).toFixed(1)}</div>
        <div className={'text-3xl w-20 py-1 ' + (!isBlueTurn ? 'text-black bg-white rounded-lg' : '')}>{(totalTime - blueTime).toFixed(1)}</div>
      </div>
      <div id="tug-bar-bar">
        <div id="tug-red" className="bg-red-600 w-full h-full">
          <div id="tug-blue" className="bg-blue-600 h-full" style={{ width: blueWidth, }}></div>
        </div>
      </div>
    </div>
  )
}

export default TugBar
