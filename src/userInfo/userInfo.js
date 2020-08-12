import React from 'react';
import { TextField, withStyles, Paper, Button, Backdrop, CircularProgress } from '@material-ui/core';
import Axios from 'axios';

import { withRouter } from 'react-router-dom'
import { withSnackbar } from 'notistack';

import bcrypt from 'bcryptjs'
import env from '../salt'
import { setUser } from '../redux/actions';
import { connect } from 'react-redux';

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
    salt: env.salt,
  }

  constructor(props) {
    super(props)
    this.state.user = JSON.parse(localStorage.getItem('user'))
  }

  passwordOnChange = (e) => {
    const user = this.state.user

    user.password = e.target.value
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
        Authorization: `JWT ${localStorage.getItem('token')}`
      }
    }
    
    const user = this.state.user
    const hash = bcrypt.hashSync(user.password, this.state.salt)
    user.password = hash

    Axios.put(
      `${process.env.REACT_APP_SERVERURL}/api/users/${this.state.user.username}/`,
      user,
      config
      ).then((response) => {
        this.props.enqueueSnackbar('정상적으로 수정 되었습니다.', {variant: 'success'})
        this.props.setUser(response.data)
        this.props.history.replace(`/`)
    })
  }

  render() {
    const {classes} = this.props
    
    return (
      <div>
        <Backdrop className={classes.backdrop}>
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
              defaultValue={this.props.user.username}/>
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
              defaultValue={this.props.user.name}
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
          </form>
        </Paper>
      </div>
    )
  }
}

const mapDispatchToProps = dispatch => ({
  setUser: user => dispatch(setUser(user))
})

const mapStateToProps = (state, ownProps) => ({
  isLogin: state.isLogin,
  user: state.user,
  ownProps
})

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(useStyles, { withTheme: true })(withSnackbar(withRouter(UserInfo))))