import React from 'react';
import { withStyles, Card, CardHeader, CardContent, Backdrop, CircularProgress, IconButton, Menu, MenuItem } from '@material-ui/core';
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
  pagination: {
    display: 'flex',
    justifyContent: 'center',
    padding: 8
  },
  card: {
    padding: 8
  },
  confirmButton: {
    // padding: theme.spacing(2),
    marginLeft: 'auto'
  },
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
        this.props.history.replace('/posts')
      }).catch((e) => {
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
      {this.state.nowLoading === true ?
        <Backdrop className={classes.backdrop} open={this.state.nowLoading}>
          <CircularProgress color="inherit" />
        </Backdrop>
        :
        <Card className={classes.card}>
          <CardHeader
            title={this.state.post.title}
            subheader={`${this.datetimeFormatting(this.state.post.created_time)} / ${this.state.post.writer_name}`}
            action={
              this.props.user.pk === this.state.post.writer ?
              <div>
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
            />
          <CardContent>
            <div dangerouslySetInnerHTML={{__html: this.state.post.content}}>

            </div>
          </CardContent>
        </Card>
      }
      </div>
    )
  }
}

export default withStyles(useStyles, { withTheme: true })(withRouter(withSnackbar(PostDetail)));