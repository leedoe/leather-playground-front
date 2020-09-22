import React from 'react';
import axios from 'axios';

import { withSnackbar } from 'notistack';
import { connect } from 'react-redux';
import { Paper, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, withStyles, IconButton, Collapse, Box, makeStyles, Typography, Fab } from '@material-ui/core';
import { withRouter, Link } from 'react-router-dom';

import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@material-ui/icons/KeyboardArrowUp';
import AddIcon from '@material-ui/icons/Add';
import AddCircleIcon from '@material-ui/icons/AddCircle';


const useStyles = theme => ({
  floatingButton: {
    margin: 0,
    top: 'auto',
    right: theme.spacing(3),
    bottom: theme.spacing(3),
    left: 'auto',
    position: 'fixed',
  },
  addIcon: {
    margin: theme.spacing(2)
  }
});

class Leathers extends React.Component {
  state = {
    leathers: []
  }

  getLeathers = () => {
    axios.get(`${process.env.REACT_APP_SERVERURL}/api/leathers`).then((response) => {
      this.setState({leathers: response.data,})
    }).catch((e) => {
      this.props.enqueueSnackbar('서버와 통신이 원활하지 않습니다.', {variant: 'error'})
    });
  }

  componentDidMount() {
    this.getLeathers()
  }

  render () {
    const { classes } = this.props;
    return (
      <div>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell/>
                <TableCell>이름</TableCell>
                <TableCell>테너리</TableCell>
                <TableCell>*</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {this.state.leathers.map((leather) => {
                const row = (<Row leather={leather} key={`row${leather.pk}`}/>)
                return row
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
            to={`/leather/`}>
            <AddIcon/>
          </Fab> :
          ''
        }
      </div>
    )
  }
}

const useRowStyles = makeStyles({
  root: {
    '& > *': {
      borderBottom: 'unset',
    },
  },
});

function Row(props) {
  const { leather } = props;
  const [open, setOpen] = React.useState(false);
  const classes = useRowStyles();

  return (
    <React.Fragment>
      <TableRow className={classes.root}>
        <TableCell>
          <IconButton aria-label="expand row" size="small" onClick={() => setOpen(!open)}>
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell component={Link} to={`/leathers/${leather.pk}`}>{leather.name}</TableCell>
        <TableCell>{leather.tannery.name}</TableCell>
        <TableCell>{leather.material.name}</TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box margin={1}>
              <Typography variant="h6" gutterBottom component="div" style={{display: 'flex', alignItems: 'center'}}>
                Shop
                {/* <AddCircleIcon
                  align='center'
                  style={classes.addIcon}
                  component={Link}
                  to={'/shop/'}/> */}
                <IconButton component={Link} to={{pathname: `/leathers/${leather.pk}/shop/`, leather: {leather}}}>
                  <AddCircleIcon/>
                </IconButton>
                  
              </Typography>
              <Table size="small" aria-label="purchases">
                <TableBody>
                  {leather.leather_details.map((leather_detail) => (
                    <TableRow key={`detail${leather_detail.id}`}>
                      <TableCell component={Link} to={{pathname: `/leathers/${leather.pk}/shops/${leather_detail.id}`, shop: {leather_detail}}}>
                        {leather_detail.store.name}
                      </TableCell>
                      <TableCell>{`${leather_detail.price}원`}</TableCell>
                      <TableCell align="right">{leather_detail.note}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </React.Fragment>
  );
}


const mapStateToProps = (state, ownProps) => ({
  isLogin: state.isLogin,
  ownProps
})

export default connect(mapStateToProps)(withStyles(useStyles, { withTheme: true })(withRouter(withSnackbar(Leathers))));