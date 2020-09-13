import React from 'react'
import { RenderAfterNavermapsLoaded } from 'react-naver-maps'
import { Divider, withStyles, Paper, IconButton, Backdrop, CircularProgress } from '@material-ui/core'
import { withSnackbar } from 'notistack'
import { withRouter } from 'react-router-dom'
import HomeIcon from '@material-ui/icons/Home';
import InstagramIcon from '@material-ui/icons/Instagram';
import NMap from './map'

import naverIcon from '../img/img_naver_share_07.png'

const useStyles = theme => ({
  paper: {
    padding: theme.spacing(2)
  },
  divider: {
    marginTop: theme.spacing(2),
    // marginBottom: theme.spacing(3)
  },
  backdrop: {
    zIndex: theme.zIndex.drawer + 1,
    color: '#fff',
  }
});

class LNaverMap extends React.Component {
  state = {
    stores: [],
    currentStore: {},
    nowLoading: true,
    naverMapRef: '',
  }

  changeCurrentStore = (store) => {
    this.setState({currentStore: store,})
  }

  loadingControl = (bool) => {
    this.setState({nowLoading: bool})
  }

  render() {
    const {classes} = this.props
    return (
      <Paper className={classes.paper}>
        <Backdrop className={classes.backdrop} open={this.state.nowLoading}>
          <CircularProgress color="inherit" />
        </Backdrop>
        <div>
          <RenderAfterNavermapsLoaded
              ncpClientId={`jjfpybsl0w`}
              error={<p>Maps Load Error</p>}
              loading={<p>Maps Loading...</p>}>
            <NMap
              changeCurrentStore={this.changeCurrentStore}
              loadingControl={this.loadingControl}/>
          </RenderAfterNavermapsLoaded>
        </div>
        <Divider className={classes.divider}/>
        <div>
          {Object.keys(this.state.currentStore).length === 0 ? '' :
          <div>
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
          </div>
          }
        </div>
      </Paper>
    )
  }
}

export default withStyles(useStyles, { withTheme: true })(withSnackbar(withRouter(LNaverMap)))