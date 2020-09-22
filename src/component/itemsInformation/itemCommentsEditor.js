import React from 'react';
import { connect } from 'react-redux';
import { withStyles, Button, Grid, TextField } from '@material-ui/core';
import { withRouter } from 'react-router-dom';
import { withSnackbar } from 'notistack';
import { Editor, EditorState, AtomicBlockUtils, CompositeDecorator, convertFromRaw, convertToRaw } from 'draft-js';
import AddAPhotoIcon from '@material-ui/icons/AddAPhoto';
import bcrypt from 'bcryptjs'

import TEditor from '../texteditor/editor'
import Instagram from '../texteditor/insta';
import env from '../../salt'
import Axios from 'axios';

const useStyles = theme => ({
  toolbar: {
    marginTop: theme.spacing(2)
  },
  editor: {
    borderWidth: "0px 0px 1px 0px",
    borderColor: '#e0e0e0',
    borderStyle: 'solid',
  },
  submit: {
    marginTop: theme.spacing(1),
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

const modifyInstaComponent = props => {
  return (
    <span style={{ backgroundColor:'lightgreen' }}>
      {/* <span style={{display:"none"}}>{props.children}</span> */}
      {props.children}
    </span>
  )
}

const modifyYoutubeComponent = props => {
  return (
    <span style={{ backgroundColor: 'lightblue' }}>{props.children}</span>
  )
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

const modifyDecorator = new CompositeDecorator([
  {
    strategy: instaStrategy,
    component: modifyInstaComponent
  },
  {
    strategy: youtubeStrategy,
    component: modifyYoutubeComponent
  }
])

class ItemCommentEditor extends React.Component {
  state = {
    editorState: EditorState.createEmpty(modifyDecorator),
    nickname: '',
    password: '',
    salt: env.salt
  }

  constructor(props) {
    super(props)
    this.editor = React.createRef()
    if(props.readOnly === true) {
      this.state.editorState = EditorState.createWithContent(convertFromRaw(props.content), compositeDecorator)
    }
  }

  editorStateChanged = editorState => {
    this.setState({
      editorState,
    })
  }

  resetAll = () => {
    this.setState({
      editorState: EditorState.createEmpty(modifyDecorator),
      nickname: '',
      password: ''
    })
  }

  validate = () => {
    const content = convertToRaw(this.state.editorState.getCurrentContent())
    if(content.blocks.length === 1 && content.blocks[0].text.length === 0) {
      return false
    }

    if(this.props.isLogin === false) {
      if(this.state.nickname.length === 0 || this.state.password.length === 0){
        return false
      }
    }

    return true
  }

  onClickSubmit = () => {
    if(this.validate() === false) {
      this.props.enqueueSnackbar('내용을 정확하게 입력해주세요.', {variant: 'error'})
      return
    }

    let division = this.props.division
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

    const data = {
      division,
      fk: parseInt(this.props.fk),
      content: convertToRaw(this.state.editorState.getCurrentContent()),
      deleted: false,
    }
    // user
    if(this.props.isLogin) {
      data.writer = this.props.user.pk
      data.writer_name = this.props.user.name
    } else {
      const hash = bcrypt.hashSync(this.state.password, this.state.salt)

      data.writer_name = this.state.nickname
      data.password = hash
    }
    
    //sent data
    Axios.post(`${process.env.REACT_APP_SERVERURL}/api/items/comments/`,
      data
      ).then(response => {
        this.resetAll()
        this.props.getComments(this.props.division)
      }).catch(e => {
        this.props.enqueueSnackbar('서버와 통신이 원활하지 않습니다.', {variant: 'error'})
      })
  }

  onChangeNicknameField = (e) => {
    this.setState({nickname: e.target.value})
  }

  onChangePasswordField = (e) => {
    this.setState({password: e.target.value})
  }
  
  render () {
    const { classes } = this.props;
    if(this.props.readOnly === true) {
      return (
        <TEditor readOnly={true} content={this.props.content}/>
      )
    } else {
      return (
        <div>
          <TEditor 
            placeholder={`댓글 등록`}
            editorState={this.state.editorState}
            editorStateChanged={this.editorStateChanged}
            nickname={this.state.nickname}
            password={this.state.password}
            onChangeNicknameField={this.onChangeNicknameField}
            onChangePasswordField={this.onChangePasswordField}/>
          <Grid container justify='flex-end'>
            <Grid item>
              <Button
                className={classes.submit}
                variant="contained"
                color='primary'
                onClick={this.onClickSubmit}>
                등록
              </Button>
            </Grid>
          </Grid>
        </div>
      )
    }
  }
}

const mapStateToProps = (state, ownProps) => ({
  isLogin: state.isLogin,
  user: state.user,
  ownProps
})

export default connect(mapStateToProps)(withStyles(useStyles, { withTheme: true })(withRouter(withSnackbar(ItemCommentEditor))));