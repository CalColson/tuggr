import { useEffect, useState } from 'react'
import './TugBar.css'
import { convertToPercentage } from '@/utils/conversions'

const TugBar = ({ timeControl }: { timeControl: string | null }) => {
  const totalTime = timeControl ? parseInt(timeControl) * 2 : 60
  const [blueTime, setBlueTime] = useState(totalTime / 2)
  const [blueWidth, setBlueWidth] = useState(convertToPercentage(blueTime / totalTime))

  useEffect(() => {
    const timer = setInterval(() => {
      // setBlueTime()
    }, 20)

    return () => {
      clearInterval(timer)
    }
  }, [])
  useEffect(() => {
    setBlueWidth(convertToPercentage(blueTime / totalTime))
  }, [blueTime, totalTime])

  return (
    <div id="tug-bar" className="w-3/4">
      <div id="tug-timers" className="flex justify-around mb-3">
        <div className="text-3xl">{blueTime.toFixed(1)}</div>
        <div className="text-3xl">{(totalTime - blueTime).toFixed(1)}</div>
      </div>
      <div id="tug-bar-bar">
        <div id="tug-red" className="bg-red-600 w-full h-full">
          <div id="tug-blue" className="bg-blue-600 h-full" style={{ width: blueWidth }}></div>
        </div>
      </div>
    </div>
  )
}

export default TugBar
