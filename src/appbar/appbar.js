import React from 'react';

import { AppBar, CssBaseline, Toolbar, IconButton, Typography, withStyles } from '@material-ui/core'
import MenuIcon from '@material-ui/icons/Menu';
import { Link } from 'react-router-dom';

const drawerWidth = 240;
const useStyles = theme => ({
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
  }
});

class LeatherAppBar extends React.Component {
  render() {
    const {classes} = this.props;

    return (
      <div>
        <CssBaseline/>
        <AppBar position='fixed' className={classes.appBar}>
            <Toolbar>
            <IconButton
                color='inherit'
                aria-label='open drawer'
                edge='start'
                onClick={this.props.handleDrawerToggle}
                className={classes.menuButton}>
                <MenuIcon />
            </IconButton>
            <Typography
              variant='h6'
              component={Link}
              to={`/`}
              style={{color: `white`}}>
              {`CRAFTERS & MAKERS`}
            </Typography>
            </Toolbar>
        </AppBar>
      </div>
    )
  }
}

export default withStyles(useStyles, { withTheme: true })(LeatherAppBar);