import React from 'react';
import { connect } from 'react-redux';
import { withStyles, Paper, Typography, TableContainer, TableHead, TableCell, Table, TableBody, TableRow, Fab } from '@material-ui/core';
import { withRouter, Link } from 'react-router-dom';
import { withSnackbar } from 'notistack';
import AddIcon from '@material-ui/icons/Add';
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

class Materials extends React.Component {
  state = {
    materials: []
  }

  getMaterials = () => {
    Axios.get(`${process.env.REACT_APP_SERVERURL}/api/materials/`).then((response) => {
      this.setState({materials: response.data,})
    }).catch((e) => {
      this.props.enqueueSnackbar('서버와 통신이 원활하지 않습니다.', {variant: 'error'})
    });
  }

  componentDidMount() {
    this.getMaterials()
  }

  render () {
    const { classes } = this.props;
    return (
      <div className={classes.mainContainer}>
        <Typography>가죽 재료</Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>이름</TableCell>
                <TableCell>설명</TableCell>
                {/* <TableCell>*</TableCell> */}
              </TableRow>
            </TableHead>
            <TableBody>
              {this.state.materials.map(material => {
                return (
                  <TableRow key={material.id} component={Link} to={`/materials/${material.id}`}>
                    <TableCell>{material.name}</TableCell>
                    <TableCell>{material.explanation}</TableCell>
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
            to={`/material/`}>
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

export default connect(mapStateToProps)(withStyles(useStyles, { withTheme: true })(withRouter(withSnackbar(Materials))));