import React from 'react'
import {  withStyles, TextField, Button, CardActions, Backdrop, CircularProgress, Paper, InputLabel, Select, Typography } from '@material-ui/core'

const useStyles = theme => ({
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
  }
});

class Main extends React.Component {
  render() {
    const {classes} = this.props

    return (
      <div className={classes.card}>
        <Typography variant="h4">
          Crafters & Makers Ver.2
        </Typography>
        <Typography>
          많은 분들의 참여를 위해서 로그인을 하지 않아도 글을 쓰고 댓글을 작성할 수 있게 수정했습니다.
        </Typography>
        <Typography>
          가죽이나 다른 정보들을 등록하기 위해서는 로그인이 필요하지만 그 안에서 댓글을 다는 것은 로그인 없이도 가능하게 바꾸었습니다.
        </Typography>
        <Typography>
          이제 부담갖지 말고 소통해주세요 :)
        </Typography>
        <br/>
        <Typography>
          수정해야할 정보는 건의 게시판을 이용해주세요!
        </Typography>
      </div>
    )
  }
}

export default withStyles(useStyles, { withTheme: true })(Main)