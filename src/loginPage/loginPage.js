import React from 'react';
import { TextField, withStyles, Paper, Button, Backdrop, CircularProgress } from '@material-ui/core';
import Axios from 'axios';

import { withRouter } from 'react-router-dom'
import { withSnackbar } from 'notistack';

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
  },
  backdrop: {
    zIndex: theme.zIndex.drawer + 999,
    color: '#fff',
  }
});


class LoginPage extends React.Component {
  state = {
    user: {
      username: '',
      password: ''
    }, 
    loginError: false,
    nowLoading: false
  }

  constructor(props) {
    super(props)
    this.login = props.login
    this.usernameOnChange = this.usernameOnChange.bind(this)
    this.passwordOnChange = this.passwordOnChange.bind(this)
    this.onPushLoginButton = this.onPushLoginButton.bind(this)
    this.inputPasswordKeyPress = this.inputPasswordKeyPress.bind(this)
    this.inputIdKeyPress = this.inputIdKeyPress.bind(this)
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
    this.setState({nowLoading: true})
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
        this.props.setUserData(user)
        this.props.history.replace('/posts')
      }).catch((e) => {
        
      })
  }

  onPushLoginButton(e) {
    this.setState({nowLoading: true})
    Axios.post('http://127.0.0.1:8000/auth-token/', {
      username: this.state.user.username,
      password: this.state.user.password})
      .then((response) => {
        this.setState({nowLoading: false})
        localStorage.setItem('token', response.data.token)
        this.getAndSetUserdata()
        this.props.login()
        this.props.enqueueSnackbar('정상적으로 로그인 되었습니다.', {variant: 'success'})
      }).catch((e) => {
        this.setState({nowLoading: false})
        this.setState({loginError: true})
        this.props.enqueueSnackbar('아이디 비밀번호를 확인해주세요.', {variant: 'error'})
      })
  }

  inputIdKeyPress(e) {
    if(e.key === 'Enter') {
      document.getElementById('password').focus()
    }
  }

  inputPasswordKeyPress(e) {
    if(e.key === 'Enter'){
      this.onPushLoginButton()
    }
  }

  render() {
    const {classes} = this.props
    
    return (
      <div>
        <Backdrop className={classes.backdrop} open={this.state.nowLoading}>
          <CircularProgress color="inherit" />
        </Backdrop>
        <Paper className={classes.logindiv}>
            <form
              onSubmit={this.onPushLoginButton}
              noValidate
              autoComplete="off">
              <TextField required 
                fullWidth={true}
                id='id'
                label='ID'
                onChange={this.usernameOnChange}
                onKeyPress={this.inputIdKeyPress}/>
              <TextField required
                fullWidth={true}
                id='password'
                label='PASSWORD'
                type='password'
                onChange={this.passwordOnChange}
                onKeyPress={this.inputPasswordKeyPress}/>
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

export default withStyles(useStyles, { withTheme: true })(withSnackbar(withRouter(LoginPage)));