'use client'

import React from 'react'
import GameList from './GameList/GameList'
import QuickPlay from './QuickPlay/QuickPlay'

const GameSelection = () => {
  const QUICK_PLAY = 'quick-play'
  const LOBBY = 'lobby'

  const [selectedTab, setSelectedTab] = React.useState(QUICK_PLAY)

  return (
    <div className='flex-1 h-full border-r'>
      <div className='flex flex-col h-full mx-6'>
        <div className='flex justify-evenly border-b text-xl font-bold italic text-center cursor-pointer pb-3'>
          <div onClick={() => setSelectedTab(QUICK_PLAY)} className={`flex-1 ${selectedTab == QUICK_PLAY ? 'bg-secondary text-secondary-content rounded-md' : ''}`}>quick-play</div>
          <div onClick={() => setSelectedTab(LOBBY)} className={`flex-1 ${selectedTab == LOBBY ? 'bg-secondary text-secondary-content rounded-md' : ''}`}>lobby</div>
        </div>
        <div className='flex-grow'>
          {selectedTab == QUICK_PLAY ?
            <QuickPlay />
            :
            <GameList />
          }
        </div>
      </div>
    </div>
  )
}

export default GameSelection
