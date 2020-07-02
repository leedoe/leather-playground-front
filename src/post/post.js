import React from 'react'
import ReactQuill, {Quill} from 'react-quill'
import 'react-quill/dist/quill.snow.css'
import { Card, CardHeader, CardContent, withStyles, TextField, Button, CardActions } from '@material-ui/core'

import '../post/post.css'

const useStyles = theme => ({
  confirmButton: {
    // padding: theme.spacing(2),
    marginLeft: 'auto'
  },
  card: {
    margin: '0 auto',
    [theme.breakpoints.up('sm')]: {
      width: "70%"
    }
  }
});

class Post extends React.Component {
  state = {
    value: ''
  }

  constructor(props) {
    super(props)
    this.valueOnChange = this.valueOnChange.bind(this)
  }

  valueOnChange(e) {
    this.setState({value: e})
    console.log(e)
  }

  render() {
    const {classes} = this.props
    return (
      <Card className={classes.card}>
        <CardContent>
          <TextField
            required
            id="post-title"
            label="제목"
            fullWidth={true}/>
        </CardContent>
        <ReactQuill theme='snow' value={this.state.value} onChange={this.valueOnChange}/>
        <CardActions>
          <Button
            className={classes.confirmButton}
            color="primary"
            variant="contained">저장</Button>
        </CardActions>
      </Card>
    )
  }
}

export default withStyles(useStyles, { withTheme: true })(Post);