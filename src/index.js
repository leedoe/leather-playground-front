import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, createMuiTheme } from '@material-ui/core';
import { SnackbarProvider } from 'notistack';
import { Provider } from 'react-redux'
import { createStore } from 'redux'

import Layout from './layout/layout';
import './index.css';
import * as serviceWorker from './serviceWorker';
import userReducer from './redux/reducers/user';
import { lime } from '@material-ui/core/colors';


const theme = createMuiTheme({
  palette: {
    primary: lime
  }
})

const store = createStore(userReducer)

ReactDOM.render(
  
  <ThemeProvider theme={theme}>
    <SnackbarProvider maxSnack={3}>
      <BrowserRouter>
        <Provider store={store}>
          <Layout />
        </Provider>
      </BrowserRouter>
    </SnackbarProvider>
  </ThemeProvider>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
