import React from 'react';
import logo from './logo.svg';
import './App.css';

import {BrowserRouter, Switch, Route, Link} from 'react-router-dom'
import Board from './posts/posts'

function App() {
  return (
    <div className="App">
      <BrowserRouter>

      
        <nav>
          <div>
            <Link to='/'>HOME</Link>
          </div>
          <div>
            <Link to='/board'>BOARD</Link>
          </div>
          <div>
            <Link to='/map'>MAP</Link>
          </div>
        </nav>
        <Switch>
          <Route path='/board'>
            <Board />
          </Route>
          <Route path='/map'>
            <h1>TEST</h1>
          </Route>
          <Route path='/'>
            <header className="App-header">
              <img src={logo} className="App-logo" alt="logo" />
              <p>
                Edit <code>src/App.js</code> and save to reload.
              </p>
              <a
                className="App-link"
                href="https://reactjs.org"
                target="_blank"
                rel="noopener noreferrer"
              >
                Learn React
              </a>
            </header>
          </Route>
        </Switch>
      
      </BrowserRouter>
    </div>
  );
}

export default App;
