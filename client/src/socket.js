import { io } from 'socket.io-client'
import { BE_PORT } from './constants'

// "undefined" means the URL will be computed from the `window.location` object
const URL = `http://localhost:${BE_PORT}/`

export const socket = io(URL)
