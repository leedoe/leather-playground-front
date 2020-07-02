import React from 'react';
import { TextField, withStyles, Paper, Button, Box } from '@material-ui/core';
import Axios from 'axios';

import { withRouter } from 'react-router-dom'

const useStyles = theme => ({
  logindiv: {
    // width: theme.spacing(50),
    margin: '0 auto',
    padding: theme.spacing(2),
    [theme.breakpoints.up('sm')]: {
      width: theme.spacing(50),
    }
  },
  password: {
    //paddingTop: theme.spacing(2)
  },
  textfield: {
    width: theme.spacing(46)
  },
  buttonDiv: {
    marginTop: theme.spacing(2)
  },
  leftButton: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2)
  },
  center: {
    alignItem: 'center',
    justify: 'center'
  }
});


class LoginPage extends React.Component {
  state = {
    user: {
      username: '',
      password: ''
    }, 
    loginError: false,
  }

  constructor(props) {
    super(props)
    this.login = props.login
    this.usernameOnChange = this.usernameOnChange.bind(this)
    this.passwordOnChange = this.passwordOnChange.bind(this)
    this.onPushLoginButton = this.onPushLoginButton.bind(this)
  }

  usernameOnChange(e) {
    const user = this.state.user
    user.username = e.target.value
    this.setState({user})
  }

  passwordOnChange(e) {
    const user = this.state.user
    user.password = e.target.value
    this.setState({user})
  }

  getAndSetUserdata() {
    const token = localStorage.getItem('token')
    if(token === null) {
      return
    }

    Axios.get(
      'http://127.0.0.1:8000/api/users/me',
      {
        headers: {
          Authorization: `token ${token}`
        }
      }).then((response) => {
        const user = response.data
        localStorage.setItem('user', JSON.stringify(user))
        console.log(user)
        this.props.setUserData(user)
        this.props.history.replace('/posts')
      })
  }

  onPushLoginButton(e) {
    Axios.post('http://127.0.0.1:8000/auth-token/', {
      username: this.state.user.username,
      password: this.state.user.password})
      .then((response) => {
        localStorage.setItem('token', response.data.token)
        this.getAndSetUserdata()
        this.props.login()
      }).catch((e) => {
        this.setState({loginError: true})
        console.log(e)
      })
  }

  render() {
    const {classes} = this.props
    
    return (
      <div>
        <Paper className={classes.logindiv}>
            <form
              noValidate
              autoComplete="off">
              <TextField required 
                fullWidth={true}
                id='id'
                label='ID'
                onChange={this.usernameOnChange}/>
              <TextField required
                fullWidth={true}
                id='password'
                label='PASSWORD'
                type='password'
                onChange={this.passwordOnChange}/>
                <Button
                  className={classes.leftButton}
                  fullWidth={true}
                  variant="contained" 
                  color="secondary"
                  onClick={this.onPushLoginButton}
                  >
                  로그인
                </Button>
                <Button
                  fullWidth={true}
                  variant="contained" 
                  color="primary">
                  회원가입
                </Button>
            </form>
        </Paper>
      </div>
    )
  }
}

export default withStyles(useStyles, { withTheme: true })(withRouter(LoginPage));