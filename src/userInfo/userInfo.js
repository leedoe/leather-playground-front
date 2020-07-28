import React from 'react';
import { TextField, withStyles, Paper, Button, Backdrop, CircularProgress } from '@material-ui/core';
import Axios from 'axios';

import { withRouter } from 'react-router-dom'
import { withSnackbar } from 'notistack';

import bcrypt from 'bcryptjs'

const useStyles = theme => ({
  logindiv: {
    // width: theme.spacing(50),
    margin: '0 auto',
    padding: theme.spacing(2),
    [theme.breakpoints.up('sm')]: {
      width: theme.spacing(50),
    }
  },
  leftButton: {
    marginTop: theme.spacing(2),
  }
});


class UserInfo extends React.Component {
  state = {
    user: {},
    salt: process.env.REACT_APP_SERVERURL,
  }

  constructor(props) {
    super(props)
    this.state.user = JSON.parse(localStorage.getItem('user'))
  }

  passwordOnChange = (e) => {
    const user = this.state.user

    const hash = bcrypt.hashSync(e.target.value, this.state.salt)
    user.password = hash
    this.setState({user})
  }

  nicknameOnChange = (e) => {
    const user = this.state.user
    user.name = e.target.value
    this.setState({user})
  }

  onClickModifyButton = () => {
    const config = {
      headers: {
        Authorization: `token ${localStorage.getItem('token')}`
      }
    }
    
    const user = this.state.user

    Axios.put(
      `${process.env.REACT_APP_SERVERURL}/api/users/${this.state.user.username}/`,
      user,
      config
      ).then((response) => {
        this.props.enqueueSnackbar('정상적으로 수정 되었습니다.', {variant: 'success'})
        localStorage.setItem('user', JSON.stringify(user))
        this.props.setUserData(user)
        this.props.history.replace(`/`)
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
            <TextField
              fullWidth={true}
              id='id'
              label='ID'
              disabled
              defaultValue={this.state.user.username}/>
            <TextField required
              fullWidth={true}
              id='password'
              label='PASSWORD'
              type='password'
              onChange={this.passwordOnChange}/>
            <TextField
              fullWidth={true}
              id='name'
              label='닉네임'
              defaultValue={this.state.user.name}
              onChange={this.nicknameOnChange}/>
            <Button
                className={classes.leftButton}
                fullWidth={true}
                variant="contained" 
                color="secondary"
                onClick={this.onClickModifyButton}
                >
                수정
              </Button>
            {/* <TextField required
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
                component={Link}
                to={`/users/register/`}
                fullWidth={true}
                variant="contained" 
                color="primary">
                회원가입
              </Button> */}
          </form>
        </Paper>
      </div>
    )
  }
}

export default withStyles(useStyles, { withTheme: true })(withSnackbar(withRouter(UserInfo)));