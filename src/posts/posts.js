import React from 'react';
import axios from 'axios';
import moment from 'moment';
import { withStyles, List, ListItem, ListItemText, Typography, Backdrop, CircularProgress, Fab, Grid, Divider, TextField, Paper, Hidden } from '@material-ui/core';
import EditIcon from '@material-ui/icons/Edit';

import AccessTimeIcon from '@material-ui/icons/AccessTime';
import PersonIcon from '@material-ui/icons/Person';
import VisibilityIcon from '@material-ui/icons/Visibility';
import CategoryIcon from '@material-ui/icons/Category';

import { Pagination, PaginationItem } from '@material-ui/lab'

import { Link, withRouter } from 'react-router-dom';
import { withSnackbar } from 'notistack';
import { connect } from 'react-redux';
import { logout } from '../redux/actions';


const useStyles = theme => ({
  root: {
    // width: '100%',
    backgroundColor: theme.palette.background.paper,
    // margin: '0 auto',
    // [theme.breakpoints.up('lg')]: {
    //   width: "70%"
    // },
    // [theme.breakpoints.up('md')]: {
    //   width: "80%"
    // }
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
    textAlign: `center`,
    marginRight: theme.spacing(2),
    // textAlign: 'right'
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
  },
  row: {
    padding: theme.spacing(1)
  },
  postsTable: {
    width: `100%`,
    padding: theme.spacing(2)
  },
  itemCenter: {
    textAlign: `center`,
    paddingTop: theme.spacing(1),
  },
  timeCell: {
    textAlign: `center`,
    width: `1px`,
    whiteSpace: `nowrap`,
    paddingRight: theme.spacing(2),
  },
  categoryCell: {
    textAlign: `center`,
    width: `1px`,
    whiteSpace: `nowrap`,
    paddingRight: theme.spacing(2),
  },
  writerCell: {
    textAlign: `center`,
    width: `1px`,
    whiteSpace: `nowrap`,
    paddingRight: theme.spacing(2),
  },
  viewcountCell: {
    textAlign: `center`,
    width: `1px`,
    whiteSpace: `nowrap`,
  },
  titleText: {
    textDecoration: `none`
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
    this.setState({pageNumber: pageNumber})
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

    axios.get(`${process.env.REACT_APP_SERVERURL}/api/posts/${parameters}noticed=false`).then((response) => {
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

  setCategorySpan = (category) => {
    const {classes} = this.props
    switch(category){
      case 1:
        return <span>{`일반`}</span>
      case 2:
        return <span className={classes.tip}>{`팁/강좌`}</span>
      case 3:
        return <span className={classes.question}>{`질문`}</span>
      case 4:
        return <span className={classes.review}>{`사용기/리뷰`}</span>
      default:
        return
    }
  }

  render () {
    const { classes } = this.props;
    return(
      <Paper>
        <Backdrop className={classes.backdrop} open={this.state.nowLoading}>
          <CircularProgress color="inherit" />
        </Backdrop>
        <Hidden mdUp implementation="css">
          {/* 작은화면 */}
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
        </Hidden>
        <Hidden smDown implementation="css">
          <table className={classes.postsTable}>
            <thead>
              <tr>
                <th className={classes.timeCell}><AccessTimeIcon/></th>
                <th className={classes.categoryCell}><CategoryIcon/></th>
                <th></th>
                <th className={classes.writerCell}><PersonIcon/></th>
                <th className={classes.viewcountCell}><VisibilityIcon/></th>
              </tr>
            </thead>
            <tbody>
            {this.state.notices.map((row) => (
              <tr className={classes.row} key={row.pk} component={Link} to={`/posts/${row.pk}`}>
                <td className={classes.timeCell}>{this.dateTimeFormatting(row.created_time)}</td>
                <td className={classes.categoryCell}><span className={classes.notice}>공지</span></td>
                <td>
                  <Link to={`/posts/${row.pk}`} className={classes.titleText}>
                    <Typography
                      color="textPrimary">
                      {row.title} [{row.comment_count}]
                    </Typography>
                  </Link>
                </td>
                <td className={classes.writerCell}>{row.writer_name}</td>
                <td className={classes.viewcountCell}>{row.views}</td>
              </tr>
            ))}
            </tbody>
            <tbody>
            {this.state.posts.map((row) => (
              <tr className={classes.row} key={row.pk}>
                <td className={classes.timeCell}>{this.dateTimeFormatting(row.created_time)}</td>
                <td className={classes.categoryCell}>{this.setCategorySpan(row.category)}</td>
                <td>
                  <Link to={`/posts/${row.pk}`} className={classes.titleText}>
                    <Typography
                      color="textPrimary">
                      {row.title} [{row.comment_count}]
                    </Typography>
                  </Link>
                </td>
                <td className={classes.writerCell}>{row.writer_name}</td>
                <td className={classes.viewcountCell}>{row.views}</td>
            </tr>
            ))}
            </tbody>
          </table>
        </Hidden>
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
            count={Math.ceil(this.state.count / 20)}
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
          this.props.isLogin === true ?
          <Fab 
            className={classes.floatingButton}
            color="primary"
            aria-label="edit"
            component={Link}
            to={`/post/`}>
            <EditIcon/>
          </Fab> :
          ''
        }
      </Paper>
    )
  }
}

const mapStateToProps = (state, ownProps) => ({
  isLogin: state.isLogin,
  ownProps
})

export default connect(mapStateToProps)(withStyles(useStyles, { withTheme: true })(withRouter(withSnackbar(Posts))));