import React from 'react';
import axios from 'axios';
import moment from 'moment';
import { withStyles, List, ListItem, ListItemText, Typography, Backdrop, CircularProgress, Fab, Grid, Divider, TextField } from '@material-ui/core';
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
    padding: theme.spacing(1)
  },
  floatingButton: {
    margin: 0,
    top: 'auto',
    right: theme.spacing(3),
    bottom: theme.spacing(3),
    left: 'auto',
    position: 'fixed',
  },
  searchPannel: {
    marginRight: theme.spacing(2),
    textAlign: 'right'
  },
  searchForm: {
    width: theme.spacing(100)
  },
  tip: {
    color: 'skyblue'
  },
  question: {
    color: 'LightCoral'
  },
  review: {
    color: 'PaleGreen'
  },
  notice: {
    color: 'Thistle'
  }
});

class Posts extends React.Component {
  state = {
    nowLoading: false,
    count: 0,
    posts: [],
    notices: [],
    pageNumber: 1,
    params: []
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

  getAllDataFromParameter = () => {
    const urlParams = new URLSearchParams(window.location.search)
    const data = []

    let pageNumber = this.getDataFromParameter('page')
    if (pageNumber == null) {
      data.push(['pageNumber', 1])
    }
    
    for(const [key, value] of urlParams) {
      data.push([key, value])
    }

    this.state.params = data
    return data
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

  getNotices = () => {
    axios.get(`${process.env.REACT_APP_SERVERURL}/api/posts/?noticed=true`).then((response) => {
      const notices = response.data.results;
      this.setState({notices})
    })
  }

  fetchPostsFromServer = () => {
    this.setState({nowLoading: true})
    let parameters = `?`
    for(const [key, value] of this.state.params) {
      parameters += `${key}=${value}&`
    }

    axios.get(`${process.env.REACT_APP_SERVERURL}/api/posts/${parameters}`).then((response) => {
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
    this.getAllDataFromParameter()
    console.log(this.getDataFromParameter('search'))
    if(this.getDataFromParameter('search') === null) {
      this.getNotices()
    } else {
      this.setState({notices: []})
    }
    this.fetchPostsFromServer();
  }

  componentDidUpdate(prevPros, prevState) {
    if(this.props.location.search !== prevPros.location.search) {
      this.getAllDataFromParameter()
      if(this.getDataFromParameter('search') === null) {
        this.getNotices()
      } else {
        this.setState({notices: []})
      }
      this.fetchPostsFromServer();
    }
  }

  searchKeyInput = (e) => {
    if(e.key === 'Enter') {
      this.props.history.push({
        pathname: `/posts/`,
        search: `?search=${e.target.value}`,
      })
    }
  }

  render () {
    const { classes } = this.props;
    return(
      <div className={classes.root}>
        <Backdrop className={classes.backdrop} open={this.state.nowLoading}>
          <CircularProgress color="inherit" />
        </Backdrop>   
        <List>
        {this.state.notices.map((row) => (
          <ListItem component={Link} to={`/posts/${row.pk}`} key={row.pk}>
            <ListItemText 
              primary={
                <Grid
                    container
                    justify='space-between'>
                  <Typography color="textPrimary">
                    {row.title}[{row.comment_count}]
                  </Typography>
                  <Typography
                    color="textPrimary">
                    {row.writer_name}
                  </Typography>
                </Grid>
              }
              secondary={
                <Grid
                  className={classes.subtitle}
                  container
                  justify='space-between'>
                  <span className={classes.notice}>{`공지`}</span>
                  <span>{this.dateTimeFormatting(row.created_time)}</span>
                </Grid>
              }
              secondaryTypographyProps={
                {component:'div'}
              }/>
          </ListItem>
        ))}
        {this.state.posts.map((row) => (
          <ListItem component={Link} to={`/posts/${row.pk}`} key={row.pk}>
            <ListItemText 
              primary={
                <Grid
                    container
                    justify='space-between'>
                  <Typography color="textPrimary">
                    {row.title}[{row.comment_count}]
                  </Typography>
                  <Typography
                    color="textPrimary">
                    {row.writer_name}
                  </Typography>
                </Grid>
              }
              secondary={
                <Grid
                  className={classes.subtitle}
                  container
                  justify='space-between'>
                  {row.category === 1 &&
                  <span>{`일반`}</span>
                  }
                  {row.category === 2 &&
                  <span className={classes.tip}>{`팁/강좌`}</span>
                  }
                  {row.category === 3 &&
                  <span className={classes.question}>{`질문`}</span>
                  }
                  {row.category === 4 &&
                  <span className={classes.review}>{`사용기/리뷰`}</span>
                  }
                  
                  <span>{this.dateTimeFormatting(row.created_time)}</span>
                </Grid>
              }
              secondaryTypographyProps={
                {component:'div'}
              }/>
          </ListItem>
        ))}
        </List>
        <Divider/>
        <div className={classes.searchPannel}>
          {/* <form onKeyPress={this.searchKeyInput}> */}
            <TextField
              id='search'
              label='search'
              onKeyPress={this.searchKeyInput}/>
          {/* </form> */}
        </div>
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

export default withStyles(useStyles, { withTheme: true })(withRouter(withSnackbar(Posts)));