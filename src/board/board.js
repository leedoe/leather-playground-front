import React from 'react';
import axios from 'axios';
import moment from 'moment';
import { TableContainer, Table, TableHead, TableRow, TableCell, TableBody, withStyles, Paper, TablePagination } from '@material-ui/core';

import PostDetail from '../postDetail/postDetail'
import { Link } from 'react-router-dom';


const useStyles = theme => ({
  table: {
    minWidth: 650,
  },
});

class Board extends React.Component {
  state = {
    count: 0,
    posts: [],
    pageNumber: 1
  }

  constructor(props) {
    super(props)
    this.handleChangePage = this.handleChangePage.bind(this)
  }

  fetchPostsFromServer() {
    axios.get(`http://127.0.0.1:8000/api/posts/?page=${this.state.pageNumber}`).then((response) => {
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
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    let pageNumber = urlParams.get('page');
    if (pageNumber == null) {
      pageNumber = 1;
    }
    this.setState({pageNumber})

    this.fetchPostsFromServer();
  }

  componentDidUpdate(prevPros, prevState) {
    if(this.state.pageNumber !== prevState.pageNumber) {
      this.fetchPostsFromServer();
    }
  }

  handleChangePage = (event, page) => {
    // window.location.href=`/board?page=${page + 1}`;
    window.history.pushState({}, '', `/board?page=${page + 1}`)
    this.setState({pageNumber: page + 1})
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
                    <TableCell component={Link} to={`/post/${row.pk}`} align="left">{row.title}</TableCell>
                    <TableCell align="right">{row.writer_name}</TableCell>
                    <TableCell align="right">{row.created_time}</TableCell>
                    <TableCell align="right">{row.views}</TableCell>
                  {/* </Link> */}
                </TableRow>
                
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[10]}
          component="div"
          count={this.state.count}
          rowsPerPage={10}
          page={this.state.pageNumber - 1}
          onChangePage={this.handleChangePage}
        />
      </div>
    )
  }
}

export default withStyles(useStyles, { withTheme: true }) (Board);