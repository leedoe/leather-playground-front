import React from 'react';

import {Link, withRouter} from 'react-router-dom'
import List from '@material-ui/core/List';
import { ListItemText, ListItem, withStyles, Divider, Hidden, Drawer, Button, Menu, MenuItem, Popper, ListItemIcon, Collapse } from '@material-ui/core';
import AccountCircleIcon from '@material-ui/icons/AccountCircle';
import CommentIcon from '@material-ui/icons/Comment';
import ExpandLess from '@material-ui/icons/ExpandLess';
import ExpandMore from '@material-ui/icons/ExpandMore';
import MapIcon from '@material-ui/icons/Map';
import FindInPageIcon from '@material-ui/icons/FindInPage';

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
  }
});

class SideMenu extends React.Component {
  state = {
    loginOpen: false
  }

  handleCloseWithLogout = () => {
    this.handleLoginList()
    if(this.props.mobileOpen === true) {
      this.props.handleDrawerToggle()
    }
    this.props.logout()
  }

  clickProfile = () => {
    this.props.history.push(`/users/${this.props.user.username}`)
    this.handleLoginList()
    if(this.props.mobileOpen === true){
      this.props.handleDrawerToggle()
    }
  }

  handleLoginList = () => {
    this.setState({loginOpen: !this.state.loginOpen})
  }

  render() {
    const { classes } = this.props;
    const container = this.window !== undefined ? () => window().document.body : undefined;
    const drawer = (
      <div>
        <div className={classes.toolbar}/>
        <Divider/>
        { this.props.isLogin === true ?
        <List>
          <ListItem button onClick={this.handleLoginList}>
            <ListItemIcon>
              <AccountCircleIcon/>
            </ListItemIcon>
            <ListItemText primary={`${this.props.user.name}`}/>
            {this.state.loginOpen ? <ExpandLess /> : <ExpandMore />}
          </ListItem>
          <Collapse in={this.state.loginOpen} timeout='auto' unmountOnExit>
            <List component='div'>
              <ListItem button onClick={this.clickProfile}>
                <ListItemText primary={`Profile`}/>
              </ListItem>
              <ListItem button onClick={this.handleCloseWithLogout}>
                <ListItemText primary={`Logout`}/>
              </ListItem>
            </List>
          </Collapse>
        </List>
        :
        <List>
          <ListItem button component={Link} to={`/login`}>
            <ListItemText primary={`로그인`}/>
          </ListItem>
        </List>
        // <Button
        //     component={Link}
        //     to={`/login`}
        //     variant="contained" 
        //     color="primary">
        //   로그인
        // </Button>
        }
        <Divider/>
        <List>
          <Hidden smUp implementation="css">
            {/* 모바일 화면 */}
            <ListItem button component={Link} to={`/posts?page=1`}  onClick={this.props.handleDrawerToggle}>
              <ListItemIcon>
                <CommentIcon/>
              </ListItemIcon>
              <ListItemText primary={`게시판`}/>
            </ListItem>
            <ListItem button component={Link} to={`/map`} onClick={this.props.handleDrawerToggle}>
              <ListItemIcon>
                <MapIcon/>
              </ListItemIcon>
              <ListItemText primary={`지도`}/>
            </ListItem>
            <ListItem button component={Link} to={`/meta`} onClick={this.props.handleDrawerToggle}>
              <ListItemIcon>
                <FindInPageIcon/>
              </ListItemIcon>
              <ListItemText primary={`쇼핑몰검색`}/>
            </ListItem>
          </Hidden>
          <Hidden xsDown implementation="css">
            <ListItem button component={Link} to={`/posts?page=1`}>
              <ListItemIcon>
                <CommentIcon/>
              </ListItemIcon>
              <ListItemText primary={`게시판`}/>
            </ListItem>
            <ListItem button component={Link} to={`/map`}>
              <ListItemIcon>
                <MapIcon/>
              </ListItemIcon>
              <ListItemText primary={`지도`}/>
            </ListItem>
            <ListItem button component={Link} to={`/meta/`}>
              <ListItemIcon>
                <FindInPageIcon/>
              </ListItemIcon>
              <ListItemText primary={`쇼핑몰검색`}/>
            </ListItem>
          </Hidden>
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

export default connect(mapStateToProps, mapDispatchToProps )(withStyles(useStyles, { withTheme: true })(withRouter(SideMenu)));