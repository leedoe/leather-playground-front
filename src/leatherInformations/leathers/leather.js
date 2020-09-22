import React from 'react';
import { Paper, withStyles, Grid, Divider, TextField, Button, Select, InputLabel } from '@material-ui/core';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { withSnackbar } from 'notistack';
import Axios from 'axios';
import { logout } from '../../redux/actions'



const useStyles = theme => ({
  mainContainer: {
    padding: theme.spacing(2)
  },
  selectDiv: {
    marginTop: theme.spacing(2)
  }
});

class Leather extends React.Component {
  state = {
    tannerys: [],
    materials: [],
    tanningMethod: [[0, 'Vegetable'], [1, 'Chrome'], [2, 'Hybrid']],
    name: '',
    selectedMaterial: '',
    selectedTannery: '',
    selectedTanningMethod: '',
    explanation: '',
    image: '',
  }

  getTannerys = () => {
    Axios.get(`${process.env.REACT_APP_SERVERURL}/api/tannerys/`).then(response => {
      this.setState({tannerys: response.data})
    })
  }

  getMaterials = () => {
    Axios.get(`${process.env.REACT_APP_SERVERURL}/api/materials/`).then(response => {
      this.setState({materials: response.data})
    })
  }

  saveLeather = () => {
    const formData = new FormData()
    formData.append('image', this.state.image)
    formData.append('name', this.state.name)
    formData.append('tanning_method', this.state.selectedTanningMethod)
    formData.append('tannery', this.state.selectedTannery)
    formData.append('material', this.state.selectedMaterial)
    formData.append('explanation', this.state.explanation)

    const config = {
      headers: {
        Authorization: `JWT ${localStorage.getItem('token')}`,
        'Content-Type': 'multipart/form-data'
      }
    }

    Axios.post(
      `${process.env.REACT_APP_SERVERURL}/api/leathers/`,
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

  onClickSubmit = () => {
    this.saveLeather()
  }

  componentDidMount() {
    this.getTannerys()
    this.getMaterials()
  }

  render () {
    const { classes } = this.props;
    return (
      <div className={classes.mainContainer}>
        <Grid container spacing={2}>
          <Grid item sm={12} md={12}>
            <div>
              <label htmlFor='logo'>이미지</label>
              <input type='file' id='logo' accept='image/png, image/jpg' onChange={(e) => {this.setState({image: e.target.files[0]})}}/>
            </div>
            <div>
              <TextField
                fullWidth
                label="가죽 이름"
                required
                onChange={(e) => this.setState({name: e.target.value})}/>
            </div>
            <div className={classes.selectDiv}>
              <InputLabel htmlFor="tannery">테너리</InputLabel>
              <Select
                fullWidth
                // value={this.state.selectedTannery}
                defaultValue=''
                onChange={(e) => this.setState({selectedTannery: e.target.value})}
                inputProps={{
                  name: 'tannery',
                  id: 'tannery'
                }}
                >
                {this.state.tannerys.map(tannery => {
                  return <option key={tannery.id} value={tannery.id}>{tannery.name}</option>
                })}
              </Select>
            </div>
            <div className={classes.selectDiv}>
              {/* <TextField label="가죽재료" required onChange={this.onChanegeNationality}/> */}
              <InputLabel htmlFor="material">가죽재료</InputLabel>
              <Select
                fullWidth
                // value={this.state.selectedMaterial}
                defaultValue=''
                onChange={(e) => this.setState({selectedMaterial: e.target.value})}
                inputProps={{
                  name: 'material',
                  id: 'material'
                }}
                >
                {this.state.materials.map(material => {
                  return <option key={material.id} value={material.id}>{material.name}</option>
                })}
              </Select>
            </div>
            <div className={classes.selectDiv}>
              <InputLabel htmlFor="tanning">무두질 방법</InputLabel>
              <Select
                fullWidth
                // value={this.state.selectedTanningMethod}
                defaultValue=''
                onChange={(e) => this.setState({selectedTanningMethod: e.target.value})}
                inputProps={{
                  name: 'tanning',
                  id: 'tanning'
                }}
                >
                {this.state.tanningMethod.map(tanning => {
                  return <option key={tanning[0]} value={tanning[0]}>{tanning[1]}</option>
                })}
              </Select>
            </div>
          </Grid>
          <Grid item sm={12} md={12}>
            <TextField fullWidth multiline label="설명" onChange={(e) => {this.setState({explanation: e.target.value})}}/>
          </Grid>
        </Grid>
        <Grid container justify='flex-end' className={classes.selectDiv}>
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

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(useStyles, { withTheme: true })(withRouter(withSnackbar(Leather))));