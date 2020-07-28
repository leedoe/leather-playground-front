import React from 'react';
import { withStyles, Backdrop, CircularProgress, Paper, Typography, Grid, Divider, List, TextField, Button, IconButton, Menu, MenuItem } from '@material-ui/core';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import Axios from 'axios';
import moment from 'moment';
import { withRouter } from 'react-router-dom';
import { withSnackbar } from 'notistack';
import { CompositeDecorator, EditorState, Editor, convertFromRaw } from 'draft-js';
import Instagram from '../instaform/insta';

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
  title: {
    width: "80%"
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
  },
  deleteComment: {
    marginLeft: theme.spacing(2)
  },
  deleteButton: {
    marginLeft: theme.spacing(1)
  },
  editor: {
    // backgroundColor: 'white',
    // marginTop: theme.spacing(2),
    padding: theme.spacing(2),
    // minHeight: theme.spacing(50),
    color: 'white',
    borderWidth: "2px",
    borderColor: 'white',
    borderStyle: 'solid',
  }
});

const instaStrategy = (contentBlock, callback, contentState) => {
  const text = contentBlock.getText()
  let matchArr, start
  let regex = /https:\/\/www\.instagram\.com\/[a-zA-Z0-9-/?_=;&]*/g
  while( (matchArr = regex.exec(text)) !== null) {
    start = matchArr.index
    let end = start + matchArr[0].length
    callback(start, end)
  }
}

const youtubeStrategy = (contentBlock, callback, contentState) => {
  const text = contentBlock.getText()
  let matchArr, start
  let regex = /(https:\/\/www\.)?youtube\.com\/watch\?v=(?<videoId>[\w-]*)/g
  while((matchArr = regex.exec(text)) !== null) {
    start = matchArr.index
    let end = start + matchArr[0].length
    callback(start, end)
  }
}

const regexComponent = props => {
  return (
    <Instagram style={{ backgroundColor:'lightgreen' }} draftProps={props}>
    </Instagram>
  )
}

const youtubeComponent = props => {
  const REGEX = /(https:\/\/www\.)?youtube\.com\/watch\?v=(?<videoId>[\w-]*)/g
  const regexMatch = REGEX.exec(props.decoratedText)
  const videoId = regexMatch.groups.videoId
  const youtubeUrl = `https://www.youtube.com/embed/${videoId}`
  return (
    <div style={{position: "relative", paddingBottom: "56.25%", paddingTop: "30px", height: "0", overflow: "hidden"}}>
      <object data={youtubeUrl} style={{position: "absolute", top: 0, left: 0, width: "100%", height: "100%"}}>{props.children}</object>
    </div>
  )
}

const compositeDecorator = new CompositeDecorator([
  {
    strategy: instaStrategy,
    component: regexComponent
  },
  {
    strategy: youtubeStrategy,
    component: youtubeComponent
  }
])



class PostDetail extends React.Component {
  state = {
    post: {},
    comments: [],
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
    this.deleteComment = this.deleteComment.bind(this)
    this.fetchCommentFromServer = this.fetchCommentFromServer.bind(this)

    this.state.editorState = EditorState.createEmpty(compositeDecorator)
  }

  editorStateChanged = newEditorState => {
    this.setState({
      editorState: newEditorState,
    })
  }

  handleClick(event) {
    this.setState({ anchorEl: event.currentTarget })
  }

  handleClose() {
    this.setState({ anchorEl: null })
  }

  datetimeFormatting(datetime) {
    const today = moment().format('YYYY-MM-DD')
    const created_time = moment(datetime)
    const createdTimeDate = created_time.format('YYYY-MM-DD')

    if (today === createdTimeDate) {
      return created_time.format('H:mm')
    } else {
      return created_time.format('YY-MM-DD')
    }
  }

  fetchPostsFromServer() {
    this.setState({ nowLoading: true })

    Axios.get(`${process.env.REACT_APP_SERVERURL}/api/posts/${this.props.match.params.pk}`).then((response) => {
      const post = response.data;

      // this.state.editorState = EditorState.createWithContent(convertFromRaw(JSON.parse(post.content)), compositeDecorator)
      this.setState({
        editorState: EditorState.createWithContent(convertFromRaw(JSON.parse(post.content)), compositeDecorator)
      })
      this.setState({ post })
      this.setState({ nowLoading: false })
    }).catch((e) => {
    });
  }

  fetchCommentFromServer() {
    this.setState({ nowLoading: true })

    Axios.get(`${process.env.REACT_APP_SERVERURL}/api/comments/?post=${this.props.match.params.pk}`).then((response) => {
      const comments = response.data;

      this.setState({ comments })
      this.setState({ nowLoading: false })
    }).catch((e) => {
    });
  }

  onClickDeleteButton() {
    this.setState({ nowLoading: true })
    this.setState({ anchorEl: null });
    const post = this.state.post
    post.deleted = true

    const config = {
      headers: {
        Authorization: `token ${localStorage.getItem('token')}`
      }
    }

    Axios.put(
      `${process.env.REACT_APP_SERVERURL}/api/posts/${this.props.match.params.pk}/`,
      post,
      config
    ).then((response) => {
      this.setState({ nowLoading: false })
      this.props.enqueueSnackbar('정삭적으로 삭제되었습니다.', { variant: 'success' })
      this.props.history.replace('/posts')
    }).catch((e) => {
      this.props.enqueueSnackbar('서버와 연결이 정상적이지 않습니다.', { variant: 'error' })
      this.setState({ nowLoading: false })
    })
  }

