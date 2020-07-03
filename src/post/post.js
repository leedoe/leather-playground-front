import React from 'react'
import ReactQuill, {Quill} from 'react-quill'
import 'react-quill/dist/quill.snow.css'
import { Card, CardHeader, CardContent, withStyles, TextField, Button, CardActions, Snackbar } from '@material-ui/core'

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
  }
});

class Post extends React.Component {
  state = {
    value: '',
    modify: false,
    post: {
      title: '',
      content: '',
      writer_name: '',
      writer: '',
      category: 1,
      noticed: false,
      created_time: '',
      views: 0,
      deleted: false
    },
    open: false,
    enqueueSnackbar: ''
  }

  constructor(props) {
    super(props)
    this.valueOnChange = this.valueOnChange.bind(this)
    this.onClickSaveButton = this.onClickSaveButton.bind(this)
    this.handleSnackbarClose = this.handleSnackbarClose.bind(this)
  }

  valueOnChange(e) {
    const post = this.state.post
    post.content = e
    this.setState({post})
    console.log(e)
  }

  OnChangeContent(e) {
    const post = this.state.post
    post.content = e
    this.setState({post})
  }

  componentDidMount() {
    // this.setState({enqueueSnackbar : useSnackbar()})
    if(this.props.location.state.post !== undefined) {
      this.setState({ modify: true })
      this.setState({post: this.props.location.state.post})
      this.setState({value: this.props.location.state.post.content})
      console.log(this.props.location.state.post.content)
    }else {
      const post = this.state.post
      post.writer_name = this.props.user.name
      post.writer = this.props.user.pk
      this.setState({post})
    }
    console.log(this.props.user)
  }

  sendData() {
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
          console.log(response)
          this.setState({open: true})
          this.props.enqueueSnackbar('test', {variant: 'success'})
          this.props.history.replace(`/posts/${this.state.post.pk}/`)
        })
    }
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
        <Card className={classes.card}>
          <CardContent>
            <TextField
              required
              id="post-title"
              label="제목"
              value={this.state.post.title}
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
              onClick={this.onClickSaveButton}>저장</Button>
          </CardActions>
        </Card>
      </div>
    )
  }
}

export default withStyles(useStyles, { withTheme: true })(withSnackbar(withRouter(Post)));