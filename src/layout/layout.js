import React from 'react';

import { Switch, Route } from 'react-router-dom';

import SideMenu from '../sidemenu/sidemenu';
import LeatherAppBar from '../appbar/appbar';
import { CssBaseline, withStyles, Paper, Grid } from '@material-ui/core';
import Posts from '../posts/posts';
import PostDetail from '../postDetail/postDetail'
import CheckPostPasswordPage from '../postPwCheck/postPasswordCheck'
import LoginPage from '../loginPage/loginPage'
import Post from '../post/post'
import RegisterUser from '../registerUser/registerUser';
import LNaverMap from '../map/naverMap';
import UserInfo from '../userInfo/userInfo';
import MetaSearch from '../metasearch/metasearch';
import SuggestionBoard from '../suggestionBoard/suggestionBoard'
import Leather from '../leatherInformations/leathers/leather';
import Leathers from '../leatherInformations/leathers/leathers';
import LeatherDetail from '../leatherInformations/leathers/leatherDetail';
import ShopDetail from '../leatherInformations/leathers/shopDetail';
import Shop from '../leatherInformations/leathers/shop';
import Tannerys from '../leatherInformations/tannerys/tannerys';
import Tannery from '../leatherInformations/tannerys/tannery';
import TanneryDetail from '../leatherInformations/tannerys/tanneryDetail';
import Materials from '../leatherInformations/materials/materials';
import MaterialDetail from '../leatherInformations/materials/materialDetail';
import Material from '../leatherInformations/materials/material'
import CheckPasswordPage from '../leatherInformations/common/checkpassword'
import Main from '../main/main'

const useStyles = theme => ({
  root: {
    display: 'flex',
  },
  // necessary for content to be below app bar
  toolbar: theme.mixins.toolbar,
  content: {
    flexGrow: 1,
    padding: theme.spacing(2),
  },
});

class Layout extends React.Component {
  state = {
    mobileOpen: false,
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
          handleDrawerToggle={this.handleDrawerToggle}/>
        <main className={classes.content}>
          <div className={classes.toolbar}/>
          <Grid container justify='center'>
          <Grid
              item
              xs={12}
              sm={10}
              lg={8}>
            <div>
              <Switch>
                <Route path='/map/'>
                  <LNaverMap/>
                </Route>
                <Route exact path='/post/'>
                  <Post/>
                </Route>
                <Route exact path='/post/:pk'>
                  <Post/>
                </Route>
                <Route exact path='/posts/:pk'>
                  <PostDetail/>
                </Route>
                <Route exact path='/posts/'>
                  <Posts/>
                </Route>
                <Route path='/posts/:pk/pwcheck/'>
                  <CheckPostPasswordPage />
                </Route>
                <Route exact path='/login/'>
                  <LoginPage/>
                </Route>
                <Route path='/users/register/'>
                  <RegisterUser/>
                </Route>
                <Route path='/users/'>
                  <UserInfo/>
                </Route>
                <Route path='/meta/'>
                  <MetaSearch/>
                </Route>
                <Route path='/leathers/:pk/shops/:spk'>
                  <ShopDetail />
                </Route>
                <Route path='/leathers/:pk/shop/'>
                  <Shop />
                </Route>
                <Route path='/leathers/:pk'>
                  <LeatherDetail />
                </Route>
                <Route path='/leathers/'>
                  <Leathers />
                </Route>
                <Route path='/leather' component={Leather} />
                <Route path='/checkpw/'>
                  <CheckPasswordPage/>
                </Route>
                <Route path='/tannerys/:pk'>
                  <TanneryDetail/>
                </Route>
                <Route path='/tannerys/'>
                  <Tannerys/>
                </Route>
                <Route path='/tannery/'>
                  <Tannery/>
                </Route>
                <Route path='/materials/:pk'>
                  <MaterialDetail/>
                </Route>
                <Route path='/materials/'>
                  <Materials/>
                </Route>
                <Route path='/material/'>
                  <Material/>
                </Route>
                <Route path='/suggestions/'>
                  <SuggestionBoard />
                </Route>
                <Route path='/' exact>
                  <Main/>
                </Route>
              </Switch>
            </div>
          </Grid>
          </Grid>
        </main>
      </div>
    )
  }
}

export default withStyles(useStyles, {withTheme: true})(Layout);