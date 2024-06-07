'use client'

import Image from 'next/image'
import React from 'react'

const RulesModal = (props: { id: string }) => {
  function handleCancel() {
    const modal = document.getElementById(props.id) as HTMLDialogElement
    modal.close()
  }

  return (
    // TODO: change this to a slideshow/carousel
    <dialog id={props.id} className="modal">
      <div className="modal-box h-5/6 max-w-none w-3/4 flex flex-col justify-between items-center">
        <h3 className="font-bold text-3xl mb-6 underline">tuggr rules</h3>
        <div>
          <p>
            {'the players of tuggr alternate adding to a growing string of letters. the goal is to have this string of letters always be able to complete a valid word. example: if the string is \'barg\', the next player can add \'a\' to continue making the word \'bargain\'.'}
          </p>
          <p className='mt-5'>
            {'each player has a set amount of time apportioned to them at the beginning of the match. in the case below, each player starts with 5 seconds. once the game starts, whenever it is a player\'s turn to add a letter, their time starts counting down while their opponent\'s counts up, creating a tug of war dynamic. if a player runs out of time, they lose the match.'}
          </p>
          <div className='relative h-96'><Image src="/images/tugbar.gif" alt="tugbar" fill style={{ objectFit: 'contain' }} unoptimized /></div>
          <hr className='mb-6' />
          <p>
            {'if a player adds a letter that makes the string of letters unable to complete a valid word, they incur a time penalty (the offending player loses a set amount of time while the opponent gains that lost time). additionally, it is still the offending player\'s turn, and their time will continue to run down. example: the  blue player adds \'x\' to the string \'barg\''}
          </p>
          <div className='relative h-96'><Image src="/images/tugbar-penalty.gif" alt="tugbar" fill style={{ objectFit: 'contain' }} unoptimized /></div>
          <hr className='mb-6' />
          <p>
            {'conversely, if it becomes a player\'s turn while the current letter string comprises a valid word (i.e. their opponent\'s previous letter made a valid word) they are able to press the enter key to complete that word. it must be noted that valid words must be at least four letters in length. if a player completes a valid word, they are rewarded with additional time at the expense of their opponent\'s time.'}
          </p>
          <div className='relative h-96'><Image src="/images/tugbar-reward.gif" alt="tugbar" fill style={{ objectFit: 'contain' }} unoptimized /></div>
          <hr className='mb-6' />
          <p>
            {'whenever a word is finished (either through entering a valid word, or making the word invalid while receiving a penalty), a new word must be started by the player whose turn it is.'}
          </p>
          <p className='mt-5'>
            {'keep playing until one player collects all of their opponent\'s time. and most importantly... have fun!'}
          </p>
          <p className='mt-5'>
            {'tips:'}
          </p>
          <p>
            {'#1: the time lost from a penalty is twice the time your opponent gains from a reward, so don\'t fret too much about letting your opponent complete a word, it is more important that you keep your word valid!'}
          </p>
          <p>
            {'#2: there is a brief lockout period after penalties and rewards, so mashing new letters will not help. use this time to think of good words to play!'}
          </p>
        </div>
        <div className='flex w-full justify-around'>
          <button onClick={handleCancel} className='btn btn-error w-24 mt-6'>close</button>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button>close</button>
      </form>
    </dialog>
  )
}

export default RulesModal
