import React, { useState, useEffect} from 'react'
import { Link } from 'react-router-dom'
import io from 'socket.io-client'
import queryString from 'query-string'

function shuffleCartas(array) { 
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1))
        var temp = array[i]
        array[i] = array[j]
        array[j] = temp;
    }   
    return array
}

const Gamepage = (props) => {

    const paqueteDeCartas = [
        '0R', '1R', '1R', '2R', '2R', '3R', '3R', '4R', '4R', '5R', '5R', '6R', '6R', '7R', '7R', '8R', '8R', '9R', '9R', 'skipR', 'skipR', '_R', '_R', 'D2R', 'D2R',
        '0G', '1G', '1G', '2G', '2G', '3G', '3G', '4G', '4G', '5G', '5G', '6G', '6G', '7G', '7G', '8G', '8G', '9G', '9G', 'skipG', 'skipG', '_G', '_G', 'D2G', 'D2G',
        '0B', '1B', '1B', '2B', '2B', '3B', '3B', '4B', '4B', '5B', '5B', '6B', '6B', '7B', '7B', '8B', '8B', '9B', '9B', 'skipB', 'skipB', '_B', '_B', 'D2B', 'D2B',
        '0Y', '1Y', '1Y', '2Y', '2Y', '3Y', '3Y', '4Y', '4Y', '5Y', '5Y', '6Y', '6Y', '7Y', '7Y', '8Y', '8Y', '9Y', '9Y', 'skipY', 'skipY', '_Y', '_Y', 'D2Y', 'D2Y',
        'W', 'W', 'W', 'W', 'D4W', 'D4W', 'D4W', 'D4W'
    ]

    const data = queryString.parse(props.location.search)
    // los estados del juego 
    const [room, setRoom] = useState(data.roomCode)
    const [roomFull, setRoomFull] = useState(false)
    const [currentUser, setCurrentUser] = useState('')
    const [users, setUsers] = useState([])
    const [gameOver, setGameOver] = useState(true)
    const [player1Deck, setPlayer1Deck] = useState([])
    const [player2Deck, setPlayer2Deck] = useState([])
    const [currentColor, setCurrentColor] = useState('')
    const [currentNumber, setCurrentNumber] = useState('')
    const [winner, setWinner] = useState()
    const [playedCardsPile, setPlayedCardsPile] = useState([])
    const [drawCardPile, setDrawCardPile] = useState([])
    const [turn, setTurn] = useState('')
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
        socket.emit('join', {room: room}, (error) => {
            if(error)
                setRoomFull(true)
        })
        return function desconectar() {
            socket.emit('disconnect')
            socket.off()
        }
    }, [])

    useEffect(() => {
        const shuffledCards = shuffleCartas(paqueteDeCartas)
        const mano1 = shuffledCards.splice(0,7)
        const mano2 = shuffledCards.splice(0,7)

         let startingCardIndex
         while(true) {
             startingCardIndex = Math.floor(Math.random() * 94)
             if(shuffledCards[startingCardIndex]==='skipR' || shuffledCards[startingCardIndex]==='_R' || shuffledCards[startingCardIndex]==='D2R' ||
             shuffledCards[startingCardIndex]==='skipG' || shuffledCards[startingCardIndex]==='_G' || shuffledCards[startingCardIndex]==='D2G' ||
             shuffledCards[startingCardIndex]==='skipB' || shuffledCards[startingCardIndex]==='_B' || shuffledCards[startingCardIndex]==='D2B' ||
             shuffledCards[startingCardIndex]==='skipY' || shuffledCards[startingCardIndex]==='_Y' || shuffledCards[startingCardIndex]==='D2Y' ||
             shuffledCards[startingCardIndex]==='W' || shuffledCards[startingCardIndex]==='D4W') {
                 continue;
             }
             else
                 break;
         }
 
         const playedCardsPile = shuffledCards.splice(startingCardIndex, 1)
 
         const drawCardPile = shuffledCards

        socket.emit('initGameState', {
            gameOver: false,
            turn: 'Player 1',
            mano1: [...mano1],
            mano2: [...mano2],
            currentColor: playedCardsPile[0].charAt(1),
            currentNumber: playedCardsPile[0].charAt(0),
            playedCardsPile: [...playedCardsPile],
            drawCardPile: [...drawCardPile]
        })
    }, [])

    useEffect(() => {
        socket.on("roomData", ({ users }) => {
            setUsers(users)
        })
        socket.on('initGameState', ({ gameOver, turn, mano1, mano2, currentColor, currentNumber, playedCardsPile, drawCardPile }) => {
            setGameOver(gameOver)
            setTurn(turn)
            setPlayer1Deck(mano1)
            setPlayer2Deck(mano2)
            setCurrentColor(currentColor)
            setCurrentNumber(currentNumber)
            setPlayedCardsPile(playedCardsPile)
            setDrawCardPile(drawCardPile)
        })
        socket.on('currentUserData', ({ name }) => {
            setCurrentUser(name)
        })
    }, [])
    return (
        <div style={{'backgroundColor': "pink"}} >
             {(!roomFull) ? 
             <>
                <h1>{room}</h1>
                {users.length===1 ?<h1>Espera a que se unan los otros jugadores</h1>: 
                <>
                    {gameOver ? <h1>Fin del juego, gano {winner}</h1> :
                    <>
                        {currentUser === 'Player 1' ? 
                         <>
                            <p className='playerDeckText'>Player 2</p>
                            {player2Deck.map((item, i) => (
                                <img
                                    key={i}
                                    style={{'width': "30px", 'height': "50px"}}
                                    // onClick={() => onCardPlayedHandler(item)}
                                    src={require(`../imagenes/card-back.png`).default}
                                    />
                            ))}
                            <br></br>
                            <br></br>
                            {player1Deck.map((item, i) => (
                                <img
                                    key={i}
                                    style={{'width': "50px", 'height': "70px"}}
                                    // onClick={() => onCardPlayedHandler(item)}
                                    src={require(`../imagenes/${item}.png`).default}
                                    />
                            ))}
                        </>:<></>} 

                        {currentUser === 'Player 2' ? 
                         <>
                            <p className='playerDeckText'>Player 1</p>
                            {player1Deck.map((item, i) => (
                                <img
                                    key={i}
                                    style={{'width': "30px", 'height': "50px"}}
                                    // onClick={() => onCardPlayedHandler(item)}
                                    src={require(`../imagenes/card-back.png`).default}
                                    />
                            ))}
                            <br></br>
                            <br></br>
                            
                            {player2Deck.map((item, i) => (
                                <img
                                    key={i}
                                    style={{'width': "50px", 'height': "70px"}}
                                    // onClick={() => onCardPlayedHandler(item)}
                                    src={require(`../imagenes/${item}.png`).default}
                                    />
                            ))}
                        </>:<></>} 

                    </>
                    }
                </>}
            </>:
            <h1> Lo siento, esta llena la sala</h1>}
        </div>
    )
}

export default Gamepage