import React from 'react'
import { withStyles, Paper, TextField, Grid, Link as MLink } from '@material-ui/core';
import { withSnackbar } from 'notistack';
import { withRouter, Link } from 'react-router-dom';
import Axios from 'axios';
import { Pagination, PaginationItem } from '@material-ui/lab';

const useStyles = theme => ({
  mainPaper: {
    marginTop: theme.spacing(2),
    padding: theme.spacing(2)
  },
  divider: {
    margin: theme.spacing(1)
  },
  gridItem: {
    padding: theme.spacing(2)
  },
  imageDiv: {
    // width: theme.spacing(40),
    // height: theme.spacing(40)
  },
  pagination: {
    display: 'flex',
    justifyContent: 'center',
    padding: theme.spacing(1)
  }
});


class MetaSearch extends React.Component {
  state = {
    items: [],
    keyword: '',
    next: '',
    previous: '',
    count: 0,
    pageNumber: 1,
  }

  constructor(props) {
    super(props)
    this.state.keyword = ''
    this.state.pageNumber = 1
    this.state.count = 0
  }

  getDataFromQuerystring = (dataName) => {
    const urlParams = new URLSearchParams(window.location.search);
    const data = urlParams.get(dataName)
    if(data === null) {
      return null
    } else {
      return data
    }
  }

  componentDidMount() {
    const keyword = this.getDataFromQuerystring(`keyword`)
    const pageNumber = this.getDataFromQuerystring(`page`)
    this.setState({keyword, pageNumber})
    if(keyword != null) {
      this.getItmes(keyword, pageNumber)
    }
  }

  getItmes = (keyword, pageNumber) => {
    Axios.get(`${process.env.REACT_APP_SERVERURL}/api/items/?search=${keyword}&page=${pageNumber}`).then((response) => {
      this.setState({
        items: response.data.results,
        next: response.data.next,
        previous: response.data.previous,
        count: response.data.count})
    })
  }
  
  searchKeyInput = (e) => {
    if(e.key === 'Enter' || e.key === '13') {
      // this.setState({keyword: e.target.value})
      // this.getItmes(e.target.value, 1)
      this.props.history.push(`/meta?keyword=${e.target.value}&page=1`)
    }
  }

  componentDidUpdate(prevPros, prevState) {
    if(this.props.location.search !== prevPros.location.search) {
      const keyword = this.getDataFromQuerystring(`keyword`)
      const pageNumber = this.getDataFromQuerystring(`page`)
      this.setState({keyword, pageNumber})
      if(keyword != null) {
        this.getItmes(keyword, pageNumber)
      } else {
        this.setState({items: [], count: 0, pageNumber: 0})
      }
    }
  }

  render() {
    const {classes} = this.props
    return (
      <div>
        <div className={classes.searchPannel}>
          {/* <form onKeyPress={this.searchKeyInput}> */}
            <TextField
              id='search'
              label='search'
              onKeyPress={this.searchKeyInput}/>
          {/* </form> */}
        </div>
        검색 결과 수 : {this.state.count}
        <Paper className={classes.mainPaper}>
        <Grid
                  container
                  ddirection='row'
                  justify='space-between'
                  alignItems='center'>
          {this.state.items.map((item) => (
            <Grid item xs={12} sm={6} lg={3} key={item.name}>
              <MLink
                  // component={`div`}
                  href={item.link}
                  color='inherit'
                  target='_blank'>
              <div className={classes.gridItem}>
                {/* <div>
                  <img src={item.thumbnail} alt={item.name}/>
                </div> */}
                
                  <div className={classes.imageDiv}>
                    <img src={item.thumbnail} alt={item.name}/>
                  </div>
                  <div>
                    {item.store_name}
                  </div>
                  <div>
                    {item.name}
                  </div>
                  <br/>
                  <div>
                    <b>{`${item.price}원`}</b>
                  </div>
                </div>
              </MLink>
            </Grid>
          ))}
          </Grid>       
        </Paper>
        <div className={classes.pagination}>
          <Pagination
            page={parseInt(this.state.pageNumber)}
            count={Math.ceil(this.state.count / 20)}
            shape={`rounded`}
            renderItem={(item) => (
              <PaginationItem
                component={Link}
                to={`/meta?keyword=${this.state.keyword}&page=${item.page}`}
                {...item}
              />
            )}/>
        </div>
      </div>
    )
  }
}

export default withStyles(useStyles, { withTheme: true })(withSnackbar(withRouter(MetaSearch)));