import logo from './logo.svg';
import './App.css';
import io from 'socket.io-client'
import { useEffect } from 'react';
import Homepage from './componets/home'

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
      <Homepage />
    </div>
  );
}

export default App;
