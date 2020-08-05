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
import AddressField from './addressfield'

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
  addressfield: {
    marginBottom: theme.spacing(2)
  }
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
    isShowWorkShops: true,
    isShowToolStores: true,
    isShowLeatherStores: true,
    isShowCommonStores: true,
    isShowMaterialStores: true,
    center: {lat: 37.5668260055, lng:126.9786567859},
    map: ''
  }

  showPosition = (position) => {
    this.setState({
      center: {
        lat: position.coords.latitude,
        lng: position.coords.longitude 
      }
    })
  }

  setCenter = (center) => {
    this.setState({center})
  }

  componentDidMount() {
    this.state.map = this.mapRef.instance
    navigator.geolocation.getCurrentPosition(this.showPosition)

    new window.naver.maps.Event.addListener(this.state.map, 'zoom_changed', () => {
      this.getStores()
      console.log(this.state.workshops.length)
      // this.updateMarkers(this.state.workshops)
      // this.updateMarkers(this.state.toolstores)
      // this.updateMarkers(this.state.leatherstores)
      // this.updateMarkers(this.state.commonstores)
      // this.updateMarkers(this.state.materialstores)
    });
  
    new window.naver.maps.Event.addListener(this.state.map, 'dragend', () => {
      this.getStores()
      console.log(this.state.workshops.length)
      // this.updateMarkers(this.state.workshops)
      // this.updateMarkers(this.state.toolstores)
      // this.updateMarkers(this.state.leatherstores)
      // this.updateMarkers(this.state.commonstores)
      // this.updateMarkers(this.state.materialstores)
    });

    new window.naver.maps.Event.addListener(this.state.map, 'idle', () => {
      this.getStores()
    });

    this.getStores()

    // window.naver.maps.Service.geocode({address: '조마루로 135'}, (status, response) => {
    //   if (status === window.naver.maps.Service.Status.ERROR) {
    //     return console.log('ERROR')
    //   }

    //   console.log(response)
    // })
    // this.setState({map: this.mapRef.instance})
  }

  initMarker = (store, icon, isShow, shopList) => {
    const markerOptions = {
      position: {lat: store.x, lng: store.y},
      title: store.name,
      icon: icon
    }

    let marker
    if(!this.isDucplication(markerOptions, shopList)) {
      if(isShow) {
        markerOptions.map = this.state.map
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
      if (store.title === markerOptions.title &&
          store.position.x === markerOptions.position.lng &&
          store.position.y === markerOptions.position.lat) {
        return true
      }
    }
    return false
  }

  // 마커를 카테고리에 따라서 나누기
  storeDivider = (stores) => {
    for(const store of stores) {
      if(store.category === 0) { // workshop
        const marker = this.initMarker(store, workshopMarkerIcon, this.state.isShowWorkShops, this.state.workshops)
        if(marker !== undefined) {
          this.state.workshops.push(marker)
        }
      } else if(store.category === 1) { // tool store
        const marker = this.initMarker(store, null, this.state.isShowToolStores, this.state.toolstores)
        if(marker !== undefined) {
          this.state.toolstores.push(marker)
        }
      } else if(store.category === 2) { // leather store
        const marker = this.initMarker(store, leatherStoreMarkerIcon, this.state.isShowLeatherStores, this.state.leatherstores)
        if(marker !== undefined) {
          this.state.leatherstores.push(marker)
        }
      } else if(store.category === 3) { // common store
        const marker = this.initMarker(store, commonStoreMarkerIcon, this.state.isShowCommonStores, this.state.commonstores)
        if(marker !== undefined) {
          this.state.commonstores.push(marker)
        }
      } else if(store.category === 4) { // material store
        const marker = this.initMarker(store, materialStoreMarkerIcon, this.state.isShowMaterialStores, this.state.materialstores)
        if(marker !== undefined) {
          this.state.materialstores.push(marker)
        }
      }
    }
  }

  getStores = () => {
    const bounds = this.state.map.getBounds()
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
        marker.setMap(this.state.map)
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
    const mapBounds = this.state.map.getBounds()
    for(const marker of markers) {
      if (mapBounds.hasLatLng(marker.position)) {
        if(marker.getMap()) {
          continue
        } else {
          marker.setMap(this.state.map)
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
        <div className={classes.addressfield}>
          <AddressField setCenter={this.setCenter}/>
        </div>
        <NaverMap
          naverRef={ref => { this.mapRef = ref }}
          className={classes.map}
          center={this.state.center}
          onCenterChanged={center => {
            this.setState({center})
          }}
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