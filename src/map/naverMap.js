import React from 'react'
import { RenderAfterNavermapsLoaded, NaverMap, Marker } from 'react-naver-maps'
import Axios from 'axios'
import { Divider, withStyles, Paper, Grid, IconButton } from '@material-ui/core'
import { withSnackbar } from 'notistack'
import { withRouter, Link } from 'react-router-dom'
import HomeIcon from '@material-ui/icons/Home';
import InstagramIcon from '@material-ui/icons/Instagram';

import naverIcon from '../img/img_naver_share_07.png'

const useStyles = theme => ({
  divider: {
    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(3)
  },
  storePaper: {
    padding: theme.spacing(3)
  }
});

class LNaverMap extends React.Component {
  state = {
    stores: [],
    currentStore: {}
  }

  componentDidMount() {
    Axios.get('http://127.0.0.1:8000/api/stores/').then((response) => {
      this.setState({stores: response.data,})
    })
  }

  render() {
    const {classes} = this.props
    return (
      <div>
        <div>
          <RenderAfterNavermapsLoaded
              ncpClientId={`jjfpybsl0w`}
              error={<p>Maps Load Error</p>}
              loading={<p>Maps Loading...</p>}>
            <NaverMap
                style={{
                    width: '100%',
                    height: '400px',
                  }}
                  defaultCenter={{ lat: 37.5668260055, lng: 126.9786567859 }}
                  defaultZoom={15}>
              {this.state.stores.map(store => {
                // console.log(store)
                const latlng = store.latlng.split(',')
                return (
                  <Marker
                    title={store.name}
                    key={store.id}
                    position={{lat: latlng[0], lng: latlng[1]}}
                    onClick={() => {this.setState({currentStore: store,})}}/>
                )
              })}
            </NaverMap>
          </RenderAfterNavermapsLoaded>
        </div>
        <Divider className={classes.divider}/>
        <div>
          <Paper className={classes.storePaper}>
              <span>
                {this.state.currentStore.name}
              </span>
              { this.state.currentStore.homepage != null ?
              <IconButton
                  component='a'
                  href={this.state.currentStore.homepage}
                  target="_blank">
                <HomeIcon/>
              </IconButton>
                :
              ''
              }
              { this.state.currentStore.instagram != null ?
              <IconButton
                  component='a'
                  href={this.state.currentStore.instagram}
                  target="_blank">
                <InstagramIcon/>
              </IconButton>
                :
              ''
              }
              { this.state.currentStore.blog != null ?
              <IconButton
                  component='a'
                  href={this.state.currentStore.blog}
                  target="_blank">
                <img
                  alt={`NaverBlog`}
                  src={naverIcon}
                  width='24'
                  height='24'/>
              </IconButton>
                :
              ''
              }
              <br/>
              { this.state.currentStore.address != null ?
              this.state.currentStore.address
                :
              ''
              }
          </Paper>
        </div>
      </div>
    )
  }
}

export default withStyles(useStyles, { withTheme: true })(withSnackbar(withRouter(LNaverMap)))