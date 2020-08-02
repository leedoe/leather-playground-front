import React from 'react'
import { NaverMap } from 'react-naver-maps'
import Axios from 'axios'
import { withStyles, FormGroup, FormControlLabel, Switch } from '@material-ui/core'
import { withSnackbar } from 'notistack'
import { withRouter } from 'react-router-dom'

import workshopMarkerIcon from '../img/marker-default.png'
import leatherStoreMarkerIcon from '../img/marker-leatherstore.png'
import materialStoreMarkerIcon from '../img/marker-materialstore.png'
import commonStoreMarkerIcon from '../img/marker-commonStore.png'

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
  },
  map: {
    width: '100%',
    height: '400px',
    marginBottom: theme.spacing(3)
  },
});

const WorkshopSwitch = withStyles({
  switchBase: {
    '&$checked': {
      color: '#2f96fc',
    },
    '&$checked + $track': {
      backgroundColor: '#2f96fc',
    },
  },
  checked: {},
  track: {}
})(Switch)

const LeatherStoreSwitch = withStyles({
  switchBase: {
    '&$checked': {
      color: '#5b4724',
    },
    '&$checked + $track': {
      backgroundColor: '#5b4724',
    },
  },
  checked: {},
  track: {}
})(Switch)


const CommonStoreSwitch = withStyles({
  switchBase: {
    '&$checked': {
      color: '#29ae26',
    },
    '&$checked + $track': {
      backgroundColor: '#29ae26',
    },
  },
  checked: {},
  track: {},
})(Switch)

const MaterialStoreSwitch = withStyles({
  switchBase: {
    '&$checked': {
      color: '#cabe3d',
    },
    '&$checked + $track': {
      backgroundColor: '#cabe3d',
    },
  },
  checked: {},
  track: {},
})(Switch)

class NMap extends React.Component {
  state = {
    workshops: [],
    toolstores: [],
    leatherstores: [],
    commonstores: [],
    materialstores: [],
    bounds: '',
    southWest: '',
    northEast: '',
    lngSpan: '',
    latSpan: '',
    isShowWorkShops: true,
    isShowToolStores: true,
    isShowLeatherStores: true,
    isShowCommonStores: true,
    isShowMaterialStores: true,
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

    new window.naver.maps.Event.addListener(this.mapRef.instance, 'zoom_changed', () => {
      this.getStores()
    });
  
    new window.naver.maps.Event.addListener(this.mapRef.instance, 'dragend', () => {
      this.getStores()
    });

    this.getStores()
  }

  initMarker = (store, icon, isShow) => {
    const markerOptions = {
      position: {lat: store.x, lng: store.y},
      title: store.name,
      icon: icon
    }

    let marker
    if(!this.isDucplication(markerOptions, this.state.workshops)) {
      if(isShow) {
        markerOptions.map = this.mapRef.instance
      }
      marker = new window.naver.maps.Marker(markerOptions)

      window.naver.maps.Event.addListener(marker, 'click', () => {
        this.props.changeCurrentStore(store)
      })
    }
    
    return marker
  }

  isDucplication = (markerOptions, stores) => {
    for (const store of stores) {
      if (store.name === markerOptions.title &&
          store.position.x === markerOptions.position.lat &&
          store.position.y === markerOptions.position.lng) {
        return true
      }
    }
    return false
  }

