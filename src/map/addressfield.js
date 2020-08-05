import React from 'react'
import { TextField, Grid, withStyles, List, ListItem, ListItemText } from '@material-ui/core'
import SearchIcon from '@material-ui/icons/Search';
import Axios from 'axios'

const useStyles = theme => ({
  results: {
    position: 'absolute',
    zIndex: '10',
    backgroundColor: 'red'
  }
});

class AddressField extends React.Component {
  state = {
    keyword: '',
    addresses: []
  }

  getAddress = () => {
    const config = {
      params: {
        query: this.state.keyword
      }
    }

    Axios.get(`${process.env.REACT_APP_SERVERURL}/api/address/`, config).then(response => {
      console.log(response)
      if(response.data.status === 'OK') {
        const addresses = []
        for(const address of response.data.addresses) {
          addresses.push({
            addressKorean: address.roadAddress,
            center: {
              lat: address.y,
              lng: address.x
            }
          })
        }
        console.log(addresses)
        this.setState({addresses})
      } else {
        this.setState({addresses: []})
      }
    })
  }

  keyPress = (e) => {
    if(e.key === 'Enter'){
      this.getAddress()
    }
  }

  render() {
    const {classes} = this.props
    return (
      <div>
        <Grid container spacing={1} alignItems="flex-end">
          <Grid item>
            <SearchIcon />
          </Grid>
          <Grid item>
            <TextField
              label='주소검색'
              onKeyPress={this.keyPress}
              onChange={(e) => this.setState({keyword: e.target.value})}/>
          </Grid>
        </Grid>
        <div
          className={classes.results}>
          <List>
            {this.state.addresses.map(address => (
              <ListItem
                key={address.addressKorean}
                onClick={() => {
                  this.props.setCenter(address.center)
                  this.setState({addresses: []})
                }}>
                <ListItemText>
                {address.addressKorean}
                </ListItemText>
              </ListItem>
            ))}
          </List>
        </div>
      </div>
    )
  }
}

export default withStyles(useStyles, { withTheme: true })(AddressField)