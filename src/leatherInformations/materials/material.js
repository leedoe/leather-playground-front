import React from 'react';
import { Paper, withStyles, Grid, Divider, TextField, Button } from '@material-ui/core';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { withSnackbar } from 'notistack';
import Axios from 'axios';
import { logout } from '../../redux/actions'


const useStyles = theme => ({
  mainContainer: {
    padding: theme.spacing(2)
  },
  Divider: {
    margin: theme.spacing(1)
  },
  submit: {
    marginTop: theme.spacing(1),
  }
});

class Material extends React.Component {
  state = {
    image: '',
    name: '',
    explanation: '',
  }

  onChangeName = (e) => {
    this.setState({name: e.target.value})
  }

  onChangeExplanation = (e) => {
    this.setState({explanation: e.target.value})
  }

  onChangeImage = (e) => {
    this.setState({image: e.target.files[0]})
  }

  onClickSubmit = () => {
    const formData = new FormData()
    formData.append('image', this.state.image)
    formData.append('name', this.state.name)
    formData.append('explanation', this.state.explanation)

    const config = {
      headers: {
        Authorization: `JWT ${localStorage.getItem('token')}`,
        'Content-Type': 'multipart/form-data'
      }
    }

    Axios.post(
      `${process.env.REACT_APP_SERVERURL}/api/materials/`,
      formData,
      config
    ).then(response =>{
      // console.log(response)
      this.props.enqueueSnackbar('정상적으로 등록되었습니다.', {variant: 'success'})
      this.props.history.replace('/materials/')
    }).catch(e => {
      if(e.response.status === 401) {
        Axios.post(
          `${process.env.REACT_APP_SERVERURL}/api-token-refresh/`,
          {refresh: localStorage.getItem('refresh')}
        ).then(response => {
          localStorage.setItem('token', response.data.access)
          localStorage.setItem('refresh', response.data.refresh)
          this.sendData()
        }).catch(e => {
          this.props.enqueueSnackbar('다시 로그인해주세요.', {variant: 'error'})
          this.props.logout()
          this.props.history.replace(`/login/`)
        })
      } else {
        this.props.enqueueSnackbar('서버와 연결이 정상적이지 않습니다.', {variant: 'error'})
      }
    })
  }

  render () {
    const { classes } = this.props;
    return (
      <div className={classes.mainContainer}>
        <Grid container spacing={2}>
          <Grid item sm={12} md={12}>
            <div>
              <label for='image'>이미지</label>
              <input type='file' id='image' accept='image/png, image/jpg' onChange={this.onChangeImage}/>
            </div>
            <Divider className={classes.Divider}/>
            <div>
              {/* <Typography align='center'>{this.state.tannery.name}</Typography> */}
              <TextField label="이름" required onChange={this.onChangeName}/>
            </div>
            <Divider className={classes.Divider}/>
          </Grid>
          <Grid item sm={12} md={12}>
            {/* <Typography style={{whiteSpace: 'pre-wrap'}}>{this.state.tannery.explanation}</Typography> */}
            <TextField fullWidth multiline label="설명" onChange={this.onChangeExplanation}/>
          </Grid>
        </Grid>
        <Grid container justify='flex-end'>
            <Grid item>
              <Button
                className={classes.submit}
                variant="contained"
                color='primary'
                onClick={this.onClickSubmit}>
                등록
              </Button>
            </Grid>
          </Grid>
      </div>
    )
  }
}

const mapStateToProps = (state, ownProps) => ({
  isLogin: state.isLogin,
  ownProps
})

const mapDispatchToProps = dispatch => ({
  logout: () => dispatch(logout())
})


export default connect(mapStateToProps, mapDispatchToProps)(withStyles(useStyles, { withTheme: true })(withRouter(withSnackbar(Material))));