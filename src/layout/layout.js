import React from 'react';

import { Switch, Route } from 'react-router-dom';

import SideMenu from '../sidemenu/sidemenu';
import LeatherAppBar from '../appbar/appbar';
import { CssBaseline, withStyles } from '@material-ui/core';
import Board from '../board/board';
import PostDetail from '../postDetail/postDetail'

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
    mobileOpen: false
  }

  constructor(props) {
    super(props);
    this.handleDrawerToggle = this.handleDrawerToggle.bind(this);
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
        <SideMenu mobileOpen={this.state.mobileOpen} handleDrawerToggle={this.handleDrawerToggle}/>
        <main className={classes.content}>
          <div className={classes.toolbar}/>
          <Switch>
            <Route path='/map/'>
              <h1>MAP</h1>
            </Route>
            <Route exact path='/posts/:pk'>
              <PostDetail/>
            </Route>
            <Route exact path='/posts' component={Board}/>
          </Switch>
        </main>
      </div>
    )
  }
}

export default withStyles(useStyles, {withTheme: true})(Layout);