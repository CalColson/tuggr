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
      <div className='mx-6'>
        <div className='flex justify-evenly border-b text-xl text-center cursor-pointer mb-3'>
          <div onClick={() => setSelectedTab(QUICK_PLAY)} className={`flex-1 ${selectedTab == QUICK_PLAY ? 'bg-secondary text-secondary-content rounded-md' : ''}`}>quick-play</div>
          <div onClick={() => setSelectedTab(LOBBY)} className={`flex-1 ${selectedTab == LOBBY ? 'bg-secondary text-secondary-content rounded-md' : ''}`}>lobby</div>
        </div>
        {selectedTab == QUICK_PLAY ?
          <QuickPlay />
          :
          <GameList />
        }
      </div>
    </div>
  )
}

export default GameSelection
