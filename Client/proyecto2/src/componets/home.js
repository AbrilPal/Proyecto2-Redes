import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';

function makeid(length) {
    var result  = '';
    var characters  = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
       result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

const Homepage = () => {
    const [salaCode, setsalaCode] = useState('')

    return (
        <div className='Homepage'>
            <img
            src={require(`../imagenes/logo.png`).default}
            />
            <h1>¿Cómo se juega?</h1>
            <p style={{'marginLeft': '100px', 'marginRight': '100px', 'textAlign': 'justify'}}>Cada jugador mira sus cartas e intenta hacer coincidir la carta en la pila de descarte.
            Tienes que hacer coincidir el número, el color o el símbolo / Acción. Por ejemplo, si la pila de descarte tiene una tarjeta roja que es un 8, debe colocar una tarjeta roja o una tarjeta con un 8. También puede jugar un comodín (que puede alterar el color actual en juego).
            Si el jugador no tiene coincidencias o elige no jugar ninguna de sus cartas aunque pueda tener una coincidencia, debe robar una carta de la pila de Robar. Si esa carta se puede jugar, juéguela.
            El juego continúa hasta que a un jugador le queda una carta. En el momento en que un jugador tiene una sola carta, debe gritar " ¡ UNO !". Si otro jugador los sorprende sin decir "Uno" antes de que el siguiente jugador haya tomado su turno, ese jugador debe robar dos cartas nuevas como penalización.</p>
            <h3>Cartas de acción:</h3>
            <h5>Reversa</h5>
            <img
            style={{'width': '80px', 'height': '100px'}}
            src={require(`../imagenes/_B.png`).default}
            />
            <p style={{'marginLeft': '300px', 'marginRight': '300px', 'textAlign': 'justify'}}>si va en el sentido de las agujas del reloj, cambie a la izquierda o viceversa. Solo se puede jugar en una carta que coincida por color o en otra carta inversa.</p>
            <h5>Omitir</h5>
            <img
            style={{'width': '80px', 'height': '100px'}}
            src={require(`../imagenes/skipR.png`).default}
            />
            <p style={{'marginLeft': '300px', 'marginRight': '300px', 'textAlign': 'justify'}}>cuando un jugador coloca esta carta, el siguiente jugador debe omitir su turno. Solo se puede jugar en una carta que coincida por color o en otra carta de salto.</p>
            <h5>Robar dos</h5>
            <img
            style={{'width': '80px', 'height': '100px'}}
            src={require(`../imagenes/D2Y.png`).default}
            />
            <p style={{'marginLeft': '300px', 'marginRight': '300px', 'textAlign': 'justify'}}>cuando una persona coloca esta carta, el siguiente jugador tendrá que recoger dos cartas y perder su turno. Solo se puede jugar en una carta que coincida por color, o en otro Robar Dos.</p>
            <h5>Comodín Robar cuatro</h5>
            <img
            style={{'width': '80px', 'height': '100px'}}
            src={require(`../imagenes/D4W.png`).default}
            />
            <p style={{'marginLeft': '300px', 'marginRight': '300px', 'textAlign': 'justify'}}>actúa como el comodín, excepto que el siguiente jugador también tiene que robar cuatro cartas y perder su turno. Con esta carta, no debe tener otras cartas alternativas para jugar que coincidan con el color de la carta jugada anteriormente.</p>
            <h5>Comodín</h5>
            <img
            style={{'width': '80px', 'height': '100px'}}
            src={require(`../imagenes/W.png`).default}
            />
            <p style={{'marginLeft': '300px', 'marginRight': '300px', 'textAlign': 'justify'}}>esta carta representa los cuatro colores y se puede colocar en cualquier carta. El jugador debe indicar qué color representará para el siguiente jugador.</p>
            <br></br>
            <Stack spacing={2} direction="row" justifyContent="center">
                <Stack spacing={2} direction="row" >
                    <TextField label="Código de sala" color="secondary" focused onChange={(event) => setsalaCode(event.target.value)} size='small'/>
                    <Button color="secondary" variant="outlined" href={`/play?salaCode=${salaCode}`}>Unirse</Button>
                </Stack>
                <h4>O</h4>
                <div className='homepage-create'>
                    <Button color="secondary" variant="outlined" href={`/play?salaCode=${makeid(5)}`}>Nueva sala</Button>
                </div>
            </Stack>
            <br></br>
            <br></br>
        </div>
    )
}

export default Homepage