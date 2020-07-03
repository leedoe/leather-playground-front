import React from 'react';
import axios from 'axios';
import moment from 'moment';
import { withStyles, List, ListItem, ListItemText, Typography, Backdrop, CircularProgress, Hidden } from '@material-ui/core';
import { Pagination, PaginationItem } from '@material-ui/lab'

import { Link } from 'react-router-dom';


const useStyles = theme => ({
  root: {
    width: '100%',
    backgroundColor: theme.palette.background.paper,
  },
  backdrop: {
    zIndex: theme.zIndex.drawer + 1,
    color: '#fff',
  },
  pagination: {
    display: 'flex',
    justifyContent: 'center',
    padding: 8
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
                    {row.title}
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
              <ListItemText 
                primary={
                  <Typography
                    color="textPrimary">
                    {row.title}
                  </Typography>
                }
                secondary={
                  <Typography
                    color="textSecondary"
                    align="right">
                    {this.dateTimeFormatting(row.created_time)} / {row.writer_name}
                  </Typography>
                }/>
            </ListItem>
          ))}
          </List>
        </Hidden>
        
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
      </div>
    )
  }
}

export default withStyles(useStyles, { withTheme: true }) (Posts);