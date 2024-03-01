import { useEffect, useRef, useState } from 'react'
import { socket } from './socket'
import global from 'global'
import * as process from 'process'
global.process = process
import Peer from 'simple-peer'

function App() {
    const [stream, setStream] = useState(null)
    const [textInput, setTextInput] = useState('')
    const [isCallIncoming, setIsCallIncoming] = useState(false)

    const myVideo = useRef(null)
    const hisVideo = useRef(null)

    const [myID, setMyID] = useState('')
    const [hisID, setHisID] = useState('')
    const [hisSignallingData, setHisSignallingData] = useState(null)

    useEffect(() => {
        socket.on('me', (data) => {
            setMyID(data)
        })
        socket.on('callIncoming', ({ id: his_ID, data }) => {
            setIsCallIncoming(true)
            setHisID(his_ID)
            setHisSignallingData(data)
        })
    })

    function handleStart() {
        navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((stream) => {
            setStream(stream)
            myVideo.current.srcObject = stream
        })
    }

    // made async so that , setTextinut sets textInput
    async function handleCallUser() {
        console.log(`handle callUser called`)
        const peer = new Peer({
            initiator: true, // peer1
            trickle: false, // calls the 'signal' event only once
            stream: stream,
        })

        peer.on('stream', (stream) => {
            hisVideo.current.srcObject = stream
        })

        peer.on('signal', (data) => {
            console.log(textInput)
            console.log(data)
            socket.emit('callOther', { textInput: textInput, data: data })
        })

        socket.on('heAccepted', (data) => {
            setHisSignallingData(data)
            peer.signal(data)
        })
    }

    function handleDecline() {
        setIsCallIncoming(false)
        console.log(`call declined`)
    }
    function handleAnswer() {
        console.log(`call accepted`)
        const peer = new Peer({
            initiator: false,
            trickle: false,
            stream: stream,
        })

        peer.on('stream', (stream) => {
            hisVideo.current.srcObject = stream
        })

        peer.on('signal', (data) => {
            console.log(`his id peer on signal ${hisID}`)
            socket.emit('acceptedTheCall', { hisID, data })
        })

        peer.signal(hisSignallingData)
    }

    return (
        <>
            YOUR ID:
            <br />
            {myID}
            <br />
            <video playsInline muted ref={myVideo} autoPlay style={{ width: '200px' }} />
            <br />
            <video playsInline ref={hisVideo} autoPlay style={{ width: '200px' }} />
            <br />
            <button onClick={handleStart}> start my video and audio</button>
            <br />
            <br />
            <label>Enter id</label>
            <input
                onChange={(e) => {
                    setTextInput(e.target.value)
                }}
                value={textInput}
            />
            <br />
            <button onClick={handleCallUser}>call user</button>
            <br />
            <br />
            {isCallIncoming && <IncomingCallNotification handleDecline={handleDecline} handleAnswer={handleAnswer} />}
        </>
    )
}

function IncomingCallNotification({ handleDecline, handleAnswer }) {
    return (
        <div>
            <h2>Incoming Call</h2>
            <button onClick={handleDecline}>Decline</button>
            <button onClick={handleAnswer}>Answer</button>
        </div>
    )
}

export default App
