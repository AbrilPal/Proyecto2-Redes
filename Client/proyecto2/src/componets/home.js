import React, { useState } from 'react'
import { Link } from 'react-router-dom'

function makeid(length) {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
       result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

const Homepage = () => {
    const [roomCode, setRoomCode] = useState('')

    return (
        <div className='Homepage'>
            <div className='homepage-menu'>
                <div className='homepage-form'>
                    <div className='homepage-join'>
                        <input type='text' placeholder='Codigo de la sala' onChange={(event) => setRoomCode(event.target.value)} />
                        {/* <Link to={`/play?roomCode=${roomCode}`}> */}
                            <button className="game-button green">JOIN GAME</button>
                        {/* </Link> */}
                    </div>
                    <h1>O</h1>
                    <div className='homepage-create'>
                        {/* <Link to={`/play?roomCode=${randomCodeGenerator(5)}`}> */}
                            <button className="game-button orange">Nueva sala</button>
                        {/* </Link> */}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Homepage