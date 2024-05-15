import './App.css'
import GameList from '@/components/GameList/GameList'

function App() {
  return (
    <div id="app" className='flex h-screen py-8'>
      <GameList />
      <div className='flex-1 text-center px-8'>
        <h1>
          <span className='text-2xl'>welcome to </span>
          <span className='text-4xl font-bold'>tug of word</span>
        </h1>
      </div>
    </div>
  )
}

export default App
