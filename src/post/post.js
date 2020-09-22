import React from 'react'
import {  withStyles, TextField, Button, CardActions, Backdrop, CircularProgress, Paper, InputLabel, Select, Grid } from '@material-ui/core'

import { withRouter } from 'react-router-dom'
import Axios from 'axios'
import { withSnackbar } from 'notistack'

import { EditorState, Editor, convertToRaw, CompositeDecorator, Entity, AtomicBlockUtils, convertFromRaw } from 'draft-js'
import AddAPhotoIcon from '@material-ui/icons/AddAPhoto';

import 'draft-js/dist/Draft.css';
import { connect } from 'react-redux'
import { logout } from '../redux/actions'

import bcrypt from 'bcryptjs'
import env from '../salt'

const useStyles = theme => ({
  confirmButton: {
    // padding: theme.spacing(2),
    marginLeft: 'auto'
  },
  card: {
    minHeight: "100%",
    margin: '0 auto',
    [theme.breakpoints.up('lg')]: {
      width: "70%"
    },
    [theme.breakpoints.up('md')]: {
      width: "80%"
    },
    padding: theme.spacing(2),
  },
  backdrop: {
    zIndex: theme.zIndex.drawer + 999,
    color: '#fff',
  },
  editor: {
    borderWidth: "2px",
    borderColor: '#e0e0e0',
    borderStyle: 'solid',
    borderTopWidth: "0px",
    padding: theme.spacing(2),
    // minHeight: theme.spacing(50),
  },
  toolbar: {
    borderWidth: "2px",
    borderColor: '#e0e0e0',
    borderStyle: 'solid',
    padding: theme.spacing(2),
    marginTop: theme.spacing(2)
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



class Post extends React.Component {
  state = {
    salt: env.salt,
    // value: '',
    modify: false,
    post: {
      title: '',
      content: '',
      writer_name: '',
      category: 1,
      noticed: false,
      views: 0,
      deleted: false
    },
    categories: [],
    open: false,
    enqueueSnackbar: '',
    defaultTitle: '',
    nowLoading: false,
    editorState: EditorState.createEmpty(modifyDecorator)
  }

  constructor(props) {
    super(props)
    this.state.editorState = EditorState.createEmpty(modifyDecorator)
  }

  getFileBase64 = (file, callback) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)

    reader.onload = () => callback(reader.result)
    reader.onerror = error => {}
  }

  imageUploadCallback = file => new Promise(
    (resolve, reject) => this.getFileBase64(
      file,
      data => resolve({data: {link: data}})
    )
  )

  editorStateChanged = newEditorState => {
    this.setState({
      editorState: newEditorState,
    })
  }

  focus = () => {
    this.refs.editor.focus()
  }

  getCategory = () => {
    Axios.get(`${process.env.REACT_APP_SERVERURL}/api/categories/`).then(response => {
      this.setState({categories: response.data})
    }).catch(e => {
      this.props.enqueueSnackbar('서버와 통신에 문제가 있습니다.', {variant: 'error'})
    })
  }

  componentDidMount() {
    // if(this.props.user.pk !== JSON.parse(localStorage.getItem('user')).pk) {
    //   this.props.enqueueSnackbar('비정상적인 접근입니다.', {variant: 'error'})
    //   this.props.history.replace(`/posts/`)
    // }
    this.getCategory()
    if(this.props.location.state !== undefined && this.props.location.state.post !== undefined) {
      this.setState({ modify: true })
      this.setState({post: this.props.location.state.post})
      this.setState({defaultTitle: this.props.location.state.post.title})
      // this.state.editorState = EditorState.createWithContent(convertFromRaw(JSON.parse(this.props.location.state.post.content)), modifyDecorator)
      this.setState({
        editorState: EditorState.createWithContent(convertFromRaw(this.props.location.state.post.content), modifyDecorator)
      })
    }else {
      if(this.props.isLogin) {
        const post = this.state.post
        post.writer_name = this.props.user.name
        post.writer = this.props.user.pk
        this.setState({post})
      } else {
        const post = this.state.post
        post.password = ''
        this.setState({post})
      }
    }
  }

  sendData = () => {
    this.setState({nowLoading: true})
    const data = this.state.post
    data.content = convertToRaw(this.state.editorState.getCurrentContent())
    if(this.props.location.type === 'suggestion') {
      const suggestionId = this.state.categories.find(item => item.name === '건의')
      data.category = suggestionId.id
    }

    if(!this.props.isLogin) {
      const hash = bcrypt.hashSync(data.password, this.state.salt)
      data.password = hash
    }

    const config = {
      headers: {
        Authorization: `JWT ${localStorage.getItem('token')}`
      }
    }

    const headers = {
      Authorization: `JWT ${localStorage.getItem('token')}`
    }

    const t_config = {data}
    if(this.props.isLogin) {
      t_config.headers = {Authorization: `JWT ${localStorage.getItem('token')}`}
    }

    if (this.state.modify) {
      t_config.url = `${process.env.REACT_APP_SERVERURL}/api/posts/${this.state.post.pk}/`
      t_config.method = 'put'
    } else {
      t_config.url = `${process.env.REACT_APP_SERVERURL}/api/posts/`
      t_config.method = 'post'
    }

    Axios.request(t_config).then(response => {
      if(response.status === 201) {
        this.props.enqueueSnackbar('정상적으로 등록되었습니다.', {variant: 'success'})
      } else if(response.status === 200) {
        this.props.enqueueSnackbar('정상적으로 수정되었습니다.', {variant: 'success'})
      }
      this.props.history.replace(`/posts/${response.data.pk}`)
    }).catch(e => {
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
    this.setState({nowLoading: false})
    
    // if(this.state.modify === true) {
    //   Axios.put(
    //     `${process.env.REACT_APP_SERVERURL}/api/posts/${this.state.post.pk}/`,
    //     data,
    //     config
    //     ).then((response) => {
    //       this.setState({nowLoading: false})
    //       this.props.enqueueSnackbar('글이 정상적으로 수정되었습니다.', {variant: 'success'})
    //       this.props.history.go(-1)
    //     }).catch((e) => {
    //       if(e.response.status === 401) {
    //         Axios.post(
    //           `${process.env.REACT_APP_SERVERURL}/api-token-refresh/`,
    //           {refresh: localStorage.getItem('refresh')}
    //         ).then(response => {
    //           localStorage.setItem('token', response.data.access)
    //           localStorage.setItem('refresh', response.data.refresh)
    //           this.sendData()
    //         }).catch(e => {
    //           this.props.enqueueSnackbar('다시 로그인해주세요.', {variant: 'error'})
    //           this.props.logout()
    //           this.props.history.replace(`/login/`)
    //         })
    //       } else {
    //         this.props.enqueueSnackbar('서버와 연결이 정상적이지 않습니다.', {variant: 'error'})
    //       }
    //       this.setState({nowLoading: false})
    //       // this.props.enqueueSnackbar('서버와 연결이 정상적이지 않습니다.', {variant: 'error'})
    //     })
    // } else {
    //   Axios.post(
    //     `${process.env.REACT_APP_SERVERURL}/api/posts/`,
    //     data,
    //     config
    //     ).then((response) => {
    //       this.setState({nowLoading: false})
    //       this.props.enqueueSnackbar('글이 정상적으로 등록되었습니다.', {variant: 'success'})
    //       this.props.history.replace(`/posts/${response.data.pk}`)
    //     }).catch((e) => {
    //       if(e.response.status === 401) {
    //         Axios.post(
    //           `${process.env.REACT_APP_SERVERURL}/api-token-refresh/`,
    //           {refresh: localStorage.getItem('refresh')}
    //         ).then(response => {
    //           localStorage.setItem('token', response.data.access)
    //           localStorage.setItem('refresh', response.data.refresh)
    //           this.sendData()
    //         }).catch(e => {
    //           this.props.enqueueSnackbar('다시 로그인해주세요.', {variant: 'error'})
    //           this.props.logout()
    //           this.props.history.replace(`/login/`)
    //         })
    //       } else {
    //         this.props.enqueueSnackbar('서버와 연결이 정상적이지 않습니다.', {variant: 'error'})
    //       }
    //       this.setState({nowLoading: false})
    //     })
    // }
  }

  onChangeTitle = (e) => {
    const post = this.state.post
    post.title = e.target.value
    this.setState({post})
  }

  onChangeWriterName = e => {
    const post = this.state.post
    post.writer_name = e.target.value
    this.setState({post})
  }

  onChangePassword = e => {
    const post = this.state.post
    post.password = e.target.value
    this.setState({post})
  }

  onClickSaveButton = () => {
    this.sendData()
  }

  handleSnackbarClose = () => {
    this.setState({open: false})
  }

  onChangePictureButton = (e) => {
    const reader = new FileReader()
    const file = e.target.files[0]
    if(!file.type.match('image.*')) {
      this.props.enqueueSnackbar('이미지 파일만 등록해주세요.', {variant: 'error'})
      return
    }
    reader.readAsDataURL(e.target.files[0])

    const {editorState} = this.state
    const editorStateChanged = this.editorStateChanged
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

  makingEntity = (base64) => {
    const entityKey = Entity.create('image', 'IMMUTABLE', base64)
    const {editorState} = this.state
    const newState = AtomicBlockUtils.insertAtomicBlock(editorState, entityKey, '')

    this.editorStateChanged(newState)
  }

  handleCategory = (e) => {
    const value = e.target.value
    const post = this.state.post
    post.category = value
    this.setState({post,})
  }

  render() {
    const {classes} = this.props
    console.log(this.props.location.type)

    return (
      <div>
        <Backdrop className={classes.backdrop} open={this.state.nowLoading}>
          <CircularProgress color="inherit" />
        </Backdrop>
        <div className={classes.card}>
          {this.props.location.type === 'suggestion' ?
          ''
          :
          <div>
            <InputLabel htmlFor="age-native-simple">카테고리</InputLabel>
            <Select
              native
              value={this.state.post.category}
              onChange={this.handleCategory}
              inputProps={{
                name: 'age',
                id: 'age-native-simple',
              }}
            >
              {this.state.categories.map(category => {
                if(category.name === '건의') {
                  return
                }
                return <option key={category.id} value={category.id}>{category.name}</option>
              })}
              {/* <option value={0}>일반</option>
              <option value={2}>팁/강좌</option>
              <option value={4}>사용기/리뷰</option>
              <option value={3}>질문</option> */}
            </Select>
          </div>
          }
          {this.props.isLogin === false ?
          <Grid container direction='row' justify='space-around'>
            <Grid item xs={6}>
              <TextField
                label='닉네임'
                value={this.state.post.writer_name}
                onChange={this.onChangeWriterName}/>
            </Grid>
            <Grid item xs={6}>
              <TextField
                label='비밀번호'
                type='password'
                value={this.state.post.password}
                onChange={this.onChangePassword}/>
            </Grid>
          </Grid>
          :
          ''
          }
          <TextField
            required
            id="post-title"
            label="제목"
            value={this.state.post.title}
            onChange={this.onChangeTitle}
            fullWidth={true}/>
          <div className={classes.toolbar}>
            <label htmlFor="image_uploads">
              <AddAPhotoIcon/>
            </label>
            <input 
              onChange={this.onChangePictureButton}
              style={{display: "none"}}
              id='image_uploads' name='image_uploads' type="file" ref={`test`}/>
          </div>
          <div
              className={classes.editor}
              onClick={this.focus}
              >
            <Editor
              blockRendererFn={this.imageBlockFn}
              ref='editor'
              editorState={this.state.editorState}
              onChange={this.editorStateChanged}
              />
          </div>
          <CardActions>
            <Button
              className={classes.confirmButton}
              color="primary"
              variant="contained"
              onClick={this.onClickSaveButton}>등록</Button>
          </CardActions>
        </div>
        <script src="http://www.instagram.com/embed.js"></script>
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


export default connect(mapStateToProps, mapDispatchToProps)(withStyles(useStyles, { withTheme: true })(withSnackbar(withRouter(Post))))