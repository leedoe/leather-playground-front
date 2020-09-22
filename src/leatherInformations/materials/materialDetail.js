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

class MaterialDetail extends React.Component {
  state = {
    material: {}
  }

  getMaterialDetail = () => {
    Axios.get(`${process.env.REACT_APP_SERVERURL}/api/materials/${this.props.match.params.pk}`).then((response) => {
      this.setState({material: response.data,})
    }).catch((e) => {
      this.props.enqueueSnackbar('서버와 통신이 원활하지 않습니다.', {variant: 'error'})
    });
  }

  componentDidMount() {
    this.getMaterialDetail()
  }

  render () {
    const { classes } = this.props;
    return (
      <div className={classes.mainContainer}>
        <Grid container spacing={2}>
          <Grid item sm={12} md={3}>
            <div>
              <img src={this.state.material.image} alt={`이미지`}/>
            </div>
            <Divider className={classes.Divider}/>
            <div>
              <Typography align='center'>{this.state.material.name}</Typography>
            </div>
          <Divider className={classes.Divider}/>
          </Grid>
          <Grid item sm={12} md={9}>
            <Typography style={{whiteSpace: 'pre-wrap'}}>{this.state.material.explanation}</Typography>
          </Grid>
        </Grid>
        <Divider className={classes.Divider}/>
        <Typography>댓글</Typography>
        <Comments type={`material`} fk={this.props.match.params.pk}/>
      </div>
    )
  }
}

const mapStateToProps = (state, ownProps) => ({
  isLogin: state.isLogin,
  ownProps
})

export default connect(mapStateToProps)(withStyles(useStyles, { withTheme: true })(withRouter(withSnackbar(MaterialDetail))));