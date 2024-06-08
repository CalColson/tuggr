import gameStrings from '@/app/constants/strings/gameStrings'
import { wordInfo, } from '@/app/types/GameListTypes'
import { convertToMinutesAndSeconds, } from '@/utils/functions'
import { FaFlag, FaRegFlag, } from 'react-icons/fa6'

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
              <li key={index} className='flex justify-between items-center pb-1'>
                <div className={'w-1/3 flex justify-between items-center'}>
                  <div className={word.valid ? 'text-success underline' : 'text-error'}>
                    {word.valid ?
                      <a href={`https://en.wiktionary.org/wiki/${word.word}#English`} target='_blank' rel='noopener noreferrer'>
                        {word.word}
                      </a> :
                      <span className='tooltip tooltip-right tooltip-info border-b border-dotted' data-tip={`possible words: ${word.suggestions?.toString().replace(/,/g, ', ')}`}>{word.word}</span>
                    }
                  </div>
                  <div className='dropdown dropdown-right text-error-content'>
                    <div tabIndex={0} role='button' className='btn btn-xs btn-error'><FaRegFlag color='white' /></div>
                    <div tabIndex={0} className="w-52 dropdown-content z-[1] menu p-2 shadow bg-error rounded-box">
                      <h3 className='text-center text-lg'>{gameStrings.getReportDropdownTitle(word.word)}</h3>
                      {word.valid ?
                        (<ul>
                          <li><a>{gameStrings.VALID_WORD_REPORT_REASONS.notValid}</a></li>
                          <li><a>{gameStrings.VALID_WORD_REPORT_REASONS.properWord}</a></li>
                          <li><a>{gameStrings.VALID_WORD_REPORT_REASONS.foreignWord}</a></li>
                          <li><a>{gameStrings.VALID_WORD_REPORT_REASONS.offensive}</a></li>
                          <li><a>{gameStrings.VALID_WORD_REPORT_REASONS.other}</a></li>
                        </ul>) :
                        (<ul>
                          <li><a>{gameStrings.INVALID_WORD_REPORT_REASONS.valid}</a></li>
                          <li><a onClick={() => {
                            const completeWord = prompt('please enter the complete valid word:')
                            if (completeWord) {
                              // handle saving to database here
                              // console.log(completeWord)
                            }
                          }}>{gameStrings.INVALID_WORD_REPORT_REASONS.startOfValid}</a></li>
                          <li><a>{gameStrings.INVALID_WORD_REPORT_REASONS.other}</a></li>
                        </ul>)
                      }
                    </div>
                  </div>
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
    </dialog >
  )
}

export default AnalysisModal
