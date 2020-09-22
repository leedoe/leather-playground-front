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

class LeatherDetail extends React.Component {
  state = {
    leather: {},
    tannery: {},
    material: {}
  }

  getleatherDetail = () => {
    Axios.get(`${process.env.REACT_APP_SERVERURL}/api/leathers/${this.props.match.params.pk}`).then((response) => {
      console.log(response.data)
      this.setState({leather: response.data, tannery: response.data.tannery, material: response.data.material})
    }).catch((e) => {
      this.props.enqueueSnackbar('서버와 통신이 원활하지 않습니다.', {variant: 'error'})
    });
  }

  setTanningMethodName = (tanningMethod) => {
    switch(tanningMethod) {
      case 0:
        return 'Vegetable'
      case 1:
        return 'Chrome'
      case 2:
        return 'Hybrid'
      default:
        return ''
    }
  }

  componentDidMount() {
    this.getleatherDetail()
  }

  render () {
    const { classes } = this.props;
    return (
      <div className={classes.mainContainer}>
        <Grid container spacing={2}>
          <Grid item sm={12} md={3}>
            <div>
              <img src={this.state.leather.image} alt={`이미지`}/>
            </div>
            <Divider className={classes.Divider}/>
            <div>
              <Typography align='center'>{this.state.leather.name}</Typography>
            </div>
            <Divider className={classes.Divider}/>
            <div>
              <Typography align='center'>{this.state.tannery.name}</Typography>
            </div>
            <Divider className={classes.Divider}/>
            <div>
              <Typography align='center'>{this.setTanningMethodName(this.state.leather.tanning_method)}</Typography>
            </div>
            <Divider className={classes.Divider}/>
            <div>
              <Typography align='center'>{this.state.material.name}</Typography>
            </div>
            <Divider className={classes.Divider}/>
          </Grid>
          <Grid item sm={12} md={9}>
            <Typography style={{whiteSpace: 'pre-wrap'}}>{this.state.leather.explanation}</Typography>
          </Grid>
        </Grid>
        <Divider className={classes.Divider}/>
        <Typography>댓글</Typography>
        <Comments type={`leather`} fk={this.props.match.params.pk}/>
      </div>
    )
  }
}

const mapStateToProps = (state, ownProps) => ({
  isLogin: state.isLogin,
  ownProps
})

export default connect(mapStateToProps)(withStyles(useStyles, { withTheme: true })(withRouter(withSnackbar(LeatherDetail))));