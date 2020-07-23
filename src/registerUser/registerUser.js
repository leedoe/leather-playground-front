import React from 'react'
import { withStyles, Backdrop, CircularProgress, Paper, Button, TextField } from '@material-ui/core';
import { withSnackbar } from 'notistack';
import { withRouter } from 'react-router-dom';
import Axios from 'axios';
import bcrypt from 'bcryptjs'
import salt from '../salt.js'

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
    // marginBottom: theme.spacing(2)
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

class RegisterUser extends React.Component {
  state = {
    nowLoading: false,
    user: {
      username: '',
      name: '',
      password: ''
    },
    userTextField: {
      username: false,
      name: false,
      password: false
    }
  }

  constructor(props) {
    super(props)
    this.usernameOnChange = this.usernameOnChange.bind(this)
    this.passwordOnChange = this.passwordOnChange.bind(this)
    this.nameOnChange = this.nameOnChange.bind(this)
    this.register = this.register.bind(this)
    this.state.salt = salt.salt
  }

  usernameOnChange (e) {
    const user = this.state.user
    user.username = e.target.value
    this.setState({user})
  }

  passwordOnChange (e) {
    const user = this.state.user
    // user.password = e.target.value

    // bcrypt.genSalt(10, (err, salt) => {
    //   bcrypt.hash(e.target.value, salt, (err, hash) => {
    //     user.password = hash
    //   })
    // })
    // console.log(user)
    const hash = bcrypt.hashSync(e.target.value, this.state.salt)
    user.password = hash
    console.log(user)
    this.setState({user})
  }

  nameOnChange (e) {
    const user = this.state.user
    user.name = e.target.value
    this.setState({user})
  }

  register() {
    this.setState({nowLoading: true})
    this.setState({
      userTextField: {
        username: false,
        name: false,
        password: false
      }
    })
    const data = this.state.user
    Axios.post(
      'http://127.0.0.1:8000/api/users/',
      data
      ).then((response) => {
        this.setState({nowLoading: false})
        this.props.history.replace('/login/')
      }).catch((error) => {
        this.setState({nowLoading: false})
        for(const data in error.response.data) {
          const userTextField = this.state.userTextField
          userTextField[data] = true
          this.setState({userTextField})
          let message = error.response.data[data][0]
          message = message.replace('사용자 이름은', '아이디는')
          message = message.replace('Name of User은/는', '닉네임은')
          this.props.enqueueSnackbar(message, {variant: 'error'})
        }
      })
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
                id='username'
                label='아이디'
                error={this.state.userTextField.username}
                onChange={this.usernameOnChange}
                onKeyPress={this.inputIdKeyPress}/>
              <TextField required
                fullWidth={true}
                id='password'
                label='비밀번호'
                type='password'
                onChange={this.passwordOnChange}
                onKeyPress={this.inputPasswordKeyPress}/>
              <TextField required 
                fullWidth={true}
                id='name'
                label='닉네임'
                error={this.state.userTextField.name}
                onChange={this.nameOnChange}
                onKeyPress={this.inputIdKeyPress}/>
                <Button
                  className={classes.leftButton}
                  fullWidth={true}
                  variant="contained" 
                  color="primary"
                  onClick={this.register}>
                  회원가입
                </Button>
            </form>
        </Paper>
      </div>
    )
  }
}

export default withStyles(useStyles, { withTheme: true })(withSnackbar(withRouter(RegisterUser)));