import React from 'react';
import { withStyles, Backdrop, CircularProgress, Paper, Typography, Grid, Divider, List, TextField, Button, IconButton, Menu, MenuItem } from '@material-ui/core';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import Axios from 'axios';
import moment from 'moment';
import { withRouter, Link } from 'react-router-dom';
import { withSnackbar } from 'notistack';
import { CompositeDecorator, EditorState, Editor, convertFromRaw } from 'draft-js';
import Instagram from '../component/texteditor/insta';
import { connect } from 'react-redux';
import { logout } from '../redux/actions'

import bcrypt from 'bcryptjs'
import env from '../salt'

const useStyles = theme => ({
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
    // paddingTop: theme.spacing(1),
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
    padding: theme.spacing(1),
    // color: 'white',
    borderWidth: "2px",
    borderColor: '#e0e0e0',
    borderStyle: 'solid',
  },
  listDiv: {
    textAlign: 'right',
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1)
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
    writedComment: '',
    isShowMenu: false,
    writedCommentName: '',
    writedCommentPassword: '',
  }

  constructor(props) {
    super(props)
    this.state.editorState = EditorState.createEmpty(compositeDecorator)
  }

  editorStateChanged = newEditorState => {
    this.setState({
      editorState: newEditorState,
    })
  }

  handleClick = (event) => {
    this.setState({ anchorEl: event.currentTarget })
  }

  handleClose = () => {
    this.setState({ anchorEl: null })
  }

  datetimeFormatting = (datetime) => {
    const today = moment().format('YYYY-MM-DD')
    const created_time = moment(datetime)
    const createdTimeDate = created_time.format('YYYY-MM-DD')

    if (today === createdTimeDate) {
      return created_time.format('H:mm')
    } else {
      return created_time.format('YY-MM-DD')
    }
  }

  fetchPostsFromServer = () => {
    this.setState({ nowLoading: true })

    Axios.get(`${process.env.REACT_APP_SERVERURL}/api/posts/${this.props.match.params.pk}`).then((response) => {
      const post = response.data;
      let isShowMenu = false

      if(post.writer === null) {
        isShowMenu = true
      } else if (post.writer === this.props.user.pk) {
        isShowMenu = true
      }

      // this.state.editorState = EditorState.createWithContent(convertFromRaw(JSON.parse(post.content)), compositeDecorator)
      this.setState({
        editorState: EditorState.createWithContent(convertFromRaw(post.content), compositeDecorator),
        post,
        nowLoading: false,
        isShowMenu
      })
    }).catch((e) => {
      this.props.enqueueSnackbar('서버와 통신이 원활하지 않습니다.', {variant: 'error'})
    });
  }

  fetchCommentFromServer = () => {
    this.setState({ nowLoading: true })

    Axios.get(`${process.env.REACT_APP_SERVERURL}/api/comments/?post=${this.props.match.params.pk}`).then((response) => {
      const comments = response.data;

      this.setState({ comments })
    }).catch((e) => {
      this.props.enqueueSnackbar('서버와 통신이 원활하지 않습니다.', {variant: 'error'})
    });
    this.setState({ nowLoading: false })
  }

  onClickDeleteButton = () => {
    const post = this.state.post
    post.deleted = true
    console.log(this.state.post)
    if(this.state.post.writer === null) {
      // 익명으로 쓴 글
      console.log(`test`)
      this.props.history.push({
        pathname: `/posts/${post.pk}/pwcheck/`,
        state: {post}
      })
      return
    }
    
    this.setState({ nowLoading: true })
    this.setState({ anchorEl: null });
    const config = {
      headers: {
        Authorization: `JWT ${localStorage.getItem('token')}`
      }
    }

    Axios.put(
      `${process.env.REACT_APP_SERVERURL}/api/posts/${this.props.match.params.pk}/`,
      post,
      config
    ).then((response) => {
      this.setState({ nowLoading: false })
      this.props.enqueueSnackbar('정삭적으로 삭제되었습니다.', { variant: 'success' })
      this.props.history.go(-1)
    }).catch((e) => {
      if(e.response.data.code === 'token_not_valid') {
        Axios.post(
          `${process.env.REACT_APP_SERVERURL}/api-token-refresh/`,
          {refresh: localStorage.getItem('refresh')}
        ).then(response => {
          localStorage.setItem('token', response.data.access)
          localStorage.setItem('refresh', response.data.refresh)
          this.onClickDeleteButton()
        }).catch(e => {
          this.props.enqueueSnackbar('로그인 정보가 만료되었습니다. 다시 로그인해주세요.', {variant: 'error'})
          this.props.logout()
          this.props.history.replace(`/login/`)
        })
      }
      // this.props.enqueueSnackbar('서버와 연결이 정상적이지 않습니다.', { variant: 'error' })
    })
    this.setState({ nowLoading: false })
  }

  onClickConfirmButton = () => {
    // this.setState({ nowLoading: true })

    const data = {
      post: this.state.post.pk,
      content: this.state.writedComment,
    }

    if(this.props.isLogin) {
      data.writer_name = this.props.user.name
      data.writer = this.props.user.pk
    } else {
      data.writer_name = this.state.writedCommentName
      const hash = bcrypt.hashSync(this.state.writedCommentPassword, this.state.salt)
      data.password = hash
    }

    const t_config = {
      url: `${process.env.REACT_APP_SERVERURL}/api/comments/`,
      data, 
      method: 'post'}
    if (this.props.isLogin) {
      t_config.headers = {Authorization: `JWT ${localStorage.getItem('token')}`}
    }
    
    console.log(t_config)

    Axios.request(t_config).then(response => {
      console.log(response)
      if(response.status === 201) {
        this.props.enqueueSnackbar('정상적으로 등록되었습니다.', {variant: 'success'})
      } else if(response.status === 200) {
        this.props.enqueueSnackbar('정상적으로 수정되었습니다.', {variant: 'success'})
      }
      this.setState({
        writedCommentName: '',
        writedCommentPassword: '',
      })
      this.fetchCommentFromServer()
    }).catch(e => {
      // console.log(e)
      if(e.response.data.code === 'token_not_valid') {
        Axios.post(
          `${process.env.REACT_APP_SERVERURL}/api-token-refresh/`,
          {refresh: localStorage.getItem('refresh')}
        ).then(response => {
          localStorage.setItem('token', response.data.access)
          localStorage.setItem('refresh', response.data.refresh)
          this.sendData()
        }).catch(e => {
          this.props.enqueueSnackbar('로그인 정보가 만료되었습니다. 다시 로그인해주세요.', {variant: 'error'})
          this.props.logout()
          this.props.history.replace(`/login/`)
        })
      } else if(e.response.status === 401) {
        this.props.enqueueSnackbar('비밀번호를 확인해주세요.', {variant: 'error'})
      }else {
        this.props.enqueueSnackbar('서버와 연결이 정상적이지 않습니다.', {variant: 'error'})
      }
    })

    // Axios.post(
    //   `${process.env.REACT_APP_SERVERURL}/api/comments/`,
    //   data,
    //   config
    // ).then((response) => {
    //   this.setState({ nowLoading: false })
    //   this.props.enqueueSnackbar('정삭적으로 등록되었습니다.', { variant: 'success' })
    //   // this.props.history.replace(`/posts/${this.props.match.params.pk}`)
    //   this.fetchCommentFromServer()
    // }).catch((e) => {
    //   this.props.enqueueSnackbar('서버와 연결이 정상적이지 않습니다.', { variant: 'error' })
    //   this.setState({ nowLoading: false })
    // })
  }

  deleteComment = (inputComment) => {
    this.setState({ nowLoading: true })
    const comment = inputComment
    comment.deleted = true

    const config = {
      headers: {
        Authorization: `JWT ${localStorage.getItem('token')}`
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
      if(e.response.data.code === 'token_not_valid') {
        Axios.post(
          `${process.env.REACT_APP_SERVERURL}/api-token-refresh/`,
          {refresh: localStorage.getItem('refresh')}
        ).then(response => {
          localStorage.setItem('token', response.data.access)
          localStorage.setItem('refresh', response.data.refresh)
          this.sendData()
        }).catch(e => {
          this.props.enqueueSnackbar('로그인 정보가 만료되었습니다. 다시 로그인해주세요.', {variant: 'error'})
          this.props.logout()
          this.props.history.replace(`/login/`)
        })
      } else {
        this.props.enqueueSnackbar('서버와 연결이 정상적이지 않습니다.', {variant: 'error'})
      }
      // this.props.enqueueSnackbar('서버와 연결이 정상적이지 않습니다.', { variant: 'error' })
      this.setState({ nowLoading: false })
    })
  }

  dateTimeFormatting = (datetime) => {
    const today = moment().format('YYYY-MM-DD')
    const created_time = moment(datetime)
    const createdTimeDate = created_time.format('YYYY-MM-DD')

    if (today === createdTimeDate) {
      return created_time.format('H:mm')
    } else {
      return created_time.format('YY-MM-DD')
    }
  }

  onClickModifyButton = () => {
    this.setState({ anchorEl: null })
    this.props.history.push({
      pathname: `/post/${this.state.post.pk}`,
      state: {
        post: this.state.post,
      }
    })
  }

  componentDidMount = () => {
    this.fetchPostsFromServer()
    this.fetchCommentFromServer()
  }

  onChangeComment = (e) => {
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
      <div>
        <Backdrop className={classes.backdrop} open={this.state.nowLoading}>
          <CircularProgress color="inherit" />
        </Backdrop>
        {this.state.nowLoading === false ?
          <div className={classes.card}>
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
                  this.state.isShowMenu ?
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
                align='left'>
                {this.state.post.writer_name}
              </Typography>
              <Typography
                display='inline'
                align='right'>
                {this.datetimeFormatting(this.state.post.created_time)}
              </Typography>
            </Grid>
            <div className={classes.editor}>
              <Editor
                blockRendererFn={this.imageBlockFn}
                ref='editor'
                editorState={this.state.editorState}
                readOnly={true}
                />
            </div>
            
            <div className={classes.listDiv}>
              <Button
                component={Link}
                to={`/posts/`}
                color='primary'
                variant="contained">
                  목록
              </Button>
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
              {this.props.isLogin === false ?
                <Grid container direction='row' justify='space-around'>
                  <Grid item xs={6}>
                    <TextField
                      label='닉네임'
                      value={this.state.writedCommentName}
                      onChange={e => {this.setState({writedCommentName: e.target.value})}}/>
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      label='비밀번호'
                      type='password'
                      value={this.state.writedCommentPassword}
                      onChange={e => {this.setState({writedCommentPassword: e.target.value})}}/>
                  </Grid>
                </Grid>
              :
                ''
              }
              <br/>
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
          </div>
          :
          ''
        }
      </div >
    )
  }
}

const mapStateToProps = (state, ownProps) => ({
  isLogin: state.isLogin,
  user: state.user,
  ownProps
})

const mapDispatchToProps = dispatch => ({
  logout: () => dispatch(logout())
})

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(useStyles, { withTheme: true })(withRouter(withSnackbar(PostDetail))));