'use client'

import React from 'react'

function onContactSubmit() {
  // TODO: implement
}

const Contact = () => {
  return (
    <div className='flex flex-col justify-between items-center h-full py-16'>
      <h1 className="text-4xl font-bold underline">let me know what you think!</h1>
      <div className='flex flex-col w-3/4 flex-grow pt-6'>
        <select className="select select-bordered w-full max-w-xs mb-6" defaultValue='contact reason'>
          <option disabled>contact reason</option>
          <option>bug report</option>
          <option>suggestion</option>
          <option>feedback</option>
          <option>other</option>
        </select>
        <textarea className="textarea textarea-bordered flex-grow" placeholder="additional details"></textarea>
      </div>
      <div className='flex flex-col items-center'>
        <p>* alternatively, feel free to send me an email/screenshots at <a href="mailto:tuggrgame@gmail.com" className="text-info underline">tuggrgame@gmail.com</a></p>
        <button onClick={onContactSubmit} className="btn btn-success mt-4">submit</button>
      </div>
    </div>
  )
}

export default Contact
