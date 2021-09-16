import logo from './logo.svg';
import './App.css';
import io from 'socket.io-client'
import { useEffect } from 'react';

function App() {

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
    <div className="App">
      hola
    </div>
  );
}

export default App;
