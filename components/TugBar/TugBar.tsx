import { useEffect, useState } from 'react'
import './TugBar.css'
import { convertToPercentage } from '@/utils/conversions'

const TugBar = () => {
  const TOTAL_TIME = 60
  const [blueTime, setBlueTime] = useState(TOTAL_TIME / 2)
  const [blueWidth, setBlueWidth] = useState(convertToPercentage(blueTime / TOTAL_TIME))

  useEffect(() => {
    const timer = setInterval(() => {
      // setBlueTime()
    }, 20)

    return () => {
      clearInterval(timer)
    }
  }, [])
  useEffect(() => {
    setBlueWidth(convertToPercentage(blueTime / TOTAL_TIME))
  }, [blueTime])

  return (
    <div id="tug-bar" className="w-3/4">
      <div id="tug-timers" className="flex justify-around mb-3">
        <div className="text-3xl">{blueTime.toFixed(1)}</div>
        <div className="text-3xl">{(TOTAL_TIME - blueTime).toFixed(1)}</div>
      </div>
      <div id="tug-bar-bar">
        <div id="tug-red" className="bg-error w-full h-full">
          <div id="tug-blue" className="bg-success h-full" style={{ width: blueWidth }}></div>
        </div>
      </div>
    </div>
  )
}

export default TugBar
