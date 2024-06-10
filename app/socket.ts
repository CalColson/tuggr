'use client'

import { io, } from 'socket.io-client'

const socket = io()
socket.on('connect', () => {
  // console.log('socket connected')
})

export default socket