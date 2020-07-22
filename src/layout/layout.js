import React from 'react';

import { Switch, Route } from 'react-router-dom';

import SideMenu from '../sidemenu/sidemenu';
import LeatherAppBar from '../appbar/appbar';
import { CssBaseline, withStyles } from '@material-ui/core';
import Posts from '../posts/posts';
import PostDetail from '../postDetail/postDetail'
import LoginPage from '../loginPage/loginPage'
import Post from '../post/post'
import RegisterUser from '../registerUser/registerUser';
import LNaverMap from '../map/naverMap';
import UserInfo from '../userInfo/userInfo';

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
});

class Layout extends React.Component {
  state = {
    left: false,
    mobileOpen: false,
    isLoggedIn: false,
    user: {}
  }

  constructor(props) {
    super(props);
    this.login = this.login.bind(this)
    this.setUserData = this.setUserData.bind(this)
    this.logout = this.logout.bind(this)
  }

  componentDidMount() {
    const user = JSON.parse(localStorage.getItem('user'))
    if(user !== null) {
      this.setState({isLoggedIn: true})
      this.setState({user})
    }
  }

  login() {
    this.setState({isLoggedIn: true})
  }

  logout() {
    this.setState({isLoggedIn: false})
    this.setState({user: {}})
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  setUserData(user) {
    this.setState({user})
  }

  handleDrawerToggle = () => {
    this.setState({mobileOpen: !this.state.mobileOpen});
  }

  render() {
    const { classes } = this.props;

    return (
      <div className={classes.root}>
        <CssBaseline/>
        <LeatherAppBar handleDrawerToggle={this.handleDrawerToggle}/>
        <SideMenu
          mobileOpen={this.state.mobileOpen}
          handleDrawerToggle={this.handleDrawerToggle}
          isLoggedIn={this.state.isLoggedIn}
          logout={this.logout}
          user={this.state.user}/>
        <main className={classes.content}>
          <div className={classes.toolbar}/>
          <Switch>
            <Route path='/map/'>
              <LNaverMap/>
            </Route>
            <Route exact path='/post/'>
              <Post user={this.state.user}/>
            </Route>
            <Route exact path='/post/:pk'>
              <Post
                user={this.state.user}/>
            </Route>
            <Route exact path='/posts/:pk'>
              <PostDetail user={this.state.user}/>
            </Route>
            <Route exact path='/posts/'>
              <Posts isLoggedIn={this.state.isLoggedIn}/>
            </Route>
            <Route exact path='/login/'>
              <LoginPage login={this.login} setUserData={this.setUserData}/>
            </Route>
            <Route path='/users/register/'>
              <RegisterUser setUserData={this.setUserData}/>
            </Route>
            <Route path='/users/'>
              <UserInfo/>
            </Route>
          </Switch>
        </main>
      </div>
    )
  }
}

export default withStyles(useStyles, {withTheme: true})(Layout);