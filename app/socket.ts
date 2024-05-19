'use client'

import { io } from 'socket.io-client'

const socket = io()
// socket.on('connect', () => {})

export default socket