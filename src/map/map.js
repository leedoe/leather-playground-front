import React from 'react'
import { NaverMap } from 'react-naver-maps'
import Axios from 'axios'
import { withStyles } from '@material-ui/core'
import { withSnackbar } from 'notistack'
import { withRouter } from 'react-router-dom'

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
  }
});

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
      if(this.state.isShowWorkShops) {
        this.updateMarkers(this.state.workshops);
      }
      
      if(this.state.isShowToolStores) {
        this.updateMarkers(this.state.toolstores);
      }
      
      if(this.state.isShowLeatherStores) {
        this.updateMarkers(this.state.leatherstores);
      }
      
      if(this.state.isShowCommonStores) {
        this.updateMarkers(this.state.commonstores);
      }

      if(this.state.isShowMaterialStores) {
        this.updateMarkers(this.state.materialstores)
      }
    });
  
    new window.naver.maps.Event.addListener(this.mapRef.instance, 'dragend', () => {
      if(this.state.isShowWorkShops) {
        this.updateMarkers(this.state.workshops);
      }
      
      if(this.state.isShowToolStores) {
        this.updateMarkers(this.state.toolstores);
      }
      
      if(this.state.isShowLeatherStores) {
        this.updateMarkers(this.state.leatherstores);
      }
      
      if(this.state.isShowCommonStores) {
        this.updateMarkers(this.state.commonstores);
      }

      if(this.state.isShowMaterialStores) {
        this.updateMarkers(this.state.materialstores)
      }
    });

    Axios.get(`${process.env.REACT_APP_SERVERURL}/api/stores/`).then((response) => {
      const markers = []
      for(const store of response.data) {
        if(store.category === 0) {
          const marker = new window.naver.maps.Marker({
            map: this.mapRef.instance,
            position: {lat: store.x, lng: store.y},
            title: store.name,
          })
  
          window.naver.maps.Event.addListener(marker, 'click', () => {
            this.props.changeCurrentStore(store)
          })
          
          this.state.workshops.push(marker)
        } else if (store.category === 1) { // toolstore

        } else if (store.category === 2) { // leatherstore
          const marker = new window.naver.maps.Marker({
            map: this.mapRef.instance,
            position: {lat: store.x, lng: store.y},
            title: store.name,
            icon: leatherStoreMarkerIcon
          })
  
          window.naver.maps.Event.addListener(marker, 'click', () => {
            this.props.changeCurrentStore(store)
          })
          
          this.state.leatherstores.push(marker)
        } else if(store.category === 3) { // commonstore
          const marker = new window.naver.maps.Marker({
            map: this.mapRef.instance,
            position: {lat: store.x, lng: store.y},
            title: store.name,
            icon: commonStoreMarkerIcon
          })
  
          window.naver.maps.Event.addListener(marker, 'click', () => {
            this.props.changeCurrentStore(store)
          })
          
          this.state.commonstores.push(marker)
        } else if (store.category === 4) { // materialstore
          const marker = new window.naver.maps.Marker({
            map: this.mapRef.instance,
            position: {lat: store.x, lng: store.y},
            title: store.name,
            icon: materialStoreMarkerIcon
          })
  
          window.naver.maps.Event.addListener(marker, 'click', () => {
            this.props.changeCurrentStore(store)
          })
          
          this.state.materialstores.push(marker)
        }
        
      }
      
      this.setState({nowLoading: false,})
    })
  }

  showOnlyWorkshop = () => {
    const mapBounds = this.mapRef.getBounds()
    for(const workshop of this.state.workshops) {
      if(workshop.getMap()) {
        continue
      } else {
        workshop.setMap(this.mapRef.instance)
      }
    }

    for(const toolstore of this.state.toolstores) {

    }
  }

  showMarkers = (markers) => {
    const mapBounds = this.mapRef.getBounds()
    for(const marker of markers) {
      if(marker.getMap()) {
        continue
      } else {
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