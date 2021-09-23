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
let socket
const ENDPOINT = 'http://localhost:1800'

const Gamepage = () => {

    const paqueteDeCartas = [
        '0R', '1R', '1R', '2R', '2R', '3R', '3R', '4R', '4R', '5R', '5R', '6R', '6R', '7R', '7R', '8R', '8R', '9R', '9R', 'skipR', 'skipR', '_R', '_R', 'D2R', 'D2R',
        '0G', '1G', '1G', '2G', '2G', '3G', '3G', '4G', '4G', '5G', '5G', '6G', '6G', '7G', '7G', '8G', '8G', '9G', '9G', 'skipG', 'skipG', '_G', '_G', 'D2G', 'D2G',
        '0B', '1B', '1B', '2B', '2B', '3B', '3B', '4B', '4B', '5B', '5B', '6B', '6B', '7B', '7B', '8B', '8B', '9B', '9B', 'skipB', 'skipB', '_B', '_B', 'D2B', 'D2B',
        '0Y', '1Y', '1Y', '2Y', '2Y', '3Y', '3Y', '4Y', '4Y', '5Y', '5Y', '6Y', '6Y', '7Y', '7Y', '8Y', '8Y', '9Y', '9Y', 'skipY', 'skipY', '_Y', '_Y', 'D2Y', 'D2Y',
        'W', 'W', 'W', 'W', 'D4W', 'D4W', 'D4W', 'D4W'
    ]

    // parametros de la url
    const {id} = useParams()
    const {idUser} = useParams();
    // los estados del juego 
    const [sala, setsala] = useState(id)
    const [userName, setuserName] = useState(idUser)
    const [salaFull, setsalaFull] = useState(false)
    const [currentUser, setCurrentUser] = useState('')
    const [message, setMessage] = useState('')
    const [messages, setMessages] = useState([])
    const [currentUserName, setCurrentUserName] = useState('')
    const [users, setUsers] = useState([])
    const [usuario1, setUsuario1] = useState('')
    const [usuario2, setUsuario2] = useState('')
    const [usuario3, setUsuario3] = useState('')
    const [gameOver, setGameOver] = useState(true)
    const [baraja1, setbaraja1] = useState([])
    const [baraja2, setbaraja2] = useState([])
    const [baraja3, setbaraja3] = useState([])
    const [colorActual, setcolorActual] = useState('')
    const [numerActual, setnumerActual] = useState('')
    const [ganador, setganador] = useState()
    const [isChatBoxHidden, setChatBoxHidden] = useState(true)
    const [pilaDeCartas, setpilaDeCartas] = useState([])
    const [drawPilaCartas, setdrawPilaCartas] = useState([])
    const [turno, setturno] = useState('')
    const [botonUnoPresionado, setbotonUnopresionado] = useState(false)

    useEffect(() => {
        const connectionOptions =  {
        "forceNew" : true, 
        "reconnectionAttempts": "Infinity", 
        "timeout" : 10000,                  
        "transports" : ["websocket"]
        }
        socket = io.connect(ENDPOINT, connectionOptions)
        socket.emit('join', {sala: sala, userName: userName}, (error) => {
            if(error){
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
        const baraja1 = shuffledCards.splice(0,7)
        const baraja2 = shuffledCards.splice(0,7)
        const baraja3 = shuffledCards.splice(0,7)

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
            baraja1: [...baraja1],
            baraja2: [...baraja2],
            baraja3: [...baraja3],
            colorActual: pilaDeCartas[0].charAt(1),
            numerActual: pilaDeCartas[0].charAt(0),
            pilaDeCartas: [...pilaDeCartas],
            drawPilaCartas: [...drawPilaCartas]
        })
    }, [])

    const verFinJuego = (array) => {
        return array.length === 1
    }

    const verGanador = (array, jugador) => {
        return array.length === 0 ? jugador: ''
    }

    useEffect(() => {
        socket.on("salaData", ({ users }) => {
            setUsers(users)
            users.map((item) => {
                if(item.name == 'Player 2'){
                    setUsuario2(item.userName)
                }else if(item.name == 'Player 1'){
                    setUsuario1(item.userName)
                }else{
                    setUsuario3(item.userName)
                }
            })
        })
        
        socket.on('initGameState', ({ gameOver, turno, baraja1, baraja2, baraja3, colorActual, numerActual, pilaDeCartas, drawPilaCartas }) => {
            setGameOver(gameOver)
            setturno(turno)
            setbaraja1(baraja1)
            setbaraja2(baraja2)
            setbaraja3(baraja3)
            setcolorActual(colorActual)
            setnumerActual(numerActual)
            setpilaDeCartas(pilaDeCartas)
            setdrawPilaCartas(drawPilaCartas)
            console.log("init")
        })
        
        socket.on('currentUserData', ({ userName, name }) => {
            setCurrentUserName(userName)
            setCurrentUser(name)
        })


        socket.on('updateGameState', ({ gameOver, ganador, turno, baraja1, baraja2, baraja3, colorActual, numerActual, pilaDeCartas, drawPilaCartas }) => {
            gameOver && setGameOver(gameOver)
            ganador && setganador(ganador)
            turno && setturno(turno)
            baraja1 && setbaraja1(baraja1)
            baraja2 && setbaraja2(baraja2)
            baraja3 && setbaraja3(baraja3)
            colorActual && setcolorActual(colorActual)
            numerActual && setnumerActual(numerActual)
            pilaDeCartas && setpilaDeCartas(pilaDeCartas)
            drawPilaCartas && setdrawPilaCartas(drawPilaCartas)
            setbotonUnopresionado(false)
        })

        socket.on('message', (message) => {
            setMessages(messages => [ ...messages, message ])
        })
    }, [])
    
    const toggleChatBox = () => {
        const chatBody = document.querySelector('.chat-body')
        if(isChatBoxHidden) {
            chatBody.style.display = 'block'
            setChatBoxHidden(false)
        }
        else {
            chatBody.style.display = 'none'
            setChatBoxHidden(true)
        }
    }

    const sendMessage= (event) => {
        event.preventDefault()
        if(message) {
            socket.emit('sendMessage', { message: message }, () => {
                setMessage('')
            })
        }
    }

    const cartaJugadaPorJugador = (cartaJugada) => {
        const cartaJugadaPor = turno
        switch(cartaJugada) {
            case 'OR' : case '1R' : case '2R' : case '3R' : case '4R' : case '5R' : case '6R' : case '7R' : case '8R' : case '9R' : 
            case 'OB' : case '1B' : case '2B' : case '3B' : case '4B' : case '5B' : case '6B' : case '7B' : case '8B' : case '9B' : 
            case 'OY' : case '1Y' : case '2Y' : case '3Y' : case '4Y' : case '5Y' : case '6Y' : case '7Y' : case '8Y' : case '9Y' : 
            case 'OG' : case '1G' : case '2G' : case '3G' : case '4G' : case '5G' : case '6G' : case '7G' : case '8G' : case '9G' : 
            {
                const numeroCartaJugada = cartaJugada.charAt(0)
                const colorCartaJugada = cartaJugada.charAt(1)

                if(colorActual === colorCartaJugada) {
                    console.log("Mismo color")
                    if(cartaJugadaPor === 'Player 1') {
                        const eliminarCartaDeBaraja = baraja1.indexOf(cartaJugada)

                        if (baraja1.length === 1 && !botonUnoPresionado) {
                            alert("No presionaste el boton de Uno, se te agregan dos cartas")
                            const copiaDrawPilaCartas = [...drawPilaCartas]

                            const drawPilaCarta1 = copiaDrawPilaCartas.pop()
                            const drawPilaCarta2 = copiaDrawPilaCartas.pop()

                            const actualizarBaraja1 = [...baraja1.slice(0, eliminarCartaDeBaraja), ...baraja1.slice(eliminarCartaDeBaraja + 1)]
                            actualizarBaraja1.push(drawPilaCarta1)
                            actualizarBaraja1.push(drawPilaCarta2)

                            socket.emit('updateGameState', {
                                gameOver: verFinJuego(baraja1),
                                turno: 'Player 2',
                                pilaDeCartas: [...pilaDeCartas.slice(0, pilaDeCartas.length), cartaJugada, ...pilaDeCartas.slice(pilaDeCartas.length)],
                                baraja1: [...actualizarBaraja1],
                                colorActual: colorCartaJugada,
                                numerActual: numeroCartaJugada,
                                drawPilaCartas: [...copiaDrawPilaCartas]
                            })
                        }
                        else {
                            socket.emit('updateGameState', {
                                gameOver: verFinJuego(baraja1),
                                turno: 'Player 2',
                                pilaDeCartas: [...pilaDeCartas.slice(0, pilaDeCartas.length), cartaJugada, ...pilaDeCartas.slice(pilaDeCartas.length)],
                                baraja1: [...baraja1.slice(0, eliminarCartaDeBaraja), ...baraja1.slice(eliminarCartaDeBaraja + 1)],
                                colorActual: colorCartaJugada,
                                numerActual: numeroCartaJugada
                            })
                        }
                    }
                    else if(cartaJugadaPor === 'Player 2') {
                        const eliminarCartaDeBaraja = baraja2.indexOf(cartaJugada)

                        if (baraja2.length === 1 && !botonUnoPresionado) {
                            alert("No presionaste el boton de Uno, se te agregan dos cartas")
                            const copiaDrawPilaCartas = [...drawPilaCartas]

                            const drawPilaCarta1 = copiaDrawPilaCartas.pop()
                            const drawPilaCarta2 = copiaDrawPilaCartas.pop()

                            const actualizarBaraja2 = [...baraja2.slice(0, eliminarCartaDeBaraja), ...baraja2.slice(eliminarCartaDeBaraja + 1)]
                            actualizarBaraja2.push(drawPilaCarta1)
                            actualizarBaraja2.push(drawPilaCarta2)

                            socket.emit('updateGameState', {
                                gameOver: verFinJuego(baraja2),
                                turno: 'Player 3',
                                pilaDeCartas: [...pilaDeCartas.slice(0, pilaDeCartas.length), cartaJugada, ...pilaDeCartas.slice(pilaDeCartas.length)],
                                baraja2: [...actualizarBaraja2],
                                colorActual: colorCartaJugada,
                                numerActual: numeroCartaJugada,
                                drawPilaCartas: [...copiaDrawPilaCartas]
                            })
                        }
                        else {
                            socket.emit('updateGameState', {
                                gameOver: verFinJuego(baraja2),
                                turno: 'Player 3',
                                pilaDeCartas: [...pilaDeCartas.slice(0, pilaDeCartas.length), cartaJugada, ...pilaDeCartas.slice(pilaDeCartas.length)],
                                baraja2: [...baraja2.slice(0, eliminarCartaDeBaraja), ...baraja2.slice(eliminarCartaDeBaraja + 1)],
                                colorActual: colorCartaJugada,
                                numerActual: numeroCartaJugada
                            })
                        }
                    }
                    else {
                        const eliminarCartaDeBaraja = baraja3.indexOf(cartaJugada)
                        
                        if (baraja3.length === 1 && !botonUnoPresionado) {
                            alert("No presionaste el boton de Uno, se te agregan dos cartas")
                            const copiaDrawPilaCartas = [...drawPilaCartas]

                            const drawPilaCarta1 = copiaDrawPilaCartas.pop()
                            const drawPilaCarta2 = copiaDrawPilaCartas.pop()

                            const actualizarBaraja3 = [...baraja3.slice(0, eliminarCartaDeBaraja), ...baraja3.slice(eliminarCartaDeBaraja + 1)]
                            actualizarBaraja3.push(drawPilaCarta1)
                            actualizarBaraja3.push(drawPilaCarta2)

                            socket.emit('updateGameState', {
                                gameOver: verFinJuego(baraja3),
                                turno: 'Player 1',
                                pilaDeCartas: [...pilaDeCartas.slice(0, pilaDeCartas.length), cartaJugada, ...pilaDeCartas.slice(pilaDeCartas.length)],
                                baraja3: [...actualizarBaraja3],
                                colorActual: colorCartaJugada,
                                numerActual: numeroCartaJugada,
                                drawPilaCartas: [...copiaDrawPilaCartas]
                            })
                        }
                        else {
                            socket.emit('updateGameState', {
                                gameOver: verFinJuego(baraja3),
                                turno: 'Player 1',
                                pilaDeCartas: [...pilaDeCartas.slice(0, pilaDeCartas.length), cartaJugada, ...pilaDeCartas.slice(pilaDeCartas.length)],
                                baraja3: [...baraja3.slice(0, eliminarCartaDeBaraja), ...baraja3.slice(eliminarCartaDeBaraja + 1)],
                                colorActual: colorCartaJugada,
                                numerActual: numeroCartaJugada
                            })
                        }
                    }
                }
                else if(numerActual === numeroCartaJugada) {
                    console.log('Mismo numero')
                    if(cartaJugadaPor === 'Player 1'){
                        const eliminarCartaDeBaraja = baraja1.indexOf(cartaJugada)
                        
                        if (baraja1.length === 1 && !botonUnoPresionado) {
                            alert("No presionaste el boton de Uno, se te agregan dos cartas")
                            const copiaDrawPilaCartas = [...drawPilaCartas]

                            const drawPilaCarta1 = copiaDrawPilaCartas.pop()
                            const drawPilaCarta2 = copiaDrawPilaCartas.pop()

                            const actualizarBaraja1 = [...baraja1.slice(0, eliminarCartaDeBaraja), ...baraja1.slice(eliminarCartaDeBaraja + 1)]
                            actualizarBaraja1.push(drawPilaCarta1)
                            actualizarBaraja1.push(drawPilaCarta2)

                            socket.emit('updateGameState', {
                                gameOver: verFinJuego(baraja1),
                                turno: 'Player 2',
                                pilaDeCartas: [...pilaDeCartas.slice(0, pilaDeCartas.length), cartaJugada, ...pilaDeCartas.slice(pilaDeCartas.length)],
                                baraja1: [...actualizarBaraja1],
                                colorActual: colorCartaJugada,
                                numerActual: numeroCartaJugada,
                                drawPilaCartas: [...copiaDrawPilaCartas]
                            })
                        }
                        else {
                            socket.emit('updateGameState', {
                                gameOver: verFinJuego(baraja1),
                                turno: 'Player 2',
                                pilaDeCartas: [...pilaDeCartas.slice(0, pilaDeCartas.length), cartaJugada, ...pilaDeCartas.slice(pilaDeCartas.length)],
                                baraja1: [...baraja1.slice(0, eliminarCartaDeBaraja), ...baraja1.slice(eliminarCartaDeBaraja + 1)],
                                colorActual: colorCartaJugada,
                                numerActual: numeroCartaJugada
                            })
                        }
                    }
                    else if(cartaJugadaPor === 'Player 2') {
                        const eliminarCartaDeBaraja = baraja2.indexOf(cartaJugada)

                        if (baraja2.length === 1 && !botonUnoPresionado) {
                            alert("No presionaste el boton de Uno, se te agregan dos cartas")
                            const copiaDrawPilaCartas = [...drawPilaCartas]

                            const drawPilaCarta1 = copiaDrawPilaCartas.pop()
                            const drawPilaCarta2 = copiaDrawPilaCartas.pop()

                            const actualizarBaraja2 = [...baraja2.slice(0, eliminarCartaDeBaraja), ...baraja2.slice(eliminarCartaDeBaraja + 1)]
                            actualizarBaraja2.push(drawPilaCarta1)
                            actualizarBaraja2.push(drawPilaCarta2)

                            socket.emit('updateGameState', {
                                gameOver: verFinJuego(baraja2),
                                turno: 'Player 3',
                                pilaDeCartas: [...pilaDeCartas.slice(0, pilaDeCartas.length), cartaJugada, ...pilaDeCartas.slice(pilaDeCartas.length)],
                                baraja2: [...actualizarBaraja2],
                                colorActual: colorCartaJugada,
                                numerActual: numeroCartaJugada,
                                drawPilaCartas: [...copiaDrawPilaCartas]
                            })
                        }
                        else {
                            socket.emit('updateGameState', {
                                gameOver: verFinJuego(baraja2),
                                turno: 'Player 3',
                                pilaDeCartas: [...pilaDeCartas.slice(0, pilaDeCartas.length), cartaJugada, ...pilaDeCartas.slice(pilaDeCartas.length)],
                                baraja2: [...baraja2.slice(0, eliminarCartaDeBaraja), ...baraja2.slice(eliminarCartaDeBaraja + 1)],
                                colorActual: colorCartaJugada,
                                numerActual: numeroCartaJugada
                            })
                        }
                    }
                    else {
                        const eliminarCartaDeBaraja = baraja3.indexOf(cartaJugada)

                        if (baraja3.length === 1 && !botonUnoPresionado) {
                            alert("No presionaste el boton de Uno, se te agregan dos cartas")
                            const copiaDrawPilaCartas = [...drawPilaCartas]

                            const drawPilaCarta1 = copiaDrawPilaCartas.pop()
                            const drawPilaCarta2 = copiaDrawPilaCartas.pop()

                            const actualizarBaraja3 = [...baraja3.slice(0, eliminarCartaDeBaraja), ...baraja3.slice(eliminarCartaDeBaraja + 1)]
                            actualizarBaraja3.push(drawPilaCarta1)
                            actualizarBaraja3.push(drawPilaCarta2)

                            socket.emit('updateGameState', {
                                gameOver: verFinJuego(baraja3),
                                turno: 'Player 1',
                                pilaDeCartas: [...pilaDeCartas.slice(0, pilaDeCartas.length), cartaJugada, ...pilaDeCartas.slice(pilaDeCartas.length)],
                                baraja3: [...actualizarBaraja3],
                                colorActual: colorCartaJugada,
                                numerActual: numeroCartaJugada,
                                drawPilaCartas: [...copiaDrawPilaCartas]
                            })
                        }
                        else {
                            socket.emit('updateGameState', {
                                gameOver: verFinJuego(baraja3),
                                turno: 'Player 1',
                                pilaDeCartas: [...pilaDeCartas.slice(0, pilaDeCartas.length), cartaJugada, ...pilaDeCartas.slice(pilaDeCartas.length)],
                                baraja3: [...baraja3.slice(0, eliminarCartaDeBaraja), ...baraja3.slice(eliminarCartaDeBaraja + 1)],
                                colorActual: colorCartaJugada,
                                numerActual: numeroCartaJugada
                            })
                        }
                    }
                }
                else {
                    alert('No se puede hacer')
                }

                break;
            }

            case 'D2R' : case 'D2B' : case 'D2Y' : case 'D2G' :
            {
                const colorCartaJugada = cartaJugada.charAt(2)
                if(colorActual === colorCartaJugada) {
                    console.log("Mismo color, una con Draw 2")
                    if(cartaJugadaPor === 'Player 1'){
                        const eliminarCartaDeBaraja = baraja1.indexOf(cartaJugada)
                        const copiaDrawPilaCartas = [...drawPilaCartas]

                        const drawPilaCarta1 = copiaDrawPilaCartas.pop()
                        const drawPilaCarta2 = copiaDrawPilaCartas.pop()

                        if (baraja1.length === 1 && !botonUnoPresionado) {
                            alert("No presionaste el boton de Uno, se te agregan dos cartas")
                            const copiaDrawPilaCartas = [...drawPilaCartas]

                            const drawPilaCartaPenalty1 = copiaDrawPilaCartas.pop()
                            const drawPilaCartaPenalty2 = copiaDrawPilaCartas.pop()

                            const actualizarBaraja1 = [...baraja1.slice(0, eliminarCartaDeBaraja), ...baraja1.slice(eliminarCartaDeBaraja + 1)]
                            actualizarBaraja1.push(drawPilaCartaPenalty1)
                            actualizarBaraja1.push(drawPilaCartaPenalty2)

                            socket.emit('updateGameState', {
                                gameOver: verFinJuego(baraja1),
                                turno: 'Player 2',
                                pilaDeCartas: [...pilaDeCartas.slice(0, pilaDeCartas.length), cartaJugada, ...pilaDeCartas.slice(pilaDeCartas.length)],
                                baraja1: [...actualizarBaraja1],
                                baraja2: [...baraja2.slice(0, baraja2.length), drawPilaCarta1, drawPilaCarta2, baraja2.slice(baraja2.length)],
                                colorActual: colorCartaJugada,
                                numerActual: 500,
                                drawPilaCartas: [...copiaDrawPilaCartas]
                            })
                        }
                        else {
                            socket.emit('updateGameState', {
                                gameOver: verFinJuego(baraja1),
                                turno: 'Player 2',
                                pilaDeCartas: [...pilaDeCartas.slice(0, pilaDeCartas.length), cartaJugada, ...pilaDeCartas.slice(pilaDeCartas.length)],
                                baraja1: [...baraja1.slice(0, eliminarCartaDeBaraja), ...baraja1.slice(eliminarCartaDeBaraja + 1)],
                                baraja2: [...baraja2.slice(0, baraja2.length), drawPilaCarta1, drawPilaCarta2, baraja2.slice(baraja2.length)],
                                colorActual: colorCartaJugada,
                                numerActual: 500,
                                drawPilaCartas: [...copiaDrawPilaCartas]
                            })
                        }
                    }
                    else if(cartaJugadaPor === 'Player 2') {
                        const eliminarCartaDeBaraja = baraja2.indexOf(cartaJugada)
                        const copiaDrawPilaCartas = [...drawPilaCartas]

                        const drawPilaCarta1 = copiaDrawPilaCartas.pop()
                        const drawPilaCarta2 = copiaDrawPilaCartas.pop()

                        if (baraja2.length === 1 && !botonUnoPresionado) {
                            alert("No presionaste el boton de Uno, se te agregan dos cartas")
                            const copiaDrawPilaCartas = [...drawPilaCartas]

                            const drawPilaCartaPenalty1 = copiaDrawPilaCartas.pop()
                            const drawPilaCartaPenalty2 = copiaDrawPilaCartas.pop()

                            const actualizarBaraja2 = [...baraja2.slice(0, eliminarCartaDeBaraja), ...baraja2.slice(eliminarCartaDeBaraja + 1)]
                            actualizarBaraja2.push(drawPilaCartaPenalty1)
                            actualizarBaraja2.push(drawPilaCartaPenalty2)

                            socket.emit('updateGameState', {
                                gameOver: verFinJuego(baraja2),
                                turno: 'Player 3',
                                pilaDeCartas: [...pilaDeCartas.slice(0, pilaDeCartas.length), cartaJugada, ...pilaDeCartas.slice(pilaDeCartas.length)],
                                baraja2: [...actualizarBaraja2],
                                baraja3: [...baraja3.slice(0, baraja3.length), drawPilaCarta1, drawPilaCarta2, baraja3.slice(baraja3.length)],
                                colorActual: colorCartaJugada,
                                numerActual: 500,
                                drawPilaCartas: [...copiaDrawPilaCartas]
                            })
                        }
                        else {
                            socket.emit('updateGameState', {
                                gameOver: verFinJuego(baraja2),
                                turno: 'Player 3',
                                pilaDeCartas: [...pilaDeCartas.slice(0, pilaDeCartas.length), cartaJugada, ...pilaDeCartas.slice(pilaDeCartas.length)],
                                baraja2: [...baraja2.slice(0, eliminarCartaDeBaraja), ...baraja2.slice(eliminarCartaDeBaraja + 1)],
                                baraja3: [...baraja3.slice(0, baraja3.length), drawPilaCarta1, drawPilaCarta2, baraja3.slice(baraja3.length)],
                                colorActual: colorCartaJugada,
                                numerActual: 500,
                                drawPilaCartas: [...copiaDrawPilaCartas]
                            })
                        }
                    }
                    else {
                        const eliminarCartaDeBaraja = baraja3.indexOf(cartaJugada)
                        const copiaDrawPilaCartas = [...drawPilaCartas]

                        const drawPilaCarta1 = copiaDrawPilaCartas.pop()
                        const drawPilaCarta2 = copiaDrawPilaCartas.pop()

                        if (baraja3.length === 1 && !botonUnoPresionado) {
                            alert("No presionaste el boton de Uno, se te agregan dos cartas")
                            const copiaDrawPilaCartas = [...drawPilaCartas]

                            const drawPilaCartaPenalty1 = copiaDrawPilaCartas.pop()
                            const drawPilaCartaPenalty2 = copiaDrawPilaCartas.pop()

                            const actualizarBaraja3 = [...baraja3.slice(0, eliminarCartaDeBaraja), ...baraja3.slice(eliminarCartaDeBaraja + 1)]
                            actualizarBaraja3.push(drawPilaCartaPenalty1)
                            actualizarBaraja3.push(drawPilaCartaPenalty2)

                            socket.emit('updateGameState', {
                                gameOver: verFinJuego(baraja3),
                                turno: 'Player 1',
                                pilaDeCartas: [...pilaDeCartas.slice(0, pilaDeCartas.length), cartaJugada, ...pilaDeCartas.slice(pilaDeCartas.length)],
                                baraja3: [...actualizarBaraja3],
                                baraja1: [...baraja1.slice(0, baraja1.length), drawPilaCarta1, drawPilaCarta2, baraja1.slice(baraja1.length)],
                                colorActual: colorCartaJugada,
                                numerActual: 500,
                                drawPilaCartas: [...copiaDrawPilaCartas]
                            })
                        }
                        else {
                            socket.emit('updateGameState', {
                                gameOver: verFinJuego(baraja3),
                                turno: 'Player 1',
                                pilaDeCartas: [...pilaDeCartas.slice(0, pilaDeCartas.length), cartaJugada, ...pilaDeCartas.slice(pilaDeCartas.length)],
                                baraja3: [...baraja3.slice(0, eliminarCartaDeBaraja), ...baraja3.slice(eliminarCartaDeBaraja + 1)],
                                baraja1: [...baraja1.slice(0, baraja1.length), drawPilaCarta1, drawPilaCarta2, baraja1.slice(baraja1.length)],
                                colorActual: colorCartaJugada,
                                numerActual: 500,
                                drawPilaCartas: [...copiaDrawPilaCartas]
                            })
                        }
                    }
                }
                else if(numerActual === 500) {
                    console.log("Mismo numero, una con Draw 2")
                    if(cartaJugadaPor === 'Player 1') {
                        const eliminarCartaDeBaraja = baraja1.indexOf(cartaJugada)
                        const copiaDrawPilaCartas = [...drawPilaCartas]

                        const drawPilaCarta1 = copiaDrawPilaCartas.pop()
                        const drawPilaCarta2 = copiaDrawPilaCartas.pop()

                        if (baraja1.length === 1 && !botonUnoPresionado) {
                            alert("No presionaste el boton de Uno, se te agregan dos cartas")
                            const copiaDrawPilaCartas = [...drawPilaCartas]

                            const drawPilaCartaPenalty1 = copiaDrawPilaCartas.pop()
                            const drawPilaCartaPenalty2 = copiaDrawPilaCartas.pop()

                            const actualizarBaraja1 = [...baraja1.slice(0, eliminarCartaDeBaraja), ...baraja1.slice(eliminarCartaDeBaraja + 1)]
                            actualizarBaraja1.push(drawPilaCartaPenalty1)
                            actualizarBaraja1.push(drawPilaCartaPenalty2)

                            socket.emit('updateGameState', {
                                gameOver: verFinJuego(baraja1),
                                turno: 'Player 2',
                                pilaDeCartas: [...pilaDeCartas.slice(0, pilaDeCartas.length), cartaJugada, ...pilaDeCartas.slice(pilaDeCartas.length)],
                                baraja1: [...actualizarBaraja1],
                                baraja2: [...baraja2.slice(0, baraja2.length), drawPilaCarta1, drawPilaCarta2, baraja2.slice(baraja2.length)],
                                colorActual: colorCartaJugada,
                                numerActual: 500,
                                drawPilaCartas: [...copiaDrawPilaCartas]
                            })
                        }
                        else {
                            socket.emit('updateGameState', {
                                gameOver: verFinJuego(baraja1),
                                turno: 'Player 2',
                                pilaDeCartas: [...pilaDeCartas.slice(0, pilaDeCartas.length), cartaJugada, ...pilaDeCartas.slice(pilaDeCartas.length)],
                                baraja1: [...baraja1.slice(0, eliminarCartaDeBaraja), ...baraja1.slice(eliminarCartaDeBaraja + 1)],
                                baraja2: [...baraja2.slice(0, baraja2.length), drawPilaCarta1, drawPilaCarta2, baraja2.slice(baraja2.length)],
                                colorActual: colorCartaJugada,
                                numerActual: 500,
                                drawPilaCartas: [...copiaDrawPilaCartas]
                            })
                        }
                    }
                    else if(cartaJugadaPor === 'Player 2') {
                        const eliminarCartaDeBaraja = baraja2.indexOf(cartaJugada)
                        const copiaDrawPilaCartas = [...drawPilaCartas]

                        const drawPilaCarta1 = copiaDrawPilaCartas.pop()
                        const drawPilaCarta2 = copiaDrawPilaCartas.pop()

                        if (baraja2.length === 1 && !botonUnoPresionado) {
                            alert("No presionaste el boton de Uno, se te agregan dos cartas")
                            const copiaDrawPilaCartas = [...drawPilaCartas]

                            const drawPilaCartaPenalty1 = copiaDrawPilaCartas.pop()
                            const drawPilaCartaPenalty2 = copiaDrawPilaCartas.pop()

                            const actualizarBaraja2 = [...baraja2.slice(0, eliminarCartaDeBaraja), ...baraja2.slice(eliminarCartaDeBaraja + 1)]
                            actualizarBaraja2.push(drawPilaCartaPenalty1)
                            actualizarBaraja2.push(drawPilaCartaPenalty2)

                            socket.emit('updateGameState', {
                                gameOver: verFinJuego(baraja2),
                                turno: 'Player 3',
                                pilaDeCartas: [...pilaDeCartas.slice(0, pilaDeCartas.length), cartaJugada, ...pilaDeCartas.slice(pilaDeCartas.length)],
                                baraja2: [...actualizarBaraja2],
                                baraja3: [...baraja3.slice(0, baraja3.length), drawPilaCarta1, drawPilaCarta2, baraja3.slice(baraja3.length)],
                                colorActual: colorCartaJugada,
                                numerActual: 500,
                                drawPilaCartas: [...copiaDrawPilaCartas]
                            })
                        }
                        else {
                            socket.emit('updateGameState', {
                                gameOver: verFinJuego(baraja2),
                                turno: 'Player 3',
                                pilaDeCartas: [...pilaDeCartas.slice(0, pilaDeCartas.length), cartaJugada, ...pilaDeCartas.slice(pilaDeCartas.length)],
                                baraja2: [...baraja2.slice(0, eliminarCartaDeBaraja), ...baraja2.slice(eliminarCartaDeBaraja + 1)],
                                baraja3: [...baraja3.slice(0, baraja3.length), drawPilaCarta1, drawPilaCarta2, baraja3.slice(baraja3.length)],
                                colorActual: colorCartaJugada,
                                numerActual: 500,
                                drawPilaCartas: [...copiaDrawPilaCartas]
                            })
                        }
                    }
                    else {
                        const eliminarCartaDeBaraja = baraja3.indexOf(cartaJugada)
                        const copiaDrawPilaCartas = [...drawPilaCartas]

                        const drawPilaCarta1 = copiaDrawPilaCartas.pop()
                        const drawPilaCarta2 = copiaDrawPilaCartas.pop()

                        if (baraja3.length === 1 && !botonUnoPresionado) {
                            alert("No presionaste el boton de Uno, se te agregan dos cartas")
                            const copiaDrawPilaCartas = [...drawPilaCartas]

                            const drawPilaCartaPenalty1 = copiaDrawPilaCartas.pop()
                            const drawPilaCartaPenalty2 = copiaDrawPilaCartas.pop()

                            const actualizarBaraja3 = [...baraja3.slice(0, eliminarCartaDeBaraja), ...baraja3.slice(eliminarCartaDeBaraja + 1)]
                            actualizarBaraja3.push(drawPilaCartaPenalty1)
                            actualizarBaraja3.push(drawPilaCartaPenalty2)

                            socket.emit('updateGameState', {
                                gameOver: verFinJuego(baraja3),
                                turno: 'Player 1',
                                pilaDeCartas: [...pilaDeCartas.slice(0, pilaDeCartas.length), cartaJugada, ...pilaDeCartas.slice(pilaDeCartas.length)],
                                baraja3: [...actualizarBaraja3],
                                baraja1: [...baraja1.slice(0, baraja1.length), drawPilaCarta1, drawPilaCarta2, baraja1.slice(baraja1.length)],
                                colorActual: colorCartaJugada,
                                numerActual: 500,
                                drawPilaCartas: [...copiaDrawPilaCartas]
                            })
                        }
                        else {
                            socket.emit('updateGameState', {
                                gameOver: verFinJuego(baraja3),
                                turno: 'Player 1',
                                pilaDeCartas: [...pilaDeCartas.slice(0, pilaDeCartas.length), cartaJugada, ...pilaDeCartas.slice(pilaDeCartas.length)],
                                baraja3: [...baraja3.slice(0, eliminarCartaDeBaraja), ...baraja3.slice(eliminarCartaDeBaraja + 1)],
                                baraja1: [...baraja1.slice(0, baraja1.length), drawPilaCarta1, drawPilaCarta2, baraja1.slice(baraja1.length)],
                                colorActual: colorCartaJugada,
                                numerActual: 500,
                                drawPilaCartas: [...copiaDrawPilaCartas]
                            })
                        }
                    }
                }
                else {
                    alert('No se puede hacer')
                }

                break;
            }

            case 'skipR' : case 'skipB' : case 'skipY' : case 'skipG' :
            {
                const colorCartaJugada = cartaJugada.charAt(4)
                if(colorActual === colorCartaJugada) {
                    console.log("Mismo color, una con Skip")
                    if(cartaJugadaPor === 'Player 1') {
                        const eliminarCartaDeBaraja = baraja1.indexOf(cartaJugada)

                        if (baraja1.length === 1 && !botonUnoPresionado) {
                            alert("No presionaste el boton de Uno, se te agregan dos cartas")
                            const copiaDrawPilaCartas = [...drawPilaCartas]

                            const drawPilaCarta1 = copiaDrawPilaCartas.pop()
                            const drawPilaCarta2 = copiaDrawPilaCartas.pop()

                            const actualizarBaraja1 = [...baraja1.slice(0, eliminarCartaDeBaraja), ...baraja1.slice(eliminarCartaDeBaraja + 1)]
                            actualizarBaraja1.push(drawPilaCarta1)
                            actualizarBaraja1.push(drawPilaCarta2)

                            socket.emit('updateGameState', {
                                gameOver: verFinJuego(baraja1),
                                turno: 'Player 3',
                                pilaDeCartas: [...pilaDeCartas.slice(0, pilaDeCartas.length), cartaJugada, ...pilaDeCartas.slice(pilaDeCartas.length)],
                                baraja1: [...actualizarBaraja1],
                                colorActual: colorCartaJugada,
                                numerActual: 600,
                                drawPilaCartas: [...copiaDrawPilaCartas]
                            })
                        }
                        else {
                            socket.emit('updateGameState', {
                                gameOver: verFinJuego(baraja1),
                                turno: 'Player 3',
                                pilaDeCartas: [...pilaDeCartas.slice(0, pilaDeCartas.length), cartaJugada, ...pilaDeCartas.slice(pilaDeCartas.length)],
                                baraja1: [...baraja1.slice(0, eliminarCartaDeBaraja), ...baraja1.slice(eliminarCartaDeBaraja + 1)],
                                colorActual: colorCartaJugada,
                                numerActual: 600
                            })
                        }
                    }
                    else if(cartaJugadaPor === 'Player 2') {
                        const eliminarCartaDeBaraja = baraja2.indexOf(cartaJugada)

                        if (baraja2.length === 1 && !botonUnoPresionado) {
                            alert("No presionaste el boton de Uno, se te agregan dos cartas")
                            const copiaDrawPilaCartas = [...drawPilaCartas]

                            const drawPilaCarta1 = copiaDrawPilaCartas.pop()
                            const drawPilaCarta2 = copiaDrawPilaCartas.pop()

                            const actualizarBaraja2 = [...baraja2.slice(0, eliminarCartaDeBaraja), ...baraja2.slice(eliminarCartaDeBaraja + 1)]
                            actualizarBaraja2.push(drawPilaCarta1)
                            actualizarBaraja2.push(drawPilaCarta2)

                            socket.emit('updateGameState', {
                                gameOver: verFinJuego(baraja2),
                                turno: 'Player 1',
                                pilaDeCartas: [...pilaDeCartas.slice(0, pilaDeCartas.length), cartaJugada, ...pilaDeCartas.slice(pilaDeCartas.length)],
                                baraja2: [...actualizarBaraja2],
                                colorActual: colorCartaJugada,
                                numerActual: 600,
                                drawPilaCartas: [...copiaDrawPilaCartas]
                            })
                        }
                        else {
                            socket.emit('updateGameState', {
                                gameOver: verFinJuego(baraja2),
                                turno: 'Player 1',
                                pilaDeCartas: [...pilaDeCartas.slice(0, pilaDeCartas.length), cartaJugada, ...pilaDeCartas.slice(pilaDeCartas.length)],
                                baraja2: [...baraja2.slice(0, eliminarCartaDeBaraja), ...baraja2.slice(eliminarCartaDeBaraja + 1)],
                                colorActual: colorCartaJugada,
                                numerActual: 600
                            })
                        }
                    }
                    else {
                        const eliminarCartaDeBaraja = baraja3.indexOf(cartaJugada)
                        
                        if (baraja3.length === 1 && !botonUnoPresionado) {
                            alert("No presionaste el boton de Uno, se te agregan dos cartas")
                            const copiaDrawPilaCartas = [...drawPilaCartas]

                            const drawPilaCarta1 = copiaDrawPilaCartas.pop()
                            const drawPilaCarta2 = copiaDrawPilaCartas.pop()

                            const actualizarBaraja3 = [...baraja3.slice(0, eliminarCartaDeBaraja), ...baraja3.slice(eliminarCartaDeBaraja + 1)]
                            actualizarBaraja3.push(drawPilaCarta1)
                            actualizarBaraja3.push(drawPilaCarta2)

                            socket.emit('updateGameState', {
                                gameOver: verFinJuego(baraja3),
                                turno: 'Player 2',
                                pilaDeCartas: [...pilaDeCartas.slice(0, pilaDeCartas.length), cartaJugada, ...pilaDeCartas.slice(pilaDeCartas.length)],
                                baraja3: [...actualizarBaraja3],
                                colorActual: colorCartaJugada,
                                numerActual: 600,
                                drawPilaCartas: [...copiaDrawPilaCartas]
                            })
                        }
                        else {
                            socket.emit('updateGameState', {
                                gameOver: verFinJuego(baraja3),
                                turno: 'Player 2',
                                pilaDeCartas: [...pilaDeCartas.slice(0, pilaDeCartas.length), cartaJugada, ...pilaDeCartas.slice(pilaDeCartas.length)],
                                baraja3: [...baraja3.slice(0, eliminarCartaDeBaraja), ...baraja3.slice(eliminarCartaDeBaraja + 1)],
                                colorActual: colorCartaJugada,
                                numerActual: 600
                            })
                        }
                    }
                }
                else if(numerActual === 600) {
                    console.log("Mismo numero, una con Skip")
                    if(cartaJugadaPor === 'Player 1') {
                        const eliminarCartaDeBaraja = baraja1.indexOf(cartaJugada)
                        if (baraja1.length === 1 && !botonUnoPresionado) {
                            alert("No presionaste el boton de Uno, se te agregan dos cartas")
                            const copiaDrawPilaCartas = [...drawPilaCartas]

                            const drawPilaCarta1 = copiaDrawPilaCartas.pop()
                            const drawPilaCarta2 = copiaDrawPilaCartas.pop()

                            const actualizarBaraja1 = [...baraja1.slice(0, eliminarCartaDeBaraja), ...baraja1.slice(eliminarCartaDeBaraja + 1)]
                            actualizarBaraja1.push(drawPilaCarta1)
                            actualizarBaraja1.push(drawPilaCarta2)

                            socket.emit('updateGameState', {
                                gameOver: verFinJuego(baraja1),
                                turno: 'Player 3',
                                pilaDeCartas: [...pilaDeCartas.slice(0, pilaDeCartas.length), cartaJugada, ...pilaDeCartas.slice(pilaDeCartas.length)],
                                baraja1: [...actualizarBaraja1],
                                colorActual: colorCartaJugada,
                                numerActual: 600,
                                drawPilaCartas: [...copiaDrawPilaCartas]
                            })
                        }
                        else {
                            socket.emit('updateGameState', {
                                gameOver: verFinJuego(baraja1),
                                turno: 'Player 3',
                                pilaDeCartas: [...pilaDeCartas.slice(0, pilaDeCartas.length), cartaJugada, ...pilaDeCartas.slice(pilaDeCartas.length)],
                                baraja1: [...baraja1.slice(0, eliminarCartaDeBaraja), ...baraja1.slice(eliminarCartaDeBaraja + 1)],
                                colorActual: colorCartaJugada,
                                numerActual: 600
                            })
                        }
                    }
                    else if(cartaJugadaPor === 'Player 2') {
                        const eliminarCartaDeBaraja = baraja2.indexOf(cartaJugada)
                        if (baraja2.length === 1 && !botonUnoPresionado) {
                            alert("No presionaste el boton de Uno, se te agregan dos cartas")
                            const copiaDrawPilaCartas = [...drawPilaCartas]

                            const drawPilaCarta1 = copiaDrawPilaCartas.pop()
                            const drawPilaCarta2 = copiaDrawPilaCartas.pop()

                            const actualizarBaraja2 = [...baraja2.slice(0, eliminarCartaDeBaraja), ...baraja2.slice(eliminarCartaDeBaraja + 1)]
                            actualizarBaraja2.push(drawPilaCarta1)
                            actualizarBaraja2.push(drawPilaCarta2)

                            socket.emit('updateGameState', {
                                gameOver: verFinJuego(baraja2),
                                turno: 'Player 1',
                                pilaDeCartas: [...pilaDeCartas.slice(0, pilaDeCartas.length), cartaJugada, ...pilaDeCartas.slice(pilaDeCartas.length)],
                                baraja2: [...actualizarBaraja2],
                                colorActual: colorCartaJugada,
                                numerActual: 600,
                                drawPilaCartas: [...copiaDrawPilaCartas]
                            })
                        }
                        else {
                            socket.emit('updateGameState', {
                                gameOver: verFinJuego(baraja2),
                                turno: 'Player 1',
                                pilaDeCartas: [...pilaDeCartas.slice(0, pilaDeCartas.length), cartaJugada, ...pilaDeCartas.slice(pilaDeCartas.length)],
                                baraja2: [...baraja2.slice(0, eliminarCartaDeBaraja), ...baraja2.slice(eliminarCartaDeBaraja + 1)],
                                colorActual: colorCartaJugada,
                                numerActual: 600
                            })
                        }
                    }
                    else {
                        const eliminarCartaDeBaraja = baraja3.indexOf(cartaJugada)

                        if (baraja3.length === 1 && !botonUnoPresionado) {
                            alert("No presionaste el boton de Uno, se te agregan dos cartas")
                            const copiaDrawPilaCartas = [...drawPilaCartas]

                            const drawPilaCarta1 = copiaDrawPilaCartas.pop()
                            const drawPilaCarta2 = copiaDrawPilaCartas.pop()

                            const actualizarBaraja3 = [...baraja3.slice(0, eliminarCartaDeBaraja), ...baraja3.slice(eliminarCartaDeBaraja + 1)]
                            actualizarBaraja3.push(drawPilaCarta1)
                            actualizarBaraja3.push(drawPilaCarta2)

                            socket.emit('updateGameState', {
                                gameOver: verFinJuego(baraja3),
                                turno: 'Player 2',
                                pilaDeCartas: [...pilaDeCartas.slice(0, pilaDeCartas.length), cartaJugada, ...pilaDeCartas.slice(pilaDeCartas.length)],
                                baraja3: [...actualizarBaraja3],
                                colorActual: colorCartaJugada,
                                numerActual: 600,
                                drawPilaCartas: [...copiaDrawPilaCartas]
                            })
                        }
                        socket.emit('updateGameState', {
                            gameOver: verFinJuego(baraja3),
                            turno: 'Player 2',
                            pilaDeCartas: [...pilaDeCartas.slice(0, pilaDeCartas.length), cartaJugada, ...pilaDeCartas.slice(pilaDeCartas.length)],
                            baraja3: [...baraja3.slice(0, eliminarCartaDeBaraja), ...baraja3.slice(eliminarCartaDeBaraja + 1)],
                            colorActual: colorCartaJugada,
                            numerActual: 600
                        })
                    }
                }
                else {
                    alert('No se puede hacer')
                }

                break;
            }

            // Caso Wild, carta para cambiar el color
            case 'W' : 
            {
                console.log("Carta Wild")
                if(cartaJugadaPor === 'Player 1') {
                    const nuevoColorCartaJugada = prompt('A que color desea cambiar R (Red) / B (Blue) / Y (Yellow) / G (Green)')

                    while (nuevoColorCartaJugada === 'R' || nuevoColorCartaJugada === 'B' || nuevoColorCartaJugada === 'Y' || nuevoColorCartaJugada === 'G') {
                        console.log('Escogio la opcion', nuevoColorCartaJugada)
                        const eliminarCartaDeBaraja = baraja1.indexOf(cartaJugada)

                        if (baraja1.length === 1 && !botonUnoPresionado) {
                            alert("No presionaste el boton de Uno, se te agregan dos cartas")
                            const copiaDrawPilaCartas = [...drawPilaCartas]

                            const drawPilaCarta1 = copiaDrawPilaCartas.pop()
                            const drawPilaCarta2 = copiaDrawPilaCartas.pop()

                            const actualizarBaraja1 = [...baraja1.slice(0, eliminarCartaDeBaraja), ...baraja1.slice(eliminarCartaDeBaraja + 1)]
                            actualizarBaraja1.push(drawPilaCarta1)
                            actualizarBaraja1.push(drawPilaCarta2)

                            socket.emit('updateGameState', {
                                gameOver: verFinJuego(baraja1),
                                turno: 'Player 2',
                                pilaDeCartas: [...pilaDeCartas.slice(0, pilaDeCartas.length), cartaJugada, ...pilaDeCartas.slice(pilaDeCartas.length)],
                                baraja1: [...actualizarBaraja1],
                                colorActual: nuevoColorCartaJugada,
                                numerActual: 700,
                                drawPilaCartas: [...copiaDrawPilaCartas]
                            })
                        }
                        else {
                            socket.emit('updateGameState', {
                                gameOver: verFinJuego(baraja1),
                                turno: 'Player 2',
                                pilaDeCartas: [...pilaDeCartas.slice(0, pilaDeCartas.length), cartaJugada, ...pilaDeCartas.slice(pilaDeCartas.length)],
                                baraja1: [...baraja1.slice(0, eliminarCartaDeBaraja), ...baraja1.slice(eliminarCartaDeBaraja + 1)],
                                colorActual: nuevoColorCartaJugada,
                                numerActual: 700
                            })
                        }
                    }
                }
                else if(cartaJugadaPor === 'Player 2') {
                    const nuevoColorCartaJugada = prompt('A que color desea cambiar R (Red) / B (Blue) / Y (Yellow) / G (Green)')

                    while (nuevoColorCartaJugada === 'R' || nuevoColorCartaJugada === 'B' || nuevoColorCartaJugada === 'Y' || nuevoColorCartaJugada === 'G') {
                        console.log('Escogio la opcion', nuevoColorCartaJugada)
                        const eliminarCartaDeBaraja = baraja2.indexOf(cartaJugada)

                        if (baraja2.length === 1 && !botonUnoPresionado) {
                            alert("No presionaste el boton de Uno, se te agregan dos cartas")
                            const copiaDrawPilaCartas = [...drawPilaCartas]

                            const drawPilaCarta1 = copiaDrawPilaCartas.pop()
                            const drawPilaCarta2 = copiaDrawPilaCartas.pop()

                            const actualizarBaraja2 = [...baraja2.slice(0, eliminarCartaDeBaraja), ...baraja2.slice(eliminarCartaDeBaraja + 1)]
                            actualizarBaraja2.push(drawPilaCarta1)
                            actualizarBaraja2.push(drawPilaCarta2)

                            socket.emit('updateGameState', {
                                gameOver: verFinJuego(baraja2),
                                turno: 'Player 3',
                                pilaDeCartas: [...pilaDeCartas.slice(0, pilaDeCartas.length), cartaJugada, ...pilaDeCartas.slice(pilaDeCartas.length)],
                                baraja2: [...actualizarBaraja2],
                                colorActual: nuevoColorCartaJugada,
                                numerActual: 700,
                                drawPilaCartas: [...copiaDrawPilaCartas]
                            })
                        }
                        else {
                            socket.emit('updateGameState', {
                                gameOver: verFinJuego(baraja2),
                                turno: 'Player 3',
                                pilaDeCartas: [...pilaDeCartas.slice(0, pilaDeCartas.length), cartaJugada, ...pilaDeCartas.slice(pilaDeCartas.length)],
                                baraja2: [...baraja2.slice(0, eliminarCartaDeBaraja), ...baraja2.slice(eliminarCartaDeBaraja + 1)],
                                colorActual: nuevoColorCartaJugada,
                                numerActual: 700
                            })
                        }
                    }
                }
                else {
                    const nuevoColorCartaJugada = prompt('A que color desea cambiar R (Red) / B (Blue) / Y (Yellow) / G (Green)')
                    while (nuevoColorCartaJugada === 'R' || nuevoColorCartaJugada === 'B' || nuevoColorCartaJugada === 'Y' || nuevoColorCartaJugada === 'G') {
                        console.log('Escogio la opcion', nuevoColorCartaJugada)
                        const eliminarCartaDeBaraja = baraja3.indexOf(cartaJugada)

                        if (baraja3.length === 1 && !botonUnoPresionado) {
                            alert("No presionaste el boton de Uno, se te agregan dos cartas")
                            const copiaDrawPilaCartas = [...drawPilaCartas]

                            const drawPilaCarta1 = copiaDrawPilaCartas.pop()
                            const drawPilaCarta2 = copiaDrawPilaCartas.pop()

                            const actualizarBaraja3 = [...baraja3.slice(0, eliminarCartaDeBaraja), ...baraja3.slice(eliminarCartaDeBaraja + 1)]
                            actualizarBaraja3.push(drawPilaCarta1)
                            actualizarBaraja3.push(drawPilaCarta2)

                            socket.emit('updateGameState', {
                                gameOver: verFinJuego(baraja3),
                                turno: 'Player 1',
                                pilaDeCartas: [...pilaDeCartas.slice(0, pilaDeCartas.length), cartaJugada, ...pilaDeCartas.slice(pilaDeCartas.length)],
                                baraja3: [...actualizarBaraja3],
                                colorActual: nuevoColorCartaJugada,
                                numerActual: 700,
                                drawPilaCartas: [...copiaDrawPilaCartas]
                            })
                        }
                        else {
                            socket.emit('updateGameState', {
                                gameOver: verFinJuego(baraja3),
                                turno: 'Player 1',
                                pilaDeCartas: [...pilaDeCartas.slice(0, pilaDeCartas.length), cartaJugada, ...pilaDeCartas.slice(pilaDeCartas.length)],
                                baraja3: [...baraja3.slice(0, eliminarCartaDeBaraja), ...baraja3.slice(eliminarCartaDeBaraja + 1)],
                                colorActual: nuevoColorCartaJugada,
                                numerActual: 700
                            })
                        }
                    }
                }
                break;
            }

            // Caso Draw 4 Wild, carta para cambiar el color pero tambien dar 4 cartas
            case 'D4W' : 
            {
                console.log("Carta Draw 4 Wild")
                if(cartaJugadaPor === 'Player 1') {
                    const nuevoColorCartaJugada = prompt('A que color desea cambiar R (Red) / B (Blue) / Y (Yellow) / G (Green)')

                    while (nuevoColorCartaJugada === 'R' || nuevoColorCartaJugada === 'B' || nuevoColorCartaJugada === 'Y' || nuevoColorCartaJugada === 'G') {
                        console.log('Escogio la opcion', nuevoColorCartaJugada)
                        const eliminarCartaDeBaraja = baraja1.indexOf(cartaJugada)
                        const copiaDrawPilaCartas = [...drawPilaCartas]

                        const drawPilaCarta1 = copiaDrawPilaCartas.pop()
                        const drawPilaCarta2 = copiaDrawPilaCartas.pop()
                        const drawPilaCarta3 = copiaDrawPilaCartas.pop()
                        const drawPilaCarta4 = copiaDrawPilaCartas.pop()

                        if (baraja1.length === 1 && !botonUnoPresionado) {
                            alert("No presionaste el boton de Uno, se te agregan dos cartas")
                            const copiaDrawPilaCartas = [...drawPilaCartas]

                            const drawPilaCartaPenalty1 = copiaDrawPilaCartas.pop()
                            const drawPilaCartaPenalty2 = copiaDrawPilaCartas.pop()

                            const actualizarBaraja1 = [...baraja1.slice(0, eliminarCartaDeBaraja), ...baraja1.slice(eliminarCartaDeBaraja + 1)]
                            actualizarBaraja1.push(drawPilaCartaPenalty1)
                            actualizarBaraja1.push(drawPilaCartaPenalty2)

                            socket.emit('updateGameState', {
                                gameOver: verFinJuego(baraja1),
                                turno: 'Player 2',
                                pilaDeCartas: [...pilaDeCartas.slice(0, pilaDeCartas.length), cartaJugada, ...pilaDeCartas.slice(pilaDeCartas.length)],
                                baraja1: [...actualizarBaraja1],
                                baraja2: [...baraja2.slice(0, baraja2.length), drawPilaCarta1, drawPilaCarta2, drawPilaCarta3, drawPilaCarta4, ...baraja2.slice(baraja2.length)],
                                colorActual: nuevoColorCartaJugada,
                                numerActual: 800,
                                drawPilaCartas: [...copiaDrawPilaCartas]
                            })
                        }
                        else {
                            socket.emit('updateGameState', {
                                gameOver: verFinJuego(baraja1),
                                turno: 'Player 2',
                                pilaDeCartas: [...pilaDeCartas.slice(0, pilaDeCartas.length), cartaJugada, ...pilaDeCartas.slice(pilaDeCartas.length)],
                                baraja1: [...baraja1.slice(0, eliminarCartaDeBaraja), ...baraja1.slice(eliminarCartaDeBaraja + 1)],
                                baraja2: [...baraja2.slice(0, baraja2.length), drawPilaCarta1, drawPilaCarta2, drawPilaCarta3, drawPilaCarta4, baraja2.slice(baraja2.length)],
                                colorActual: nuevoColorCartaJugada,
                                numerActual: 800,
                                drawPilaCartas: [...copiaDrawPilaCartas]
                            })
                        }
                    }
                }
                else if(cartaJugadaPor === 'Player 2') {
                    const nuevoColorCartaJugada = prompt('A que color desea cambiar R (Red) / B (Blue) / Y (Yellow) / G (Green)')
                        
                    while (nuevoColorCartaJugada === 'R' || nuevoColorCartaJugada === 'B' || nuevoColorCartaJugada === 'Y' || nuevoColorCartaJugada === 'G') {
                        console.log('Escogio la opcion', nuevoColorCartaJugada)
                        const eliminarCartaDeBaraja = baraja2.indexOf(cartaJugada)
                        const copiaDrawPilaCartas = [...drawPilaCartas]

                        const drawPilaCarta1 = copiaDrawPilaCartas.pop()
                        const drawPilaCarta2 = copiaDrawPilaCartas.pop()
                        const drawPilaCarta3 = copiaDrawPilaCartas.pop()
                        const drawPilaCarta4 = copiaDrawPilaCartas.pop()

                        socket.emit('updateGameState', {
                            gameOver: verFinJuego(baraja2),
                            turno: 'Player 3',
                            pilaDeCartas: [...pilaDeCartas.slice(0, pilaDeCartas.length), cartaJugada, ...pilaDeCartas.slice(pilaDeCartas.length)],
                            baraja2: [...baraja2.slice(0, eliminarCartaDeBaraja), ...baraja2.slice(eliminarCartaDeBaraja + 1)],
                            baraja3: [...baraja3.slice(0, baraja3.length), drawPilaCarta1, drawPilaCarta2, drawPilaCarta3, drawPilaCarta4, ...baraja3.slice(baraja3.length)],
                            colorActual: nuevoColorCartaJugada,
                            numerActual: 800,
                            drawPilaCartas: [...copiaDrawPilaCartas]
                        })
                        if (baraja2.length === 1 && !botonUnoPresionado) {
                            alert("No presionaste el boton de Uno, se te agregan dos cartas")
                            const copiaDrawPilaCartas = [...drawPilaCartas]

                            const drawPilaCartaPenalty1 = copiaDrawPilaCartas.pop()
                            const drawPilaCartaPenalty2 = copiaDrawPilaCartas.pop()

                            const actualizarBaraja2 = [...baraja2.slice(0, eliminarCartaDeBaraja), ...baraja2.slice(eliminarCartaDeBaraja + 1)]
                            actualizarBaraja2.push(drawPilaCartaPenalty1)
                            actualizarBaraja2.push(drawPilaCartaPenalty2)

                            socket.emit('updateGameState', {
                                gameOver: verFinJuego(baraja2),
                                turno: 'Player 3',
                                pilaDeCartas: [...pilaDeCartas.slice(0, pilaDeCartas.length), cartaJugada, ...pilaDeCartas.slice(pilaDeCartas.length)],
                                baraja2: [...actualizarBaraja2],
                                baraja3: [...baraja3.slice(0, baraja3.length), drawPilaCarta1, drawPilaCarta2, drawPilaCarta3, drawPilaCarta4, ...baraja3.slice(baraja3.length)],
                                colorActual: nuevoColorCartaJugada,
                                numerActual: 800,
                                drawPilaCartas: [...copiaDrawPilaCartas]
                            })
                        }
                        else {
                            socket.emit('updateGameState', {
                                gameOver: verFinJuego(baraja2),
                                turno: 'Player 3',
                                pilaDeCartas: [...pilaDeCartas.slice(0, pilaDeCartas.length), cartaJugada, ...pilaDeCartas.slice(pilaDeCartas.length)],
                                baraja2: [...baraja2.slice(0, eliminarCartaDeBaraja), ...baraja2.slice(eliminarCartaDeBaraja + 1)],
                                baraja3: [...baraja3.slice(0, baraja3.length), drawPilaCarta1, drawPilaCarta2, drawPilaCarta3, drawPilaCarta4, baraja3.slice(baraja3.length)],
                                colorActual: nuevoColorCartaJugada,
                                numerActual: 800,
                                drawPilaCartas: [...copiaDrawPilaCartas]
                            })
                        }
                    }
                }
                else {
                    const nuevoColorCartaJugada = prompt('A que color desea cambiar R (Red) / B (Blue) / Y (Yellow) / G (Green)')

                    while (nuevoColorCartaJugada === 'R' || nuevoColorCartaJugada === 'B' || nuevoColorCartaJugada === 'Y' || nuevoColorCartaJugada === 'G') {
                        console.log('Escogio la opcion', nuevoColorCartaJugada)
                        const eliminarCartaDeBaraja = baraja3.indexOf(cartaJugada)
                        const copiaDrawPilaCartas = [...drawPilaCartas]

                        const drawPilaCarta1 = copiaDrawPilaCartas.pop()
                        const drawPilaCarta2 = copiaDrawPilaCartas.pop()
                        const drawPilaCarta3 = copiaDrawPilaCartas.pop()
                        const drawPilaCarta4 = copiaDrawPilaCartas.pop()

                        socket.emit('updateGameState', {
                            gameOver: verFinJuego(baraja3),
                            turno: 'Player 1',
                            pilaDeCartas: [...pilaDeCartas.slice(0, pilaDeCartas.length), cartaJugada, ...pilaDeCartas.slice(pilaDeCartas.length)],
                            baraja3: [...baraja3.slice(0, eliminarCartaDeBaraja), ...baraja3.slice(eliminarCartaDeBaraja + 1)],
                            baraja1: [...baraja1.slice(0, baraja1.length), drawPilaCarta1, drawPilaCarta2, drawPilaCarta3, drawPilaCarta4, ...baraja1.slice(baraja1.length)],
                            colorActual: nuevoColorCartaJugada,
                            numerActual: 800,
                            drawPilaCartas: [...copiaDrawPilaCartas]
                        })
                        if (baraja3.length === 1 && !botonUnoPresionado) {
                            alert("No presionaste el boton de Uno, se te agregan dos cartas")
                            const copiaDrawPilaCartas = [...drawPilaCartas]

                            const drawPilaCartaPenalty1 = copiaDrawPilaCartas.pop()
                            const drawPilaCartaPenalty2 = copiaDrawPilaCartas.pop()

                            const actualizarBaraja3 = [...baraja3.slice(0, eliminarCartaDeBaraja), ...baraja3.slice(eliminarCartaDeBaraja + 1)]
                            actualizarBaraja3.push(drawPilaCartaPenalty1)
                            actualizarBaraja3.push(drawPilaCartaPenalty2)

                            socket.emit('updateGameState', {
                                gameOver: verFinJuego(baraja3),
                                turno: 'Player 1',
                                pilaDeCartas: [...pilaDeCartas.slice(0, pilaDeCartas.length), cartaJugada, ...pilaDeCartas.slice(pilaDeCartas.length)],
                                baraja3: [...actualizarBaraja3],
                                baraja1: [...baraja1.slice(0, baraja1.length), drawPilaCarta1, drawPilaCarta2, drawPilaCarta3, drawPilaCarta4, ...baraja1.slice(baraja1.length)],
                                colorActual: nuevoColorCartaJugada,
                                numerActual: 800,
                                drawPilaCartas: [...copiaDrawPilaCartas]
                            })
                        }
                        else {
                            socket.emit('updateGameState', {
                                gameOver: verFinJuego(baraja3),
                                turno: 'Player 1',
                                pilaDeCartas: [...pilaDeCartas.slice(0, pilaDeCartas.length), cartaJugada, ...pilaDeCartas.slice(pilaDeCartas.length)],
                                baraja3: [...baraja3.slice(0, eliminarCartaDeBaraja), ...baraja3.slice(eliminarCartaDeBaraja + 1)],
                                baraja1: [...baraja1.slice(0, baraja1.length), drawPilaCarta1, drawPilaCarta2, drawPilaCarta3, drawPilaCarta4, baraja1.slice(baraja1.length)],
                                colorActual: nuevoColorCartaJugada,
                                numerActual: 800,
                                drawPilaCartas: [...copiaDrawPilaCartas]
                            })
                        }
                    }
                }
            }
            break;
        }
        
    }

    const drawCartaPilaDeCartas = () => {
        const drawnCartaPor = turno
        
        if (drawnCartaPor === 'Player 1') {
            const copiaDrawPilaCartas = [...drawPilaCartas]
            const drawCarta = copiaDrawPilaCartas.pop()
            const colorDrawnCarta = drawCarta.charAt(drawCarta.length - 1)
            let numerDrawnCarta = drawCarta.charAt(0)

            if(colorDrawnCarta === colorActual || numerDrawnCarta === numerActual) {
                alert(`La carta que se obtuvo es la de ${drawCarta} y se jugo`)
                socket.emit('updateGameState', {
                    turno: 'Player 2',
                    pilaDeCartas: [...pilaDeCartas.slice(0, pilaDeCartas.length), drawCarta, ...pilaDeCartas.slice(pilaDeCartas.length)],
                    drawPilaCartas: [...copiaDrawPilaCartas]
                })
            }
            else if (colorDrawnCarta === colorActual && (drawCarta === 'D2R' || drawCarta === 'D2B' || drawCarta === 'D2Y' || drawCarta === 'D2G')) {
                alert(`La carta que se obtuvo es la de ${drawCarta} y se jugo`)
                const copiaDrawPilaCartas = [...drawPilaCartas]

                const drawPilaCarta1 = copiaDrawPilaCartas.pop()
                const drawPilaCarta2 = copiaDrawPilaCartas.pop()

                socket.emit('updateGameState', {
                    turno: 'Player 2',
                    pilaDeCartas: [...pilaDeCartas.slice(0, pilaDeCartas.length), drawCarta, ...pilaDeCartas.slice(pilaDeCartas.length)],
                    baraja2: [...baraja2.slice(0, baraja2.length), drawPilaCarta1, drawPilaCarta2, ...baraja2.slice(baraja2.length)],
                    colorActual: colorDrawnCarta,
                    numerActual: 500,
                    drawPilaCartas: [...copiaDrawPilaCartas]
                })
            }
            else if(colorDrawnCarta === colorActual && (drawCarta === 'skipR' || drawCarta === 'skipB' || drawCarta === 'skipY' || drawCarta === 'skipG')) {
                alert(`La carta que se obtuvo es la de ${drawCarta} y se jugo`)

                socket.emit('updateGameState', {
                    turno: 'Player 2',
                    pilaDeCartas: [...pilaDeCartas.slice(0, pilaDeCartas.length), drawCarta, ...pilaDeCartas.slice(pilaDeCartas.length)],
                    colorActual: colorDrawnCarta,
                    numerActual: 600,
                    drawPilaCartas: [...copiaDrawPilaCartas]
                })
            }
            else if(drawCarta === 'W') {
                alert(`La carta que se obtuvo es la de ${drawCarta} y se jugo`)
                const nuevoColorCarta = prompt('A que color desea cambiar R (Red) / B (Blue) / Y (Yellow) / G (Green)')
                socket.emit('updateGameState', {
                    turno: 'Player 2',
                    pilaDeCartas: [...pilaDeCartas.slice(0, pilaDeCartas.length), drawCarta, ...pilaDeCartas.slice(pilaDeCartas.length)],
                    colorActual: nuevoColorCarta,
                    numerActual: 700,
                    drawPilaCartas: [...copiaDrawPilaCartas]
                })
            }
            else if(drawCarta === 'D4W') {
                alert(`La carta que se obtuvo es la de ${drawCarta} y se jugo`)
                const nuevoColorCarta = prompt('A que color desea cambiar R (Red) / B (Blue) / Y (Yellow) / G (Green)')
                const copiaDrawPilaCartas = [...drawPilaCartas]
                
                const drawPilaCarta1 = copiaDrawPilaCartas.pop()
                const drawPilaCarta2 = copiaDrawPilaCartas.pop()
                const drawPilaCarta3 = copiaDrawPilaCartas.pop()
                const drawPilaCarta4 = copiaDrawPilaCartas.pop()
                
                socket.emit('updateGameState', {
                    turno: 'Player 2',
                    pilaDeCartas: [...pilaDeCartas.slice(0, pilaDeCartas.length), drawCarta, ...pilaDeCartas.slice(pilaDeCartas.length)],
                    baraja2: [...baraja2.slice(0, baraja2.length), drawPilaCarta1, drawPilaCarta2, drawPilaCarta3, drawPilaCarta4, ...baraja2.slice(baraja2.length)],
                    colorActual: nuevoColorCarta,
                    numerActual: 800,
                    drawPilaCartas: [...copiaDrawPilaCartas]
                })
            }
            else {
                alert(`La carta que se obtuvo es la de ${drawCarta}`)
                
                socket.emit('updateGameState', {
                    turno: 'Player 2',
                    baraja1: [...baraja1.slice(0, baraja1.length), drawCarta, ...baraja1.slice(baraja1.length)],
                    drawPilaCartas: [...copiaDrawPilaCartas]
                })
            }

        }
        else if (drawnCartaPor === 'Player 2') {
            const copiaDrawPilaCartas = [...drawPilaCartas]
            const drawCarta = copiaDrawPilaCartas.pop()
            const colorDrawnCarta = drawCarta.charAt(drawCarta.length - 1)
            let numerDrawnCarta = drawCarta.charAt(0)

            if(colorDrawnCarta === colorActual || numerDrawnCarta === numerActual) {
                alert(`La carta que se obtuvo es la de ${drawCarta} y se jugo`)
                socket.emit('updateGameState', {
                    turno: 'Player 3',
                    pilaDeCartas: [...pilaDeCartas.slice(0, pilaDeCartas.length), drawCarta, ...pilaDeCartas.slice(pilaDeCartas.length)],
                    drawPilaCartas: [...copiaDrawPilaCartas]
                })
            }
            else if (colorDrawnCarta === colorActual && (drawCarta === 'D2R' || drawCarta === 'D2B' || drawCarta === 'D2Y' || drawCarta === 'D2G')) {
                alert(`La carta que se obtuvo es la de ${drawCarta} y se jugo`)
                const copiaDrawPilaCartas = [...drawPilaCartas]

                const drawPilaCarta1 = copiaDrawPilaCartas.pop()
                const drawPilaCarta2 = copiaDrawPilaCartas.pop()

                socket.emit('updateGameState', {
                    turno: 'Player 3',
                    pilaDeCartas: [...pilaDeCartas.slice(0, pilaDeCartas.length), drawCarta, ...pilaDeCartas.slice(pilaDeCartas.length)],
                    baraja3: [...baraja3.slice(0, baraja3.length), drawPilaCarta1, drawPilaCarta2, ...baraja3.slice(baraja3.length)],
                    colorActual: colorDrawnCarta,
                    numerActual: 500,
                    drawPilaCartas: [...copiaDrawPilaCartas]
                })
            }
            else if(colorDrawnCarta === colorActual && (drawCarta === 'skipR' || drawCarta === 'skipB' || drawCarta === 'skipY' || drawCarta === 'skipG')) {
                alert(`La carta que se obtuvo es la de ${drawCarta} y se jugo`)

                socket.emit('updateGameState', {
                    turno: 'Player 3',
                    pilaDeCartas: [...pilaDeCartas.slice(0, pilaDeCartas.length), drawCarta, ...pilaDeCartas.slice(pilaDeCartas.length)],
                    colorActual: colorDrawnCarta,
                    numerActual: 600,
                    drawPilaCartas: [...copiaDrawPilaCartas]
                })
            }
            else if(drawCarta === 'W') {
                alert(`La carta que se obtuvo es la de ${drawCarta} y se jugo`)
                const nuevoColorCarta = prompt('A que color desea cambiar R (Red) / B (Blue) / Y (Yellow) / G (Green)')
                socket.emit('updateGameState', {
                    turno: 'Player 3',
                    pilaDeCartas: [...pilaDeCartas.slice(0, pilaDeCartas.length), drawCarta, ...pilaDeCartas.slice(pilaDeCartas.length)],
                    colorActual: nuevoColorCarta,
                    numerActual: 700,
                    drawPilaCartas: [...copiaDrawPilaCartas]
                })
            }
            else if(drawCarta === 'D4W') {
                alert(`La carta que se obtuvo es la de ${drawCarta} y se jugo`)
                const nuevoColorCarta = prompt('A que color desea cambiar R (Red) / B (Blue) / Y (Yellow) / G (Green)')
                const copiaDrawPilaCartas = [...drawPilaCartas]
                
                const drawPilaCarta1 = copiaDrawPilaCartas.pop()
                const drawPilaCarta2 = copiaDrawPilaCartas.pop()
                const drawPilaCarta3 = copiaDrawPilaCartas.pop()
                const drawPilaCarta4 = copiaDrawPilaCartas.pop()
                
                socket.emit('updateGameState', {
                    turno: 'Player 3',
                    pilaDeCartas: [...pilaDeCartas.slice(0, pilaDeCartas.length), drawCarta, ...pilaDeCartas.slice(pilaDeCartas.length)],
                    baraja3: [...baraja3.slice(0, baraja3.length), drawPilaCarta1, drawPilaCarta2, drawPilaCarta3, drawPilaCarta4, ...baraja3.slice(baraja3.length)],
                    colorActual: nuevoColorCarta,
                    numerActual: 800,
                    drawPilaCartas: [...copiaDrawPilaCartas]
                })
            }
            else {
                alert(`La carta que se obtuvo es la de ${drawCarta}`)
                
                socket.emit('updateGameState', {
                    turno: 'Player 3',
                    baraja2: [...baraja2.slice(0, baraja2.length), drawCarta, ...baraja2.slice(baraja2.length)],
                    drawPilaCartas: [...copiaDrawPilaCartas]
                })
            }
        }
        else {
            const copiaDrawPilaCartas = [...drawPilaCartas]
            const drawCarta = copiaDrawPilaCartas.pop()
            const colorDrawnCarta = drawCarta.charAt(drawCarta.length - 1)
            let numerDrawnCarta = drawCarta.charAt(0)

            if(colorDrawnCarta === colorActual || numerDrawnCarta === numerActual) {
                alert(`La carta que se obtuvo es la de ${drawCarta} y se jugo`)
                socket.emit('updateGameState', {
                    turno: 'Player 1',
                    pilaDeCartas: [...pilaDeCartas.slice(0, pilaDeCartas.length), drawCarta, ...pilaDeCartas.slice(pilaDeCartas.length)],
                    drawPilaCartas: [...copiaDrawPilaCartas]
                })
            }
            else if (colorDrawnCarta === colorActual && (drawCarta === 'D2R' || drawCarta === 'D2B' || drawCarta === 'D2Y' || drawCarta === 'D2G')) {
                alert(`La carta que se obtuvo es la de ${drawCarta} y se jugo`)
                const copiaDrawPilaCartas = [...drawPilaCartas]

                const drawPilaCarta1 = copiaDrawPilaCartas.pop()
                const drawPilaCarta2 = copiaDrawPilaCartas.pop()

                socket.emit('updateGameState', {
                    turno: 'Player 1',
                    pilaDeCartas: [...pilaDeCartas.slice(0, pilaDeCartas.length), drawCarta, ...pilaDeCartas.slice(pilaDeCartas.length)],
                    baraja1: [...baraja1.slice(0, baraja1.length), drawPilaCarta1, drawPilaCarta2, ...baraja1.slice(baraja1.length)],
                    colorActual: colorDrawnCarta,
                    numerActual: 500,
                    drawPilaCartas: [...copiaDrawPilaCartas]
                })
            }
            else if(colorDrawnCarta === colorActual && (drawCarta === 'skipR' || drawCarta === 'skipB' || drawCarta === 'skipY' || drawCarta === 'skipG')) {
                alert(`La carta que se obtuvo es la de ${drawCarta} y se jugo`)

                socket.emit('updateGameState', {
                    turno: 'Player 1',
                    pilaDeCartas: [...pilaDeCartas.slice(0, pilaDeCartas.length), drawCarta, ...pilaDeCartas.slice(pilaDeCartas.length)],
                    colorActual: colorDrawnCarta,
                    numerActual: 600,
                    drawPilaCartas: [...copiaDrawPilaCartas]
                })
            }
            else if(drawCarta === 'W') {
                alert(`La carta que se obtuvo es la de ${drawCarta} y se jugo`)
                const nuevoColorCarta = prompt('A que color desea cambiar R (Red) / B (Blue) / Y (Yellow) / G (Green)')
                socket.emit('updateGameState', {
                    turno: 'Player 1',
                    pilaDeCartas: [...pilaDeCartas.slice(0, pilaDeCartas.length), drawCarta, ...pilaDeCartas.slice(pilaDeCartas.length)],
                    colorActual: nuevoColorCarta,
                    numerActual: 700,
                    drawPilaCartas: [...copiaDrawPilaCartas]
                })
            }
            else if(drawCarta === 'D4W') {
                alert(`La carta que se obtuvo es la de ${drawCarta} y se jugo`)
                const nuevoColorCarta = prompt('A que color desea cambiar R (Red) / B (Blue) / Y (Yellow) / G (Green)')
                const copiaDrawPilaCartas = [...drawPilaCartas]
                
                const drawPilaCarta1 = copiaDrawPilaCartas.pop()
                const drawPilaCarta2 = copiaDrawPilaCartas.pop()
                const drawPilaCarta3 = copiaDrawPilaCartas.pop()
                const drawPilaCarta4 = copiaDrawPilaCartas.pop()
                
                socket.emit('updateGameState', {
                    turno: 'Player 1',
                    pilaDeCartas: [...pilaDeCartas.slice(0, pilaDeCartas.length), drawCarta, ...pilaDeCartas.slice(pilaDeCartas.length)],
                    baraja1: [...baraja1.slice(0, baraja1.length), drawPilaCarta1, drawPilaCarta2, drawPilaCarta3, drawPilaCarta4, ...baraja1.slice(baraja1.length)],
                    colorActual: nuevoColorCarta,
                    numerActual: 800,
                    drawPilaCartas: [...copiaDrawPilaCartas]
                })
            }
            else {
                alert(`La carta que se obtuvo es la de ${drawCarta}`)
                
                socket.emit('updateGameState', {
                    turno: 'Player 1',
                    baraja3: [...baraja3.slice(0, baraja3.length), drawCarta, ...baraja3.slice(baraja3.length)],
                    drawPilaCartas: [...copiaDrawPilaCartas]
                })
            }
        } 

    }

    return (
        <div style={{"minHeight": '624px', 'height': '100vh'}}>
             <Button href='/' variant="contained" color="error" size="small">Salir del juego</Button>
             {(!salaFull) ? 
             <>
                <h1>{sala}</h1>
                {users.length <=2 ?<h1>Espera a que se unan los otros jugadores</h1>: 
                <>
                    {gameOver ? <h1>Fin del juego, gano {ganador}</h1> :
                    <>
                        {currentUser === 'Player 1' ? 
                        <>
                        <div className="paginaGame">
                            <div>
                                <p className='playerDeckText'>{usuario2}</p>
                                {baraja2.map((item, i) => (
                                    <img
                                        key={i}
                                        style={{'width': "30px", 'height': "50px"}}
                                        src={require(`../imagenes/card-back.png`).default}
                                        
                                        />
                                ))}
                                {turno === 'Player 2'}
                                <br></br>
                                <br></br>
                                <p className='playerDeckText'>{usuario3}</p>
                                {baraja3.map((item, i) => (
                                    <img
                                        key={i}
                                        style={{'width': "30px", 'height': "50px"}}
                                        src={require(`../imagenes/card-back.png`).default}
                                        />
                                ))}
                                {turno === 'Player 3'}
                                
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
                                <p className='playerDeckText'>{usuario1}</p>
                                {baraja1.map((item, i) => (
                                    <img
                                        key={i}
                                        style={{'width': "50px", 'height': "70px"}}
                                        onClick={() => cartaJugadaPorJugador(item)}
                                        src={require(`../imagenes/${item}.png`).default}
                                        />
                
                                ))}
                                <button onClick={drawCartaPilaDeCartas}>DRAW CARTA</button>
                                <button disabled={baraja1.length !== 1} onClick={() => { setbotonUnopresionado(!botonUnoPresionado) }}>UNO</button>
                            </div>
                            <div className="chatcontenedor">
                                <div className="chat">
                                    <div className="mensajes">
                                        {messages.map(msg => {
                                            if(msg.user === 'Player 1')
                                                return <div className="msg-send">{"Yo:  " + msg.text}</div>
                                            if(msg.user === 'Player 2')
                                                return <div className="msg-receive">{msg.name + ":  " + msg.text}</div>
                                            if(msg.user === 'Player 3')
                                                return <div className="msg-receive">{msg.name + ":  " + msg.text}</div>
                                        })}
                                    </div>
                                    <div className="chat-text">
                                        <input type='text' placeholder='Escribe un mensaje...' value={message} onChange={event => setMessage(event.target.value)} onKeyPress={event => event.key==='Enter' && sendMessage(event)} />
                                    </div>
                                
                                </div>
                            </div>
                        </div>

                        </>:<></>} 

                        {currentUser === 'Player 2' ? 
                        <>
                        <div className="paginaGame">
                            <div>
                                <p className='playerDeckText'>{usuario1}</p>
                                {baraja1.map((item, i) => (
                                    <img
                                        key={i}
                                        style={{'width': "30px", 'height': "50px"}}
                                        src={require(`../imagenes/card-back.png`).default}
                                        />
                                ))}
                                <br></br>
                                <br></br>
                                <p className='playerDeckText'>{usuario3}</p>
                                {baraja3.map((item, i) => (
                                    <img
                                        key={i}
                                        style={{'width': "30px", 'height': "50px"}}
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
                                <p className='playerDeckText'>{usuario2}</p>
                                {baraja2.map((item, i) => (
                                    <img
                                        key={i}
                                        style={{'width': "50px", 'height': "70px"}}
                                        onClick={() => cartaJugadaPorJugador(item)}
                                        src={require(`../imagenes/${item}.png`).default}
                                        />
                                ))}
                                <button onClick={drawCartaPilaDeCartas}>DRAW CARTA</button>
                                <button disabled={baraja2.length !== 1} onClick={() => { setbotonUnopresionado(!botonUnoPresionado) }}>UNO</button>
                            </div>
                            <div className="chatcontenedor">
                                <div className="chat">
                                    <div className="mensajes">
                                        {messages.map(msg => {
                                            if(msg.user === 'Player 2')
                                                return <div className="msg-send">{"Yo:  " + msg.text}</div>
                                            if(msg.user === 'Player 1')
                                                return <div className="msg-receive">{msg.name + ":  " + msg.text}</div>
                                            if(msg.user === 'Player 3')
                                                return <div className="msg-receive">{msg.name + ":  " + msg.text}</div>
                                        })}
                                    </div>
                                    <div className="chat-text">
                                        <input type='text' placeholder='Escribe un mensaje...' value={message} onChange={event => setMessage(event.target.value)} onKeyPress={event => event.key==='Enter' && sendMessage(event)} />
                                    </div>
                                
                                </div>
                            </div>
                        </div>
                        </>:<></>} 
                        {currentUser === 'Player 3' ? 
                        <>
                        <div className="paginaGame">
                            <div>
                                <p className='playerDeckText'>{usuario1}</p>
                                {baraja1.map((item, i) => (
                                    <img
                                        key={i}
                                        style={{'width': "30px", 'height': "50px"}}
                                        src={require(`../imagenes/card-back.png`).default}
                                        />
                                ))}
                                <br></br>
                                <br></br>
                                <p className='playerDeckText'>{usuario2}</p>
                                {baraja2.map((item, i) => (
                                    <img
                                        key={i}
                                        style={{'width': "30px", 'height': "50px"}}
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
                                <p className='playerDeckText'>{usuario3}</p>
                                {baraja3.map((item, i) => (
                                    <img
                                        key={i}
                                        style={{'width': "50px", 'height': "70px"}}
                                        onClick={() => cartaJugadaPorJugador(item)}
                                        src={require(`../imagenes/${item}.png`).default}
                                        />
                                ))}
                                <button onClick={drawCartaPilaDeCartas}>DRAW CARTA</button>
                                <button disabled={baraja3.length !== 1} onClick={() => { setbotonUnopresionado(!botonUnoPresionado) }}>UNO</button>
                            </div>
                            <div className="chatcontenedor">
                                <div className="chat">
                                    <div className="mensajes">
                                        {messages.map(msg => {
                                            if(msg.user === 'Player 3')
                                                return <div className="msg-send">{"Yo:  " + msg.text}</div>
                                            if(msg.user === 'Player 2')
                                                return <div className="msg-receive">{msg.name + ":  " + msg.text}</div>
                                            if(msg.user === 'Player 1')
                                                return <div className="msg-receive">{msg.name + ":  " + msg.text}</div>
                                        })}
                                    </div>
                                    <div className="chat-text">
                                        <input type='text' placeholder='Escribe un mensaje...' value={message} onChange={event => setMessage(event.target.value)} onKeyPress={event => event.key==='Enter' && sendMessage(event)} />
                                    </div>
                                
                                </div>
                            </div>
                        </div>
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