  onClickConfirmButton() {
    this.setState({ nowLoading: true })

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
      `${process.env.REACT_APP_SERVERURL}/api/comments/`,
      data,
      config
    ).then((response) => {
      this.setState({ nowLoading: false })
      this.props.enqueueSnackbar('정삭적으로 등록되었습니다.', { variant: 'success' })
      // this.props.history.replace(`/posts/${this.props.match.params.pk}`)
      this.fetchCommentFromServer()
    }).catch((e) => {
      this.props.enqueueSnackbar('서버와 연결이 정상적이지 않습니다.', { variant: 'error' })
      this.setState({ nowLoading: false })
    })
  }

  deleteComment(inputComment) {
    this.setState({ nowLoading: true })
    const comment = inputComment
    comment.deleted = true

    const config = {
      headers: {
        Authorization: `token ${localStorage.getItem('token')}`
      }
    }

    Axios.put(
      `${process.env.REACT_APP_SERVERURL}/api/comments/${comment.pk}/`,
      comment,
      config
    ).then((response) => {
      this.setState({ nowLoading: false })
      this.props.enqueueSnackbar('정삭적으로 삭제되었습니다.', { variant: 'success' })
      // this.props.history.replace(`/posts/${this.props.match.params.pk}`)
      this.fetchCommentFromServer()
    }).catch((e) => {
      this.props.enqueueSnackbar('서버와 연결이 정상적이지 않습니다.', { variant: 'error' })
      this.setState({ nowLoading: false })
    })
  }

  dateTimeFormatting(datetime) {
    const today = moment().format('YYYY-MM-DD')
    const created_time = moment(datetime)
    const createdTimeDate = created_time.format('YYYY-MM-DD')

    if (today === createdTimeDate) {
      return created_time.format('H:mm')
    } else {
      return created_time.format('YY-MM-DD')
    }
  }

  onClickModifyButton() {
    this.setState({ anchorEl: null })
    this.props.history.push({
      pathname: `/post/${this.state.post.pk}`,
      state: {
        post: this.state.post,
      }
    })
  }

  componentDidMount() {
    this.fetchPostsFromServer()
    this.fetchCommentFromServer()
  }

  onChangeComment(e) {
    this.setState({ writedComment: e.target.value })
  }

  imageBlockFn = (contentBlock) => {   
    if (contentBlock.getType() === 'atomic') {
        return {
            component: this.renderimg,
            editable: false,
        };
    }
    return null;
  }

  renderimg = (props) => {
    // get the entity
    const entity = props.contentState.getEntity(props.block.getEntityAt(0));

    // get the entity data
    const {src} = entity.getData();
    
    // return our custom react component
    return <img src={src} alt={src}/>;
  };

  render() {
    const { classes } = this.props;
    return (
      <div className={classes.root}>
        <Backdrop className={classes.backdrop} open={this.state.nowLoading}>
          <CircularProgress color="inherit" />
        </Backdrop>
        {this.state.nowLoading === false ?
          <Paper className={classes.card}>
            <div>
              <Grid
                className={classes.subtitle}
                container
                justify='space-between'>
                <Typography
                  variant='h4'
                  className={classes.title}>
                  {this.state.post.title}
                </Typography>
                {
                  this.props.user.pk === this.state.post.writer ?
                    <div className={classes.iconDiv}>
                      <IconButton
                        aria-controls="simple-menu"
                        aria-haspopup="true"
                        aria-label='settings'
                        onClick={this.handleClick}>
                        <MoreVertIcon />
                      </IconButton>
                      <Menu
                        id="simple-menu"
                        anchorEl={this.state.anchorEl}
                        keepMounted
                        open={Boolean(this.state.anchorEl)}
                        onClose={this.handleClose}>
                        <MenuItem onClick={this.onClickModifyButton}>수정</MenuItem>
                        <MenuItem onClick={this.onClickDeleteButton}>삭제</MenuItem>
                      </Menu>
                    </div>
                    :
                    ''
                }
              </Grid>

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
            <Divider />
            {/* <div dangerouslySetInnerHTML={{ __html: this.state.post.content }}>

            </div> */}
            <div className={classes.editor}>
              <Editor
                blockRendererFn={this.imageBlockFn}
                ref='editor'
                editorState={this.state.editorState}
                // onChange={this.editorStateChanged}
                readOnly={true}
                />
            </div>
            

            <Divider />
            <div className={classes.commentDiv}>
              <Typography variant='h5'>
                댓글
            </Typography>
            </div>
            <List>
              {this.state.comments.map((comment) => (
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
                      {comment.writer === this.props.user.pk ?
                        <Button
                          className={classes.deleteButton}
                          onClick={() => this.deleteComment(comment)}>
                          삭제
                    </Button>
                        :
                        ''
                      }
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

                  <Divider />
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
                variant="outlined" />

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
      </div >
    )
  }
}

export default withStyles(useStyles, { withTheme: true })(withRouter(withSnackbar(PostDetail)));