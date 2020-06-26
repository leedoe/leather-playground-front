import React from 'react';

import {Link} from 'react-router-dom'
import List from '@material-ui/core/List';
import { ListItemText, ListItem, withStyles, Divider, Hidden, Drawer } from '@material-ui/core';

// class SideMenu extends React.Component {
//   render () {
//     return (
//       <nav>
//         <div>
//           <Link to='/'>HOME</Link>
//         </div>
//         <div>
//           <Link to='/board'>BOARD</Link>
//         </div>
//         <div>
//           <Link to='/map'>MAP</Link>
//         </div>
//       </nav>
//     )
//   }
// }


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

class SideMenu extends React.Component {
  render() {
    const { classes } = this.props;
    const container = this.window !== undefined ? () => window().document.body : undefined;
    const drawer = (
      <div>
        <div className={classes.toolbar}/>
        <Divider/>
        <List>
          <Link to='/board?page=1'>
            <ListItem button>
              <ListItemText primary={`게시판`}/>
            </ListItem>
          </Link>
          <Link to='/map'>
            <ListItem button key={`지도`}>
              <ListItemText primary={`지도`}/>
            </ListItem>
          </Link>
        </List>
        <Divider/>
        <List>
        </List>
      </div>
    );

    return (
      <div className={classes.root}>
        <nav className={classes.drawer} aria-label='mailbox folders'>
          <Hidden smUp implementation="css">
            <Drawer
              container={container}
              variant="temporary"
              anchor={classes.direction === 'rtl' ? 'right' : 'left'}
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


export default withStyles(useStyles, { withTheme: true })(SideMenu);