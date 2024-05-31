import gameStrings from '@/app/constants/strings/gameStrings'
import { wordInfo } from '@/app/types/GameListTypes'
import { convertToMinutesAndSeconds } from '@/utils/functions'

const AnalysisModal = (props: { id: string, wordHistory: wordInfo[], matchTime: number }) => {
  function handleCancel() {
    const modal = document.getElementById(props.id) as HTMLDialogElement
    modal.close()
  }
  return (
    <dialog id={props.id} className="modal">
      <div className="modal-box h-5/6 flex flex-col justify-between items-center">
        <div className='flex w-full justify-between'>
          <h3 className="font-bold text-lg">analysis</h3>
          <h3 className="font-bold text-lg">match time: {convertToMinutesAndSeconds(props.matchTime)}</h3>
        </div>
        <div className='w-full'>
          <ul className='w-full'>
            {props.wordHistory.map((word, index) => (
              <li key={index} className='flex justify-between'>
                <div className={`w-1/3 ${word.valid ? 'text-success underline' : 'text-error'}`}>
                  {word.valid ?
                    <a href={`https://en.wiktionary.org/wiki/${word.word}#English`} target='_blank' rel='noopener noreferrer'>
                      {word.word}
                    </a> :
                    // TODO: add tooltip with suggestions
                    <span className='tooltip tooltip-right tooltip-info border-b border-dotted' data-tip={`possible words: ${word.suggestions?.toString().replace(/,/g, ', ')}`}>{word.word}</span>
                  }

                </div>
                <div className='w-1/3 text-center'>{word.player}</div>
                <div className='w-1/3 text-end'>{convertToMinutesAndSeconds(word.time)}</div>
              </li>
            ))}
          </ul>
        </div>
        <div className='flex w-full justify-around'>
          <button onClick={handleCancel} className='btn btn-error w-24'>{gameStrings.CLOSE}</button>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button></button>
      </form>
    </dialog>
  )
}

export default AnalysisModal
