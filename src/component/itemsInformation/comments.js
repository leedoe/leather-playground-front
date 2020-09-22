import React from 'react';
import { connect } from 'react-redux';
import { withStyles, Typography, Grid, CircularProgress, Divider, Button } from '@material-ui/core';
import { withRouter } from 'react-router-dom';
import { withSnackbar } from 'notistack';
import Axios from 'axios';

// import TEditor from '../../component/texteditor/editor'
import dateTimeFormatting from '../datetime/datetimeFormatting';
import ItemCommentsEditor from './itemCommentsEditor'
import { logout } from '../../redux/actions';

const useStyles = theme => ({
  comment: {
    marginTop: theme.spacing(1)
  }
});

class Comments extends React.Component {
  state = {
    comments: [],
    nowLoading: true,
  }

  getComments = (division) => {
    switch(division) {
      case 'tannery':
        division = 0
        break
      case 'material':
        division = 1
        break
      case 'leather':
        division = 2
        break
      case 'leatherDetail':
        division = 3
        break
      default:
        division = 0
        break
    }

    Axios.get(
      `${process.env.REACT_APP_SERVERURL}/api/items/comments/`,
      {
        params:{
          division,
          fk: this.props.fk
        }
      }
    ).then((response) => {
      this.setState({comments: response.data, nowLoading: false,})
    }).catch((e) => {
      this.props.enqueueSnackbar('서버와 통신이 원활하지 않습니다.', {variant: 'error'})
    });
  }

  componentDidMount() {
    this.getComments(this.props.type)
  }

  isVisibleDeleteButton = (writer) => {
    if(writer === null) {
      return true
    }
    if(this.props.isLogin === true && this.props.user.pk === writer) {
      return true
    }
    return false
  }

  onClickDelete = (comment) => {
    if(comment.password != null) {
      this.props.history.push({
        pathname: `/checkpw/`,
        state: {comment}
      })
      return
    }
    const config = {
      headers: {
        Authorization: `JWT ${localStorage.getItem('token')}`
      }
    }

    Axios.delete(
      `${process.env.REACT_APP_SERVERURL}/api/items/comments/${comment.id}`,
      config
    ).then(response => {
      this.props.enqueueSnackbar('정상적으로 삭제되었습니다.', {variant: 'success'})
      this.getComments(this.props.type)
    }).catch(e => {
      this.props.enqueueSnackbar('서버와 통신이 원활하지 않습니다.', {variant: 'error'})
    })

  }

  render () {
    const { classes } = this.props;
    return (
      <div>
      {this.state.nowLoading === true ?
      <CircularProgress />
      :
      <div>
        <ItemCommentsEditor division={this.props.type} fk={this.props.match.params.pk} getComments={this.getComments}/>
        <Divider className={classes.Divider}/>
        {this.state.comments.map(comment => {
          return (
            <div className={classes.comment} key={comment.id}>
              <Grid container justify='space-between'>
                <Grid item>
                  <b>{comment.writer_name}</b>
                  {this.isVisibleDeleteButton(comment.writer) ?
                  <Button
                    size='small'
                    onClick={() => this.onClickDelete(comment)}>삭제</Button>
                  :
                  ''
                  }
                </Grid>
                <Grid item>{dateTimeFormatting(comment.created_time)}</Grid>
              </Grid>
              <div>
                <ItemCommentsEditor readOnly={true} content={comment.content}/>
              </div>
            </div>
          )
        })}
      </div>
      }
      </div>
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

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(useStyles, { withTheme: true })(withRouter(withSnackbar(Comments))));