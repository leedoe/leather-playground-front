import React from 'react';
import { connect } from 'react-redux';
import { withStyles, Button, Grid, TextField } from '@material-ui/core';
import { withRouter } from 'react-router-dom';
import { withSnackbar } from 'notistack';
import { Editor, EditorState, AtomicBlockUtils, CompositeDecorator, convertFromRaw, convertToRaw } from 'draft-js';
import AddAPhotoIcon from '@material-ui/icons/AddAPhoto';
import bcrypt from 'bcryptjs'

import Instagram from './insta';
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

class TEditor extends React.Component {
  state = {
    editorState: EditorState.createEmpty(modifyDecorator),
    nickname: '',
    password: '',
    salt: env.salt
  }

  constructor(props) {
    super(props)
    if(props.readOnly === true) {
      this.state.editorState = EditorState.createWithContent(convertFromRaw(props.content), compositeDecorator)
    }
  }

  onChangePictureButton = (e) => {
    const reader = new FileReader()
    const file = e.target.files[0]
    if(!file.type.match('image.*')) {
      this.props.enqueueSnackbar('이미지 파일만 등록해주세요.', {variant: 'error'})
      return
    }
    reader.readAsDataURL(e.target.files[0])

    const editorState = this.props.editorState
    const editorStateChanged = this.props.editorStateChanged

    reader.addEventListener('load', function() {
      const contentState = editorState.getCurrentContent()
      const contentStateWithEntity = contentState.createEntity('img', 'IMMUTABLE', {src: reader.result})
      
      const entityKey = contentStateWithEntity.getLastCreatedEntityKey();
      const newEditorState = EditorState.set(
          editorState,
          { currentContent: contentStateWithEntity }
      );

      const newEditorStateWithBlock = AtomicBlockUtils.insertAtomicBlock(newEditorState, entityKey, ' ');
      editorStateChanged(newEditorStateWithBlock);
    })
  }

  editorStateChanged = editorState => {
    this.setState({
      editorState,
    })
  }

  focus = () => {
    this.refs.editor.focus()
  }

  renderimg = (props) => {
    // get the entity
    const entity = props.contentState.getEntity(props.block.getEntityAt(0));

    // get the entity data
    const {src} = entity.getData();
    
    // return our custom react component
    return <img src={src} alt={src}/>;
  };

  imageBlockFn = (contentBlock) => {
    if (contentBlock.getType() === 'atomic') {
        return {
            component: this.renderimg,
            editable: false,
        };
    }
    return null;
  }

  resetAll = () => {
    this.setState({
      editorState: EditorState.createEmpty(modifyDecorator),
      nickname: '',
      password: ''
    })
  }
  
  render () {
    const { classes } = this.props;
    if(this.props.readOnly === true) {
      return (
        <div>
          <div
            className={classes.readOnlyEditor}
            >
            <Editor
              blockRendererFn={this.imageBlockFn}
              editorState={this.state.editorState}
              // onChange={this.editorStateChanged}
              readOnly
              />
          </div>
        </div>
      )
    } else {
      return (
        <div>
          {this.props.isLogin === false?
          <Grid container direction='row' justify='space-around'>
            <Grid item xs={6}>
              <TextField
                label='닉네임'
                value={this.props.nickname}
                onChange={this.props.onChangeNicknameField}/>
            </Grid>
            <Grid item xs={6}>
              <TextField
                label='비밀번호'
                type='password'
                value={this.props.password}
                onChange={this.props.onChangePasswordField}/>
            </Grid>
          </Grid>
          :
          ''
          }
          
          <div className={classes.toolbar}>
            <label htmlFor="image_uploads">
              <AddAPhotoIcon/>
            </label>
            <input 
              onChange={this.onChangePictureButton}
              style={{display: "none"}}
              id='image_uploads' name='image_uploads' type="file"/>
          </div>
          <div
            className={classes.editor}
            onClick={this.focus}
            >
            <Editor
              blockRendererFn={this.imageBlockFn}
              ref='editor'
              editorState={this.props.editorState}
              onChange={this.props.editorStateChanged}
              placeholder={this.props.placeholder}
              />
          </div>
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

export default connect(mapStateToProps)(withStyles(useStyles, { withTheme: true })(withRouter(withSnackbar(TEditor))));