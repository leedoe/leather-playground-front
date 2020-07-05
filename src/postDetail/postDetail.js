import React from 'react';
import { withStyles, Card, CardHeader, CardContent, Backdrop, CircularProgress, IconButton, Menu, MenuItem, Paper, Typography, Grid, Divider } from '@material-ui/core';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import Axios from 'axios';
import moment from 'moment';
import { withRouter } from 'react-router-dom';
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
  card: {
    padding: theme.spacing(2)
  },
  subtitle: {
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1)
  },
  commentDiv: {
    paddingTop: theme.spacing(1)
  }
});



class PostDetail extends React.Component {
  state = {
    post: {},
    nowLoading: true,
    anchorEl: null,
  }

  constructor(props) {
    super(props)
    this.handleClick = this.handleClick.bind(this)
    this.handleClose = this.handleClose.bind(this)
    this.onClickDeleteButton = this.onClickDeleteButton.bind(this)
    this.onClickModifyButton = this.onClickModifyButton.bind(this)
  }

  handleClick(event) {
    this.setState({anchorEl: event.currentTarget})
  }

  handleClose() {
    this.setState({anchorEl: null})
  }

  datetimeFormatting(datetime) {
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

    Axios.get(`http://127.0.0.1:8000/api/posts/${this.props.match.params.pk}`).then((response) => {
      const post = response.data;
      
      this.setState({post})
      this.setState({nowLoading: false})
    }).catch((e) => {
    });
  }

  onClickDeleteButton() {
    this.setState({nowLoading: true})
    this.setState({anchorEl: null});
    const post = this.state.post
    post.deleted = true

    const config = {
      headers: {
        Authorization: `token ${localStorage.getItem('token')}`
      }
    }

    Axios.put(
      `http://127.0.0.1:8000/api/posts/${this.props.match.params.pk}/`,
      post,
      config
      ).then((response) => {
        this.setState({nowLoading: false})
        this.props.enqueueSnackbar('정삭적으로 삭제되었습니다.', {variant: 'success'})
        this.props.history.replace('/posts')
      }).catch((e) => {
        this.props.enqueueSnackbar('서버와 연결이 정상적이지 않습니다.', {variant: 'error'})
        this.setState({nowLoading: false})
      })
  }

  onClickModifyButton() {
    this.setState({anchorEl: null})
    this.props.history.push({
      pathname: `/post/${this.state.post.pk}`,
      state: {
        post: this.state.post,
      }})
  }

  componentDidMount() {
    this.fetchPostsFromServer()
  }
  
  render() {
    const {classes} = this.props;
    return (
      <div className={classes.root}>
        <Backdrop className={classes.backdrop} open={this.state.nowLoading}>
          <CircularProgress color="inherit" />
        </Backdrop>
      {this.state.nowLoading === false ?
        <Paper className={classes.card}>
          <div>
            <Typography variant='h4'>
              {this.state.post.title}
            </Typography>
            
          </div>
          <Grid
            className={classes.subtitle}
            container
            justify='space-between'>
            <Typography
              display='inline'
              align='left'
              color='textSecondary'>
              {this.state.post.writer_name}
            </Typography>
            <Typography
              display='inline'
              align='right'
              color='textSecondary'>
                {this.datetimeFormatting(this.state.post.created_time)}
            </Typography>
          </Grid>
          <Divider/>
          <div dangerouslySetInnerHTML={{__html: this.state.post.content}}>

          </div>
          <Divider/>
          <div className={classes.commentDiv}>
            <Typography variant='h5'>
              Comment
            </Typography>
          </div>
        </Paper>
        :
        ''
      }
      </div>
    )
  }
}

export default withStyles(useStyles, { withTheme: true })(withRouter(withSnackbar(PostDetail)));