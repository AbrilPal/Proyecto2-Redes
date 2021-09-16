import logo from './logo.svg';
import './App.css';
import io from 'socket.io-client'
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from "react-router-dom";
import { useEffect } from 'react';
import Homepage from './componets/home'
import gamepage from './componets/game'

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
      <Router>
        <Route path='/' exact component={Homepage} />
        <Route path='/play' exact component={gamepage} />
      </Router>
    </div>
  );
}

export default App;
