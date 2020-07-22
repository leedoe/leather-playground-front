import React from 'react'
import { RenderAfterNavermapsLoaded, NaverMap, Marker } from 'react-naver-maps'
import Axios from 'axios'
import { Divider, withStyles, Paper, IconButton, Backdrop, CircularProgress } from '@material-ui/core'
import { withSnackbar } from 'notistack'
import { withRouter } from 'react-router-dom'
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
  },
  backdrop: {
    zIndex: theme.zIndex.drawer + 1,
    color: '#fff',
  }
});

class NMap extends React.Component {
  state = {
    stores: [],
    bounds: '',
    southWest: '',
    northEast: '',
    lngSpan: '',
    latSpan: '',
  }

  componentDidMount() {
    const bounds = this.mapRef.getBounds()
    const southWest = bounds.getSW()
    const northEast = bounds.getNE()
    const lngSpan = northEast.lng() - southWest.lng()
    const latSpan = northEast.lat() - southWest.lat()
    this.setState({
      bounds,
      southWest,
      northEast,
      lngSpan,
      latSpan,
    })

    // window.naver.maps.Event.addListener(this.mapRef.instance, 'idle', () => {
    //   this.updateMarkers(this.mapRef.instance, this.state.stores)
    // })

    Axios.get('http://127.0.0.1:8000/api/stores/').then((response) => {
      const markers = []
      for(const store of response.data) {
        const marker = new window.naver.maps.Marker({
          map: this.mapRef.instance,
          position: {lat: store.x, lng: store.y},
          title: store.name,
          
        })
          // <Marker
          //   title={store.name}
          //   key={store.id}
          //   position={{lat: store.x, lng: store.y}}
          //   onClick={() => {this.setState({currentStore: store,})}}/>
        window.naver.maps.Event.addListener(marker, 'click', () => {
          this.props.changeCurrentStore(store)
        })
        // marker.addListener('click', this.props.changeCurrentStore(store))
        markers.push(marker)
      }
      
      this.setState({stores: markers, nowLoading: false,})
    })
  }

  updateMarkers = () => {
    const mapBounds = this.mapRef.getBounds()
    for(const marker of this.state.stores) {
      // console.log(mapBounds.hasLatLng(marker.position))
      if (mapBounds.hasLatLng(marker.position)) {
        if(marker.getMap()) {
          return
        } else {
          marker.setMap(this.mapRef.instance)
        }
      } else {
        if(!marker.getMap()) {
          return
        } else {
          marker.setMap(null)
        }
      }
    }
  }

  render() {
    return (
      <NaverMap
        naverRef={ref => { this.mapRef = ref }}
        style={{
          width: '100%',
          height: '400px',
          }}
        defaultCenter={{ lat: 37.5668260055, lng: 126.9786567859 }}
        defaultZoom={15}>
      </NaverMap>
)
  }
}

export default withStyles(useStyles, { withTheme: true })(withSnackbar(withRouter(NMap)))