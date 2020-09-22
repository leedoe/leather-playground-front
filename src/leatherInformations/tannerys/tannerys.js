import React from 'react';
import { connect } from 'react-redux';
import { withStyles, Paper, Typography, TableContainer, TableHead, TableCell, Table, TableBody, TableRow, Fab } from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';

import { withRouter, Link } from 'react-router-dom';
import { withSnackbar } from 'notistack';
import Axios from 'axios';

const useStyles = theme => ({
  mainContainer: {
    padding: theme.spacing(2)
  },
  floatingButton: {
    margin: 0,
    top: 'auto',
    right: theme.spacing(3),
    bottom: theme.spacing(3),
    left: 'auto',
    position: 'fixed',
  }
});

class Tannerys extends React.Component {
  state = {
    tannerys: []
  }

  getTannerys = () => {
    Axios.get(`${process.env.REACT_APP_SERVERURL}/api/tannerys/`).then((response) => {
      this.setState({tannerys: response.data,})
    }).catch((e) => {
      this.props.enqueueSnackbar('서버와 통신이 원활하지 않습니다.', {variant: 'error'})
    });
  }

  componentDidMount() {
    this.getTannerys()
  }

  render () {
    const { classes } = this.props;
    return (
      <div className={classes.mainContainer}>
        <Typography>테너리</Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>이름</TableCell>
                <TableCell>지역</TableCell>
                {/* <TableCell>*</TableCell> */}
              </TableRow>
            </TableHead>
            <TableBody>
              {this.state.tannerys.map(tannery => {
                return (
                  <TableRow key={tannery.id} component={Link} to={`/tannerys/${tannery.id}`}>
                    <TableCell>{tannery.name}</TableCell>
                    <TableCell>{tannery.nationality}</TableCell>
                    {/* <TableCell>{tannery.explanation}</TableCell> */}
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </TableContainer>
        {
          this.props.isLogin === true ?
          <Fab 
            className={classes.floatingButton}
            color="primary"
            aria-label="edit"
            component={Link}
            to={`/tannery/`}>
            <AddIcon/>
          </Fab> :
          ''
        }
      </div>
    )
  }
}

const mapStateToProps = (state, ownProps) => ({
  isLogin: state.isLogin,
  ownProps
})

export default connect(mapStateToProps)(withStyles(useStyles, { withTheme: true })(withRouter(withSnackbar(Tannerys))));