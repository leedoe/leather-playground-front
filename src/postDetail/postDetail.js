import React from 'react';
import { withStyles, Backdrop, CircularProgress, Paper, Typography, Grid, Divider, List, TextField, Button } from '@material-ui/core';
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
  },
  commentBottom: {
    paddingBottom: theme.spacing(1)
  },
  commenTextarea: {
    width: "100%"
  },
  confirmDiv: {
    paddingTop: theme.spacing(1)
  },
  confirmButton: {
    display: 'flex',
    marginLeft: 'auto'
  }
});



class PostDetail extends React.Component {
  state = {
    post: {},
    nowLoading: true,
    anchorEl: null,
    writedComment: ''
  }

  constructor(props) {
    super(props)
    this.handleClick = this.handleClick.bind(this)
    this.handleClose = this.handleClose.bind(this)
    this.onClickDeleteButton = this.onClickDeleteButton.bind(this)
    this.onClickModifyButton = this.onClickModifyButton.bind(this)
    this.onChangeComment = this.onChangeComment.bind(this)
    this.onClickConfirmButton = this.onClickConfirmButton.bind(this)
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

  onClickConfirmButton() {
    this.setState({nowLoading: true})

    const data = {
      post: this.state.post.pk,
      content: this.state.writedComment,
      writer_name: JSON.parse(localStorage.getItem('user')).name,
      writer: JSON.parse(localStorage.getItem('user')).pk
    }

    const config = {
      headers: {
        Authorization: `token ${localStorage.getItem('token')}`
      }
    }

    Axios.post(
      `http://127.0.0.1:8000/api/comments/`,
      data,
      config
      ).then((response) => {
        this.setState({nowLoading: false})
        this.props.enqueueSnackbar('정삭적으로 등록되었습니다.', {variant: 'success'})
        // this.props.history.replace(`/posts/${this.props.match.params.pk}`)
        this.fetchPostsFromServer()
      }).catch((e) => {
        this.props.enqueueSnackbar('서버와 연결이 정상적이지 않습니다.', {variant: 'error'})
        this.setState({nowLoading: false})
      })
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

  onChangeComment(e) {
    this.setState({writedComment: e.target.value})
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
              댓글
            </Typography>
          </div>
          <List>
          {this.state.post.comment_set.map((comment) => (
            // <ListItem 
            //   key={comment.pk}>
            <div key={comment.pk}>
              <Grid
                className={classes.subtitle}
                container
                justify='space-between'>
                <Typography
                  display='inline'
                  align='left'>
                  {comment.writer_name}
                </Typography>
                <Typography
                  display='inline'
                  align='right'
                  color='textSecondary'>
                    {this.dateTimeFormatting(comment.created_time)}
                </Typography>
              </Grid>
              <Typography className={classes.commentBottom}>
                {comment.content}
              </Typography>
              
              <Divider/>
            </div>
            // </ListItem>
          ))}
          </List>

          <div>
            <TextField
              className={classes.commenTextarea}
              id="outlined-multiline-static"
              label="댓글"
              multiline
              rows={4}
              defaultValue=""
              onChange={this.onChangeComment}
              variant="outlined"/>
            
            <div className={classes.confirmDiv}>
              <Button
                className={classes.confirmButton}
                onClick={this.onClickConfirmButton}
                color="primary"
                variant="contained">
                  등록
              </Button>
            </div>
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