import Link from 'next/link'
import React from 'react'

const About = () => {
  return (

    <div className="flex flex-col items-center px-32">
      <h1 className="text-4xl font-bold underline my-16">about tuggr</h1>
      <p className="text-lg text-center">
        tuggr is a game inspired by a variety of word games that i have enjoyed in the past. it combines elements of collaboration as well as competition to create a (hopefully) engaging experience! my hope is that players can expand their vocabulary and exercise their creativity while having fun with others. i hope you have a great time building words and connections! - cal (cosmosis)
      </p>
      <p className="text-lg mt-8">
        {/* TODO: launch rules modal */}
        for rules and tips click <button className='underline text-info'>here</button>
      </p>
      <p className="text-lg mt-8">
        to give suggestions or report a bug, click <Link className='underline text-info' href="/contact">here</Link>
      </p>
      <p className="text-lg mt-8">
        if you want to support this project and me, i would greatly appreciate it!
      </p>
      <p>
        <a href='https://ko-fi.com/cosmosis14' target='_blank' rel='noopener noreferrer' className='underline text-info'>https://ko-fi.com/cosmosis14</a>
      </p>
    </div>
  )
}

export default About
