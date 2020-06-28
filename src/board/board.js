import React from 'react';
import axios from 'axios';
import moment from 'moment';
import { TableContainer, Table, TableHead, TableRow, TableCell, TableBody, withStyles, Paper } from '@material-ui/core';
import { Pagination, PaginationItem } from '@material-ui/lab'

import { Link } from 'react-router-dom';


const useStyles = theme => ({
  table: {
    minWidth: 650,
  },
});

class Posts extends React.Component {
  state = {
    count: 0,
    posts: [],
    pageNumber: 1
  }

  constructor(props) {
    super(props)
    this.handleChangePage = this.handleChangePage.bind(this)
  }

  getDataFromParameter(dataName) {
    const urlParams = new URLSearchParams(window.location.search);
    const data = urlParams.get(dataName)
    if(data === null) {
      return null
    } else {
      return data
    }
  }

  fetchPostsFromServer() {
    let pageNumber = this.getDataFromParameter('page')
    if (pageNumber == null) {
      pageNumber = 1;
    }
    this.setState({pageNumber})

    axios.get(`http://127.0.0.1:8000/api/posts/?page=${pageNumber}`).then((response) => {
      const posts = response.data.results;
      for(const post of posts) {
        const today = moment().format('YYYY-MM-DD')
        const created_time = moment(post.created_time)
        const createdTimeDate = created_time.format('YYYY-MM-DD')

        if(today === createdTimeDate) {
          post.created_time = created_time.format('H:mm')
        } else {
          post.created_time = created_time.format('YY-MM-DD')
        }
      }
      
      
      const naviCount = response.data.count % 10;
      if (naviCount === 0) {
        this.setState({navigationCount: response.data.count / 10});
      } else {
        this.setState({navigationCount: parseInt(response.data.count / 10, 10) + 1});
      }

      this.setState({posts})
      this.setState({count: response.data.count})
      
    }).catch((e) => {

    });
  }

  componentDidMount() {
    this.fetchPostsFromServer();
  }

  componentDidUpdate(prevPros, prevState) {
    console.log(`${this.state.pageNumber},${prevState.pageNumber}`)
    if(this.state.pageNumber !== prevState.pageNumber) {
      this.fetchPostsFromServer();
    }
  }

  render () {
    const { classes } = this.props;
    return(
      <div>
        <TableContainer component={Paper}>
          <Table className={classes.table} size="small" aria-label="a dense table">
            <TableHead>
              <TableRow>
                <TableCell>#</TableCell>
                <TableCell align="right">제목</TableCell>
                <TableCell align="right">글쓴이</TableCell>
                <TableCell align="right">시간</TableCell>
                <TableCell align="right">조회수</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {this.state.posts.map((row) => (
                
                <TableRow key={row.pk}>
                  {/* <Link to={`/post/${row.pk}`}> */}
                    <TableCell scope="row" >
                      {row.pk}
                    </TableCell>
                    <TableCell align="left">
                      <Link to={`/posts/${row.pk}`} >
                        {row.title}
                      </Link>
                    </TableCell>
                    <TableCell align="right">{row.writer_name}</TableCell>
                    <TableCell align="right">{row.created_time}</TableCell>
                    <TableCell align="right">{row.views}</TableCell>
                  {/* </Link> */}
                </TableRow>
                
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        {/* <TablePagination
          rowsPerPageOptions={[10]}
          component="div"
          count={this.state.count}
          rowsPerPage={10}
          page={this.state.pageNumber - 1}
          onChangePage={this.handleChangePage}
        /> */}
        <Pagination
              page={parseInt(this.state.pageNumber)}
              count={this.state.navigationCount}
              renderItem={(item) => (
                <PaginationItem
                  component={Link}
                  to={`/posts?page=${item.page}`}
                  {...item}
                />
              )}
            />
      </div>
    )
  }
}

export default withStyles(useStyles, { withTheme: true }) (Posts);