  storeDivider = (stores) => {
    for(const store of stores) {
      if(store.category === 0) { // workshop
        const marker = this.initMarker(store, workshopMarkerIcon, this.state.isShowWorkShops)
        if(marker !== undefined) {
          this.state.workshops.push(marker)
        }
      } else if(store.category === 1) { // tool store
        const marker = this.initMarker(store, null, this.state.isShowToolStores)
        if(marker !== undefined) {
          this.state.toolstores.push(marker)
        }
      } else if(store.category === 2) { // leather store
        const marker = this.initMarker(store, leatherStoreMarkerIcon, this.state.isShowLeatherStores)
        if(marker !== undefined) {
          this.state.leatherstores.push(marker)
        }
      } else if(store.category === 3) { // common store
        const marker = this.initMarker(store, commonStoreMarkerIcon, this.state.isShowCommonStores)
        if(marker !== undefined) {
          this.state.commonstores.push(marker)
        }
      } else if(store.category === 4) { // material store
        const marker = this.initMarker(store, materialStoreMarkerIcon, this.state.isShowMaterialStores)
        if(marker !== undefined) {
          this.state.materialstores.push(marker)
        }
      }
    }
  }

  getStores = () => {
    const bounds = this.mapRef.getBounds()
    const southWest = bounds.getSW()
    const northEast = bounds.getNE()
    this.props.loadingControl(true)
    Axios.get(`${process.env.REACT_APP_SERVERURL}/api/stores/?x__gte=${southWest.lat()}&x__lte=${northEast.lat()}&y__gte=${southWest.lng()}&y__lte=${northEast.lng()}`).then(response => {
      const stores = response.data
      this.storeDivider(stores)
      this.props.loadingControl(false)
    })
  }

  showMarkers = (markers) => {
    for(const marker of markers) {
      if(!marker.getMap()) {
        marker.setMap(this.mapRef.instance)
      } 
    }
  }

  hideMarkers = (markers) => {
    for(const marker of markers) {
      if(marker.getMap()) {
        marker.setMap(null)
      } 
    }
  }

  

  updateMarkers = (markers) => {
    const mapBounds = this.mapRef.getBounds()
    for(const marker of markers) {
      if (mapBounds.hasLatLng(marker.position)) {
        if(marker.getMap()) {
          continue
        } else {
          marker.setMap(this.mapRef.instance)
        }
      } else {
        if(!marker.getMap()) {
          continue
        } else {
          marker.setMap(null)
        }
      }
    }
  }

  switchMarkersVisible = (isShow, stores, key) => {
    if(isShow) {
      this.hideMarkers(stores)
    } else {
      this.showMarkers(stores)
    }
    this.setState({[key]: !isShow})
    // console.log({key: !isShow})
  }

  render() {
    const {classes} = this.props
    return (
      <div>
        <NaverMap
          naverRef={ref => { this.mapRef = ref }}
          className={classes.map}
          defaultCenter={{ lat: 37.5668260055, lng: 126.9786567859 }}
          defaultZoom={15}>
        </NaverMap>
        <FormGroup row>
          <FormControlLabel
            control={
              <WorkshopSwitch
                checked={this.state.isShowWorkShops}
                onChange={() => {
                  this.switchMarkersVisible(this.state.isShowWorkShops, this.state.workshops, 'isShowWorkShops')
                }}
              />
            }
            label='공방'
          />
          <FormControlLabel
            control={
              <CommonStoreSwitch
                checked={this.state.isShowCommonStores}
                onChange={() => {
                  this.switchMarkersVisible(this.state.isShowCommonStores, this.state.commonstores, 'isShowCommonStores')
                }}
                />
            }
            label='종합'
          />
          <FormControlLabel
            control={
              <LeatherStoreSwitch
                checked={this.state.isShowLeatherStores}
                onChange={() => {
                  this.switchMarkersVisible(this.state.isShowLeatherStores, this.state.leatherstores, 'isShowLeatherStores')
                }}
                />
            }
            label='가죽'
          />
          <FormControlLabel
            control={
              <MaterialStoreSwitch
                checked={this.state.isShowMaterialStores}
                onChange={() => {
                  this.switchMarkersVisible(this.state.isShowMaterialStores, this.state.materialstores, 'isShowMaterialStores')
                }}
                />
            }
            label='부자재'
          />
        </FormGroup>
      </div>  
    )
  }
}

export default withStyles(useStyles, { withTheme: true })(withSnackbar(withRouter(NMap)))