import './App.css'
import GameList from '@/components/GameList/GameList'

function App() {
  return (
    <div id="app" className='flex h-full py-8'>
      <GameList />
      <div className='flex-1 text-center px-8'>
        <h1>
          <span className='text-2xl'>welcome to </span>
          <span className='text-4xl text-secondary font-bold'>tuggr</span>
          <div className='text-xl mt-3'>a tug of war word game</div>
        </h1>
      </div>
    </div>
  )
}

export default App
