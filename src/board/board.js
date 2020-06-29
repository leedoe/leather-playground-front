import React from 'react';
import axios from 'axios';
import moment from 'moment';
import { withStyles, List, ListItem, ListItemText } from '@material-ui/core';
import { Pagination, PaginationItem } from '@material-ui/lab'

import { Link } from 'react-router-dom';


const useStyles = theme => ({
  root: {
    width: '100%',
    backgroundColor: theme.palette.background.paper,
  }
});

class Posts extends React.Component {
  state = {
    count: 0,
    posts: [],
    pageNumber: 1
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
    if(this.props.location.search !== prevPros.location.search) {
      this.fetchPostsFromServer();
    }
  }

  render () {
    const { classes } = this.props;
    return(
      <div className={classes.root}>
        <List>
          {this.state.posts.map((row) => (
            <ListItem component={Link} to={`/posts/${row.pk}`} key={row.pk}>
              <ListItemText 
                primary={row.title}
                secondary={row.writer_name}/>
            </ListItem>
          ))}
        </List>
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