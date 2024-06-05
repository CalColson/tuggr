import Image from 'next/image'
import './App.css'
import GameList from '@/components/GameList/GameList'

function App() {
  return (
    <div id="app" className='flex h-full py-8'>
      <GameList />
      <div className='flex flex-col flex-1 justify-around text-center px-8'>
        <h1>
          <span className='text-2xl'>welcome to </span>
          <span className='text-4xl text-secondary font-bold'>tuggr</span>
          <div className='text-xl mt-6'>~ a tug of war word game ~</div>
        </h1>
        <div className='relative h-64'><Image src="/images/tuggr-vs.png" alt="tuggr tugboats" fill /></div>
      </div>
    </div>
  )
}

export default App
