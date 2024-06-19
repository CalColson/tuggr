import { AuthContext } from '@/app/auth/AuthProvider'
import signals from '@/app/constants/strings/signals'
import socket from '@/app/socket'
import { AuthUser } from '@/app/types/AuthUser'
import { HostGameArgs } from '@/app/types/HostGameArgs'
import { ensureUser } from '@/utils/supabase/client'
import React, { useContext, useEffect, useRef } from 'react'

const HostGameModal = (props: { id: string, onModalClose: () => void }) => {
  const { user, setUser } = useContext(AuthContext)
  user?.user_metadata
  const ref = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = ref.current
    dialog?.addEventListener('close', props.onModalClose)
    return () => {
      dialog?.removeEventListener('close', props.onModalClose)
    }
  }, [props.onModalClose])

  function handleCancel() {
    const modal = document.getElementById(props.id) as HTMLDialogElement
    modal.close()
  }

  async function handleConfirm() {
    const ensuredUser = await ensureUser(user, setUser) as AuthUser
    const hostGameArgs: HostGameArgs = {
      hostDisplayName: ensuredUser.user_metadata.display_name as string,
      rating: ensuredUser.user_metadata.rating as number,
      timeControl: parseInt((document.getElementById('host-time-control') as HTMLSelectElement).value)
    }
    // console.log('hostGameArgs:', hostGameArgs)
    socket.emit(signals.client.hostGame, hostGameArgs)
    handleCancel()
  }

  return (
    <dialog id={props.id} ref={ref} className="modal">
      <div className="modal-box h-1/2 flex flex-col justify-around items-center">
        <h3 className="font-bold text-lg">host a game</h3>
        <div>
          <div className="label">
            <span className="label-text">time control</span>
          </div>
          <select id='host-time-control' className="select select-bordered" defaultValue={30}>
            <option>30</option>
            <option>20</option>
            <option>15</option>
            <option>10</option>
            <option>5</option>
          </select>
        </div>
        <div className='flex w-full justify-around'>
          <button onClick={handleCancel} className='btn btn-error w-24'>cancel</button>
          <button onClick={handleConfirm} className='btn btn-success w-24'>host</button>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button>close</button>
      </form>
    </dialog>
  )
}

export default HostGameModal
