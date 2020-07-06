import React from 'react'
import ReactQuill from 'react-quill'
import 'react-quill/dist/quill.snow.css'
import { Card, CardContent, withStyles, TextField, Button, CardActions, Backdrop, CircularProgress } from '@material-ui/core'

import '../post/post.css'
import { withRouter } from 'react-router-dom'
import Axios from 'axios'
import { withSnackbar } from 'notistack'

const useStyles = theme => ({
  confirmButton: {
    // padding: theme.spacing(2),
    marginLeft: 'auto'
  },
  card: {
    margin: '0 auto',
    [theme.breakpoints.up('lg')]: {
      width: "70%"
    },
    [theme.breakpoints.up('md')]: {
      width: "80%"
    }
  },
  backdrop: {
    zIndex: theme.zIndex.drawer + 999,
    color: '#fff',
  }
});

class Post extends React.Component {
  state = {
    // value: '',
    modify: false,
    post: {
      title: '',
      content: '',
      writer_name: '',
      writer: '',
      category: 1,
      noticed: false,
      views: 0,
      deleted: false
    },
    open: false,
    enqueueSnackbar: '',
    defaultTitle: '',
    nowLoading: false
  }

  constructor(props) {
    super(props)
    this.valueOnChange = this.valueOnChange.bind(this)
    this.onClickSaveButton = this.onClickSaveButton.bind(this)
    this.handleSnackbarClose = this.handleSnackbarClose.bind(this)
    this.onChangeTitle = this.onChangeTitle.bind(this)
  }

  valueOnChange(e) {
    const post = this.state.post
    post.content = e
    this.setState({post})
  }

  OnChangeContent(e) {
    const post = this.state.post
    post.content = e
    this.setState({post})
  }

  componentDidMount() {
    if(this.props.user.pk !== JSON.parse(localStorage.getItem('user')).pk) {
      this.props.enqueueSnackbar('비정상적인 접근입니다.', {variant: 'error'})
      this.props.history.replace(`/posts/`)
    }
    // this.setState({enqueueSnackbar : useSnackbar()})
    if(this.props.location.state !== undefined && this.props.location.state.post !== undefined) {
      this.setState({ modify: true })
      this.setState({post: this.props.location.state.post})
      // this.setState({value: this.props.location.state.post.content})
      this.setState({defaultTitle: this.props.location.state.post.title})
    }else {
      const post = this.state.post
      post.writer_name = this.props.user.username
      post.writer = this.props.user.pk
      this.setState({post})
    }
  }

  sendData() {
    this.setState({nowLoading: true})
    const data = this.state.post
    const config = {
      headers: {
        Authorization: `token ${localStorage.getItem('token')}`
      }
    }
    
    if(this.state.modify === true) {
      Axios.put(
        `http://127.0.0.1:8000/api/posts/${this.state.post.pk}/`,
        data,
        config
        ).then((response) => {
          this.setState({nowLoading: false})
          this.props.enqueueSnackbar('글이 정상적으로 수정되었습니다.', {variant: 'success'})
          // this.props.history.replace(`/posts/${this.state.post.pk}/`)
          this.props.history.go(-1)
        }).catch((e) => {
          this.setState({nowLoading: false})
          this.props.enqueueSnackbar('서버와 연결이 정상적이지 않습니다.', {variant: 'error'})
        })
    } else {
      Axios.post(
        `http://127.0.0.1:8000/api/posts/`,
        data,
        config
        ).then((response) => {
          this.setState({nowLoading: false})
          this.props.enqueueSnackbar('글이 정상적으로 등록되었습니다.', {variant: 'success'})
          this.props.history.replace(`/posts/${response.data.pk}`)
        }).catch((e) => {
          this.setState({nowLoading: false})
          this.props.enqueueSnackbar('서버와 연결이 정상적이지 않습니다.', {variant: 'error'})
        })
    }
  }

  onChangeTitle(e) {
    const post = this.state.post
    post.title = e.target.value
    this.setState({post})
  }

  onClickSaveButton() {
    this.sendData()
  }

  handleSnackbarClose() {
    this.setState({open: false})
  }

  render() {
    const {classes} = this.props
    return (
      <div>
        <Backdrop className={classes.backdrop} open={this.state.nowLoading}>
          <CircularProgress color="inherit" />
        </Backdrop>
        <Card className={classes.card}>
          <CardContent>
            <TextField
              required
              id="post-title"
              label="제목"
              value={this.state.post.title}
              onChange={this.onChangeTitle}
              fullWidth={true}/>
          </CardContent>
          <ReactQuill
            theme='snow'
            value={this.state.post.content}
            onChange={this.valueOnChange}/>
          <CardActions>
            <Button
              className={classes.confirmButton}
              color="primary"
              variant="contained"
              onClick={this.onClickSaveButton}>등록</Button>
          </CardActions>
        </Card>
      </div>
    )
  }
}

export default withStyles(useStyles, { withTheme: true })(withSnackbar(withRouter(Post)));