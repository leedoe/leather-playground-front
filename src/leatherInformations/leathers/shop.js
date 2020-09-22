import React from 'react';
import { Paper, withStyles, Grid, Divider, TextField, Button, Select, InputLabel, Typography, InputAdornment } from '@material-ui/core';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { withSnackbar } from 'notistack';
import Axios from 'axios';
import { logout } from '../../redux/actions'



const useStyles = theme => ({
  mainContainer: {
    padding: theme.spacing(2)
  },
  leatherDiv: {
    marginTop: theme.spacing(2)
  },
  selectDiv: {
    marginTop: theme.spacing(2)
  }
});

class Shop extends React.Component {
  state = {
    leather: {},
    stores: [],
    image: '',
    store: '',
    price: '',
    sellingPageUrl: '',
    note: ''
  }

  getLeatherShop = () => {
    Axios.get(`${process.env.REACT_APP_SERVERURL}/api/stores/?category=2`).then((response) => {
      this.setState({stores: response.data,})
    }).catch((e) => {
      this.props.enqueueSnackbar('서버와 통신이 원활하지 않습니다.', {variant: 'error'})
    });
  }

  getLeather = () => {
    const leatherPk = this.props.match.params.pk
    Axios.get(`${process.env.REACT_APP_SERVERURL}/api/leathers/${leatherPk}`).then((response) => {
      this.setState({leather: response.data,})
    }).catch((e) => {
      this.props.enqueueSnackbar('서버와 통신이 원활하지 않습니다.', {variant: 'error'})
    });
  }

  saveShop = () => {
    const formData = new FormData()
    formData.append('image', this.state.image)
    formData.append('leather', this.state.leather.pk)
    formData.append('store', this.state.store)
    formData.append('price', this.state.price)
    formData.append('sellingPageUrl', this.state.sellingPageUrl)
    formData.append('note', this.state.note)

    const config = {
      headers: {
        Authorization: `JWT ${localStorage.getItem('token')}`,
        'Content-Type': 'multipart/form-data'
      }
    }

    Axios.post(
      `${process.env.REACT_APP_SERVERURL}/api/leather-detail/`,
      formData,
      config).then(response => {
      this.props.enqueueSnackbar('성공적으로 저장되었습니다.', {variant: 'success'})
      this.props.history.replace('/leathers/')
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
        this.props.enqueueSnackbar('입력값을 확인해주세요.', {variant: 'error'})
      }
    })
  }


  componentDidMount() {
    this.getLeather()
    this.getLeatherShop()
  }

  render () {
    console.log(this.state.leather)
    const { classes } = this.props;
    return (
      <div className={classes.mainContainer}>
        <Grid container spacing={2}>
          <Grid item sm={12} md={12}>
            <div>
              <label htmlFor='logo'>이미지</label>
              <input type='file' id='logo' accept='image/png, image/jpg' onChange={(e) => {this.setState({image: e.target.files[0]})}}/>
            </div>
            <div className={classes.leatherDiv}>
              <Typography>
                가죽 이름: {this.state.leather.name}
              </Typography>
            </div>
            <div className={classes.selectDiv}>
              <InputLabel htmlFor="tannery">Shop</InputLabel>
              <Select
                fullWidth
                inputProps={{
                  name: 'tannery',
                  id: 'tannery'
                }}
                onChange={e => this.setState({store: e.target.value})}
                >
                {this.state.stores.map(store => {
                  return <option key={store.id} value={store.id}>{store.name}</option>
                })}
              </Select>
            </div>
            <div>
              <TextField
                fullWidth
                label="가격"
                helperText="평당 가격으로 입력해주세요"
                InputProps={{
                  endAdornment: <InputAdornment position="end">원</InputAdornment>
                }}
                onChange={e => this.setState({price: e.target.value})}
                required/>
            </div>
            <div>
              <TextField
                fullWidth
                label="판매 페이지/정보 URL"
                onChange={e => this.setState({sellingPageUrl: e.target.value})}
                required/>
            </div>
          </Grid>
          <Grid item sm={12} md={12}>
            <TextField fullWidth multiline label="설명" onChange={(e) => {this.setState({note: e.target.value})}}/>
          </Grid>
        </Grid>
        <Grid container justify='flex-end' className={classes.selectDiv}>
            <Grid item>
              <Button
                className={classes.submit}
                variant="contained"
                color='primary'
                onClick={this.saveShop}>
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

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(useStyles, { withTheme: true })(withRouter(withSnackbar(Shop))));