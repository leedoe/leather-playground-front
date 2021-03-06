import React from 'react'
import { withStyles, Paper, TextField, Grid, Link as MLink } from '@material-ui/core';
import { withSnackbar } from 'notistack';
import { withRouter, Link } from 'react-router-dom';
import Axios from 'axios';
import { Pagination, PaginationItem } from '@material-ui/lab';

const useStyles = theme => ({
  paper: {
    padding: theme.spacing(2)
  },
  divider: {
    margin: theme.spacing(1)
  },
  itemsDiv: {
    marginTop: theme.spacing(2)
  },
  pagination: {
    display: 'flex',
    justifyContent: 'center',
    paddingTop: theme.spacing(2)
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
      window.scrollTo(0, 0)
    }
  }

  render() {
    const {classes} = this.props
    return (
      <Paper className={classes.paper}>
        <div className={classes.searchPannel}>
          <TextField
            id='search'
            label='search'
            onKeyPress={this.searchKeyInput}/>
        </div>
        검색 결과 수 : {this.state.count}
        { this.state.items.length === 0 ? '' :
        <div className={classes.itemsDiv}>
          <div>
            <Grid
                  container
                  ddirection='row'
                  justify='space-between'
                  alignItems='center'
                  spacing={2}>
            {this.state.items.map((item) => (
              <Grid item xs={12} sm={6} lg={3} key={item.name}>
                <MLink
                    href={item.link}
                    color='inherit'
                    target='_blank'>
                  <div>
                    <div>
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
          </div>
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
        }
      </Paper>
    )
  }
}

export default withStyles(useStyles, { withTheme: true })(withSnackbar(withRouter(MetaSearch)));