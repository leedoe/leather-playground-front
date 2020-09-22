import React from 'react';
import { connect } from 'react-redux';
import { withStyles, Paper, TextField, Button } from '@material-ui/core';
import { withRouter, Link } from 'react-router-dom';
import { withSnackbar } from 'notistack';

import bcrypt from 'bcryptjs'

import env from '../../salt'
import Axios from 'axios';


const useStyles = theme => ({
  mainContainer: {
    padding: theme.spacing(2)
  },
  password: {
    marginBottom: theme.spacing(2)
  },
});

class CheckPasswordPage extends React.Component {
  state = {
    password: '',
    salt: env.salt
  }

  onChangePassword = (e) => {
    this.setState({password: e.target.value})
  }

  onClickSubmit = () => {
    const {comment} = this.props.location.state
    const hash = bcrypt.hashSync(this.state.password, this.state.salt)
    Axios.delete(
      `${process.env.REACT_APP_SERVERURL}/api/items/comments/${comment.id}`,
      {
        data: {
          password: hash
        }
      }
    ).then(response => {
      this.props.enqueueSnackbar('정상적으로 삭제되었습니다.', {variant: 'success'})
      this.props.history.go(-1)
    }).catch(e => {
      this.props.enqueueSnackbar('비밀번호가 틀렸습니다.', {variant: 'error'})
    })
  }

  render () {
    const { classes } = this.props;
    return (
      <div className={classes.mainContainer}>
        <div className={classes.logindiv}>
          <form
            onSubmit={this.onPushLoginButton}
            noValidate
            autoComplete="off">
            <TextField
              className={classes.password}
              required
              fullWidth={true}
              label='비밀번호'
              onChange={this.onChangePassword}/>
              <Button
                fullWidth={true}
                variant="contained"
                color="primary"
                onClick={this.onClickSubmit}>
                확인
              </Button>
          </form>
        </div>
      </div>
    )
  }
}

const mapStateToProps = (state, ownProps) => ({
  isLogin: state.isLogin,
  ownProps
})

export default connect(mapStateToProps)(withStyles(useStyles, { withTheme: true })(withRouter(withSnackbar(CheckPasswordPage))));