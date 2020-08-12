import React from 'react';

import {Link} from 'react-router-dom'
import List from '@material-ui/core/List';
import { ListItemText, ListItem, withStyles, Divider, Hidden, Drawer, Button, Menu, MenuItem } from '@material-ui/core';
import { connect } from 'react-redux'
import { logout } from '../redux/actions';


const drawerWidth = 240;
const useStyles = theme => ({
  root: {
    display: 'flex',
  },
  drawer: {
    [theme.breakpoints.up('sm')]: {
      width: drawerWidth,
      flexShrink: 0,
    },
  },
  appBar: {
    [theme.breakpoints.up('sm')]: {
      width: `calc(100% - ${drawerWidth}px)`,
      marginLeft: drawerWidth,
    },
  },
  menuButton: {
    marginRight: theme.spacing(2),
    [theme.breakpoints.up('sm')]: {
      display: 'none',
    },
  },
  // necessary for content to be below app bar
  toolbar: theme.mixins.toolbar,
  drawerPaper: {
    width: drawerWidth,
  },
  content: {
    flexGrow: 1,
    padding: theme.spacing(3),
  },
  avaterdiv: {
    padding: theme.spacing(2)
  },
  avater: {
    display: "inline-block",
  }
});

class SideMenu extends React.Component {
  state = {
    anchorEl: null,
    anchorMain: null
  }

  constructor(props) {
    super(props)
    this.handleClick = this.handleClick.bind(this)
    this.handleClose = this.handleClose.bind(this)
    this.handleCloseWithLogout = this.handleCloseWithLogout.bind(this)
  }

  handleClick(event) {
    this.setState({anchorEl: event.currentTarget});
  };

  handleClose() {
    this.setState({anchorEl: null});
  };

  handleCloseWithLogout() {
    this.setState({anchorEl: null})
    // this.props.logout()
    this.props.logout()
  }

  render() {
    const { classes } = this.props;
    const container = this.window !== undefined ? () => window().document.body : undefined;
    const drawer = (
      <div>
        <div className={classes.toolbar}/>
        
        <Divider/>
        <div className={classes.avaterdiv}>
          { this.props.isLogin === true ?
          <div>
            <Button
              aria-controls="simple-menu"
              aria-haspopup="true"
              onClick={this.handleClick}>
              {this.props.user.name}
            </Button>
            <Menu
              id="simple-menu"
              anchorEl={this.state.anchorEl}
              keepMounted
              open={Boolean(this.state.anchorEl)}
              onClose={this.handleClose}>
              <MenuItem component={Link} to={`/users/${this.props.user.username}`} onClick={this.handleClose}>Profile</MenuItem>
              <MenuItem onClick={this.handleCloseWithLogout}>Logout</MenuItem>
            </Menu>
          </div>  
          :
          <Button
              component={Link}
              to={`/login`}
              variant="contained" 
              color="secondary">
              
            로그인
          </Button>
          }
        </div>
        <Divider/>
        <List>
          {this.props.mobileOpen === true ?
          <ListItem button component={Link} to={`/posts?page=1`} onClick={this.props.handleDrawerToggle}>
            <ListItemText primary={`게시판`}/>
          </ListItem>
          :
          <ListItem button component={Link} to={`/posts?page=1`}>
            <ListItemText primary={`게시판`}/>
          </ListItem>
          }
          {this.props.mobileOpen === true ?
          <ListItem button component={Link} to={`/map`} onClick={this.props.handleDrawerToggle}>
            <ListItemText primary={`지도`}/>
          </ListItem>
          :
          <ListItem button component={Link} to={`/map`}>
            <ListItemText primary={`지도`}/>
          </ListItem>
          }
          {this.props.mobileOpen === true ?
          <ListItem button component={Link} to={`/meta/`} onClick={this.props.handleDrawerToggle}>
            <ListItemText primary={`쇼핑몰검색`}/>
          </ListItem>
          :
          <ListItem button component={Link} to={`/meta`}>
            <ListItemText primary={`쇼핑몰검색`}/>
          </ListItem>
          }
          
        </List>
        <Divider/>
        <List>
        </List>
      </div>
    );

    return (
      <div className={classes.root}>
        <nav className={classes.drawer}>
          <Hidden smUp implementation="css">
            <Drawer
              container={container}
              variant="temporary"
              anchor={`left`}
              open={this.props.mobileOpen}
              onClose={this.props.handleDrawerToggle}
              classes={{
                paper: classes.drawerPaper,
              }}
              ModalProps={{
                keepMounted: true, // Better open performance on mobile.
              }}
            >
              {drawer}
            </Drawer>
          </Hidden>
          <Hidden xsDown implementation="css">
            <Drawer
              classes={{
                paper: classes.drawerPaper,
              }}
              variant="permanent"
              open
            >
              {drawer}
            </Drawer>
          </Hidden>
        </nav>
      </div>
    )
  }
}

const mapDispatchToProps = dispatch => ({
  logout: () => dispatch(logout())
})

const mapStateToProps = (state, ownProps) => ({
  isLogin: state.isLogin,
  user: state.user,
  ownProps
})

export default connect(mapStateToProps, mapDispatchToProps )(withStyles(useStyles, { withTheme: true })(SideMenu));