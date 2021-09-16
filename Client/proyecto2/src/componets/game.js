import React, { useState, useEffect} from 'react'
import { Link } from 'react-router-dom'
import io from 'socket.io-client'
import queryString from 'query-string'

function makeid(length) {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
       result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

const Gamepage = (props) => {
    const data = queryString.parse(props.location.search)
    const [room, setRoom] = useState(data.roomCode)
    let socket
    const ENDPOINT = 'http://localhost:1800'

    useEffect(() => {
        const connectionOptions =  {
        "forceNew" : true, 
        "reconnectionAttempts": "Infinity", 
        "timeout" : 10000,                  
        "transports" : ["websocket"]
    }
    socket = io.connect(ENDPOINT, connectionOptions)
    })
    return (
        <div className='Homepage'>
            <h1>{room}</h1>
        </div>
    )
}

export default Gamepage