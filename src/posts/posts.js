import React from 'react';
import axios from 'axios';
import moment from 'moment';
import { withStyles, List, ListItem, ListItemText, Typography, Backdrop, CircularProgress, Hidden, Fab, Grid, Divider } from '@material-ui/core';
import EditIcon from '@material-ui/icons/Edit';

import { Pagination, PaginationItem } from '@material-ui/lab'

import { Link, withRouter } from 'react-router-dom';
import { withSnackbar } from 'notistack';


const useStyles = theme => ({
  root: {
    // width: '100%',
    backgroundColor: theme.palette.background.paper,
    margin: '0 auto',
    [theme.breakpoints.up('lg')]: {
      width: "70%"
    },
    [theme.breakpoints.up('md')]: {
      width: "80%"
    }
  },
  backdrop: {
    zIndex: theme.zIndex.drawer + 1,
    color: '#fff',
  },
  pagination: {
    display: 'flex',
    justifyContent: 'center',
    padding: 8
  },
  floatingButton: {
    margin: 0,
    top: 'auto',
    right: 20,
    bottom: 20,
    left: 'auto',
    position: 'fixed',
  }
});

class Posts extends React.Component {
  state = {
    nowLoading: true,
    count: 0,
    posts: [],
    pageNumber: 1
  }

  constructor(props) {
    super(props)
    this.dateTimeFormatting = this.dateTimeFormatting.bind(this)
  }

  getDataFromParameter(dataName) {
    const urlParams = new URLSearchParams(window.location.search);
    const data = urlParams.get(dataName)
    if(data === null) {
      return null
    } else {
      return data
    }
  }

  dateTimeFormatting(datetime) {
    const today = moment().format('YYYY-MM-DD')
    const created_time = moment(datetime)
    const createdTimeDate = created_time.format('YYYY-MM-DD')

    if(today === createdTimeDate) {
      return created_time.format('H:mm')
    } else {
      return created_time.format('YY-MM-DD')
    }
  }

  fetchPostsFromServer() {
    this.setState({nowLoading: true})
    let pageNumber = this.getDataFromParameter('page')
    if (pageNumber == null) {
      pageNumber = 1;
    }
    this.setState({pageNumber})

    axios.get(`http://127.0.0.1:8000/api/posts/?page=${pageNumber}`).then((response) => {
      const posts = response.data.results;
      
      const naviCount = response.data.count % 30;
      if (naviCount === 0) {
        this.setState({navigationCount: response.data.count / 30});
      } else {
        this.setState({navigationCount: parseInt(response.data.count / 30, 30) + 1});
      }

      this.setState({posts})
      this.setState({count: response.data.count})
      this.setState({nowLoading: false})
    }).catch((e) => {
      this.props.enqueueSnackbar('서버와 연결이 정상적이지 않습니다.', {variant: 'error'})
      this.setState({nowLoading: false})
    });
  }

  componentDidMount() {
    this.fetchPostsFromServer();
  }

  componentDidUpdate(prevPros, prevState) {
    if(this.props.location.search !== prevPros.location.search) {
      this.fetchPostsFromServer();
    }
  }

  render () {
    const { classes } = this.props;
    return(
      <div className={classes.root}>
        <Backdrop className={classes.backdrop} open={this.state.nowLoading}>
          <CircularProgress color="inherit" />
        </Backdrop>
        <Hidden smUp implementation="css">
          <List>
          {this.state.posts.map((row) => (
            <ListItem component={Link} to={`/posts/${row.pk}`} key={row.pk}>
              <ListItemText 
                primary={
                  <Typography color="textPrimary">
                    {row.title}[{row.comment_count}]
                  </Typography>
                }
                secondary={
                  <Typography
                    color="textSecondary"
                    align="right">
                    {row.writer_name}
                  </Typography>
                }/>
            </ListItem>
          ))}
          </List>
        </Hidden>
        <Hidden xsDown implementation="css">
          <List>
          {this.state.posts.map((row) => (
            <ListItem component={Link} to={`/posts/${row.pk}`} key={row.pk}>
              {/* <ListItemText 
                primary={
                  <Typography
                    color="textPrimary">
                    {row.title} [{row.comment_count}]
                  </Typography>
                }
                secondary={
                  <Typography
                    color="textSecondary"
                    align="right">
                    {this.dateTimeFormatting(row.created_time)} / {row.writer_name}
                  </Typography>
                }/> */}
              <Grid
                className={classes.subtitle}
                container
                justify='space-between'>
                <Typography
                  display='inline'
                  align='left'
                  color='textSecondary'>
                  {row.title}
                </Typography>
                <Typography
                  display='inline'
                  align='right'
                  color='textSecondary'>
                    {this.dateTimeFormatting(row.created_time)} / {row.writer_name}
                </Typography>
              </Grid>
            </ListItem>
          ))}
          </List>
        </Hidden>
        <Divider/>
        <div className={classes.pagination}>
          <Pagination
            page={parseInt(this.state.pageNumber)}
            count={this.state.navigationCount}
            shape={`rounded`}
            renderItem={(item) => (
              <PaginationItem
                component={Link}
                to={`/posts?page=${item.page}`}
                {...item}
              />
            )}/>
        </div>
        {
          this.props.isLoggedIn === true ?
          <Fab 
            className={classes.floatingButton}
            color="secondary"
            aria-label="edit"
            component={Link}
            to={`/post/`}>
            <EditIcon/>
          </Fab> :
          ''
        }
      </div>
    )
  }
}

export default withStyles(useStyles, { withTheme: true })(withSnackbar(withRouter(Posts)));