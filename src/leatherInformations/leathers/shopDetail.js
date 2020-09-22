import React from 'react';
import { connect } from 'react-redux';
import { withStyles, Paper, Grid, Divider, Typography } from '@material-ui/core';
import { withRouter } from 'react-router-dom';
import { withSnackbar } from 'notistack';
import Axios from 'axios';
import Comments from '../../component/itemsInformation/comments';
// import TEditor from '../../component/texteditor/editor'
import ItemCommentsEditor from '../../component/itemsInformation/itemCommentsEditor';

const useStyles = theme => ({
  mainContainer: {
    padding: theme.spacing(2)
  },
  Divider: {
    margin: theme.spacing(1)
  }
});

class ShopDetail extends React.Component {
  state = {
    leather_detail: {},
    store: {}
  }

  getShop = () => {
    Axios.get(`${process.env.REACT_APP_SERVERURL}/api/leather-detail/${this.props.match.params.spk}`).then((response) => {
      console.log(response.data)
      this.setState({leather_detail: response.data, store: response.data.store})
    }).catch((e) => {
      this.props.enqueueSnackbar('서버와 통신이 원활하지 않습니다.', {variant: 'error'})
    });
  }

  componentDidMount() {
    this.getShop()
  }

  render () {
    console.log(this.state.leather_detail)
    const { classes } = this.props;
    return (
      <div className={classes.mainContainer}>
        <Grid container spacing={2}>
          <Grid item sm={12} md={3}>
            <div>
              <img src={this.state.leather_detail.image} alt={`이미지`}/>
            </div>
            <Divider className={classes.Divider}/>
            <div>
              <Typography align='center'>{this.state.store.name}</Typography>
            </div>
            <Divider className={classes.Divider}/>
            <div>
              <Typography align='center'>{this.state.leather_detail.price}원</Typography>
            </div>
            <Divider className={classes.Divider}/>
            <div>
              <Typography align='center'>{this.state.leather_detail.sellingPageUrl}</Typography>
            </div>
          </Grid>
          <Grid item sm={12} md={9}>
            <Typography style={{whiteSpace: 'pre-wrap'}}>{this.state.leather_detail.note}</Typography>
          </Grid>
        </Grid>
        <Divider className={classes.Divider}/>
        <Typography>댓글</Typography>
        <Comments type={`leatherDetail`} fk={this.props.match.params.spk}/>
      </div>
    )
  }
}

const mapStateToProps = (state, ownProps) => ({
  isLogin: state.isLogin,
  ownProps
})

export default connect(mapStateToProps)(withStyles(useStyles, { withTheme: true })(withRouter(withSnackbar(ShopDetail))));