import React from 'react';
import { withStyles, Card, Typography, CardHeader, CardContent, Backdrop, CircularProgress, IconButton, Menu, MenuItem, CardActions, Button } from '@material-ui/core';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import Axios from 'axios';
import moment from 'moment';
import { withRouter } from 'react-router-dom';

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
    isMenuOpen: false,
  }

  constructor(props) {
    super(props)
    this.MenuClick = this.MenuClick.bind(this)
    this.handleClose = this.handleClose.bind(this)
  }

  MenuClick(event) {
    this.setState({isMenuOpen: event.currentTarget})
  }

  handleClose() {
    this.setState({isMenuOpen: null})
  }

  fetchPostsFromServer() {
    this.setState({nowLoading: true})

    Axios.get(`http://127.0.0.1:8000/api/posts/${this.props.match.params.pk}`).then((response) => {
      const post = response.data;
      
      const today = moment().format('YYYY-MM-DD')
      const created_time = moment(post.created_time)
      const createdTimeDate = created_time.format('YYYY-MM-DD')

      if(today === createdTimeDate) {
        post.created_time = created_time.format('H:mm')
      } else {
        post.created_time = created_time.format('YY-MM-DD')
      }

      this.setState({post})
      this.setState({nowLoading: false})
    }).catch((e) => {
    });
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
            subheader={`${this.state.post.created_time} / ${this.state.post.writer_name}`}
            action={
              this.props.user.pk === this.state.post.writer ?
              <div>
                <IconButton
                  aria-label='settings'
                  onClick={this.MenuClick}>
                  <MoreVertIcon />
                </IconButton>
                <Menu
                  id="simple-menu"
                  anchorEl={this.state.isMenuOpen}
                  keepMounted
                  open={Boolean(this.state.isMenuOpen)}
                  onClose={this.handleClose}>
                  <MenuItem onClick={this.handleCloseWithLogout}>수정</MenuItem>
                  <MenuItem onClick={this.handleCloseWithLogout}>삭제</MenuItem>
                </Menu>
              </div>
              :
              ''
            }
            />
          <CardContent>
            <Typography>
              {this.state.post.content}
            </Typography>
          </CardContent>
        </Card>
      }
      </div>
    )
  }
}

export default withStyles(useStyles, { withTheme: true })(withRouter(PostDetail));