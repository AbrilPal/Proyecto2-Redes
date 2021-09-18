import React, { useState, useEffect} from 'react'
import { Link } from 'react-router-dom'
import io from 'socket.io-client'
import queryString from 'query-string'
import Button from '@mui/material/Button';
import {useParams } from 'react-router-dom';

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

    const {id} = useParams()
    const {idUser} = useParams();
    // los estados del juego 
    const [sala, setsala] = useState(id)
    const [salaFull, setsalaFull] = useState(false)
    const [currentUser, setCurrentUser] = useState('')
    const [users, setUsers] = useState([])
    const [gameOver, setGameOver] = useState(true)
    const [baraja1, setbaraja1] = useState([])
    const [baraja2, setbaraja2] = useState([])
    const [baraja3, setbaraja3] = useState([])
    const [colorActual, setcolorActual] = useState('')
    const [numerActual, setnumerActual] = useState('')
    const [ganador, setganador] = useState()
    const [pilaDeCartas, setpilaDeCartas] = useState([])
    const [drawPilaCartas, setdrawPilaCartas] = useState([])
    const [turno, setturno] = useState('')
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
        socket.emit('join', {sala: sala}, (error) => {
            if(error){
                console.log(error)
                setsalaFull(true)
            }
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
        const mano3 = shuffledCards.splice(0,7)

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
 
         const pilaDeCartas = shuffledCards.splice(startingCardIndex, 1)
 
         const drawPilaCartas = shuffledCards

        socket.emit('initGameState', {
            gameOver: false,
            turno: 'Player 1',
            mano1: [...mano1],
            mano2: [...mano2],
            mano3: [...mano3],
            colorActual: pilaDeCartas[0].charAt(1),
            numerActual: pilaDeCartas[0].charAt(0),
            pilaDeCartas: [...pilaDeCartas],
            drawPilaCartas: [...drawPilaCartas]
        })
    }, [])

    useEffect(() => {
        socket.on("salaData", ({ users }) => {
            setUsers(users)
        })
        socket.on('initGameState', ({ gameOver, turno, mano1, mano2,mano3, colorActual, numerActual, pilaDeCartas, drawPilaCartas }) => {
            setGameOver(gameOver)
            setturno(turno)
            setbaraja1(mano1)
            setbaraja2(mano2)
            setbaraja3(mano3)
            setcolorActual(colorActual)
            setnumerActual(numerActual)
            setpilaDeCartas(pilaDeCartas)
            setdrawPilaCartas(drawPilaCartas)
        })
        socket.on('currentUserData', ({ name }) => {
            setCurrentUser(name)
        })
    }, [])
    return (
        <div style={{"minHeight": '624px'}}>
             {console.log(salaFull)}
             <Button href='/' variant="contained" color="error" size="small">Salir del juego</Button>
             {(!salaFull) ? 
             <>
                {console.log(salaFull)}
                <h1>{sala}</h1>
                {users.length <=2 ?<h1>Espera a que se unan los otros jugadores</h1>: 
                <>
                    {gameOver ? <h1>Fin del juego, gano {ganador}</h1> :
                    <>
                        {currentUser === 'Player 1' ? 
                         <>
                            <p className='playerDeckText'>Player 2</p>
                            {baraja2.map((item, i) => (
                                <img
                                    key={i}
                                    style={{'width': "30px", 'height': "50px"}}
                                    // onClick={() => onCardPlayedHandler(item)}
                                    src={require(`../imagenes/card-back.png`).default}
                                    />
                            ))}
                            <br></br>
                            <br></br>
                            {baraja3.map((item, i) => (
                                <img
                                    key={i}
                                    style={{'width': "30px", 'height': "50px"}}
                                    // onClick={() => onCardPlayedHandler(item)}
                                    src={require(`../imagenes/card-back.png`).default}
                                    />
                            ))}
                            <br></br>
                            <br></br>
                            {pilaDeCartas && pilaDeCartas.length>0 ? <>
                                <img
                                style={{'width': "80px", 'height': "100px"}}
                                src={require(`../imagenes/${pilaDeCartas[pilaDeCartas.length-1]}.png`).default}
                                />
                            </>:<></>}
                            <br></br>
                            <br></br>
                            {baraja1.map((item, i) => (
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
                            {baraja1.map((item, i) => (
                                <img
                                    key={i}
                                    style={{'width': "30px", 'height': "50px"}}
                                    // onClick={() => onCardPlayedHandler(item)}
                                    src={require(`../imagenes/card-back.png`).default}
                                    />
                            ))}
                            <br></br>
                            <br></br>
                            <p className='playerDeckText'>Player 3</p>
                            {baraja3.map((item, i) => (
                                <img
                                    key={i}
                                    style={{'width': "30px", 'height': "50px"}}
                                    // onClick={() => onCardPlayedHandler(item)}
                                    src={require(`../imagenes/card-back.png`).default}
                                    />
                            ))}
                            <br></br>
                            <br></br>
                            {pilaDeCartas && pilaDeCartas.length>0 ? <>
                                <img
                                style={{'width': "80px", 'height': "100px"}}
                                src={require(`../imagenes/${pilaDeCartas[pilaDeCartas.length-1]}.png`).default}
                                />
                            </>:<></>}
                            <br></br>
                            <br></br>
                            {baraja2.map((item, i) => (
                                <img
                                    key={i}
                                    style={{'width': "50px", 'height': "70px"}}
                                    // onClick={() => onCardPlayedHandler(item)}
                                    src={require(`../imagenes/${item}.png`).default}
                                    />
                            ))}
                        </>:<></>} 

                        {currentUser === 'Player 3' ? 
                         <>
                            <p className='playerDeckText'>Player 1</p>
                            {baraja1.map((item, i) => (
                                <img
                                    key={i}
                                    style={{'width': "30px", 'height': "50px"}}
                                    // onClick={() => onCardPlayedHandler(item)}
                                    src={require(`../imagenes/card-back.png`).default}
                                    />
                            ))}
                            <br></br>
                            <br></br>
                            <p className='playerDeckText'>Player 2</p>
                            {baraja2.map((item, i) => (
                                <img
                                    key={i}
                                    style={{'width': "30px", 'height': "50px"}}
                                    // onClick={() => onCardPlayedHandler(item)}
                                    src={require(`../imagenes/card-back.png`).default}
                                    />
                            ))}
                            <br></br>
                            <br></br>
                            {pilaDeCartas && pilaDeCartas.length>0 ? <>
                                <img
                                style={{'width': "80px", 'height': "100px"}}
                                src={require(`../imagenes/${pilaDeCartas[pilaDeCartas.length-1]}.png`).default}
                                />
                            </>:<></>}
                            <br></br>
                            <br></br>
                            {baraja3.map((item, i) => (
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