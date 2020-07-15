import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import * as serviceWorker from './serviceWorker';
import { BrowserRouter } from 'react-router-dom';

import Layout from './layout/layout';
import { ThemeProvider, createMuiTheme } from '@material-ui/core';
import { SnackbarProvider } from 'notistack';


const theme = createMuiTheme({
  palette: {
    type: 'dark',
    primary: {
      main: '#69afe2'
    }
  }
})

ReactDOM.render(
  
  <ThemeProvider theme={theme}>
    <meta charset="utf-8" />
    <SnackbarProvider maxSnack={3}>
      <BrowserRouter>
        <Layout />
      </BrowserRouter>
    </SnackbarProvider>
  </ThemeProvider>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
