'use client'

import { io } from 'socket.io-client'
import signals from './constants/strings/signals'

const socket = io()
socket.on('connect', () => {

  // used for testing
  // socket.emit(signals.client.ensureGameJoined, 'willing_chocolate_locust')
})

export default socket