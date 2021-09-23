// import logo from './logo.svg';
import './App.css';

import {
  BrowserRouter as Router,
  // Switch,
  Route,
  // Link
} from "react-router-dom";
// import { useEffect } from 'react';
import Homepage from './componets/home'
import gamepage from './componets/game'

function App() {
  return (
    <div className="App">
      <Router>
        <Route path='/' exact component={Homepage} />
        <Route path="/play/:id/:idUser" exact component={gamepage} />
      </Router>
    </div>
  );
}

export default App;
