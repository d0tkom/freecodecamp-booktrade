import React, { Component } from 'react';
import './App.css';
import { Menu, Dropdown } from 'semantic-ui-react';
import BookList from './BookList';
import BookForm from './BookForm';
import ProfileForm from './ProfileForm';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {activeItem: 'books', user: undefined, books: [], title: "", myBooks: []};
  }

  handleItemClick = (e, { name }) => {
    switch(name) {
      case 'my books':
        this.getMyBooks();
        break;
      case 'books':
        this.getBooks();
        break;
    }
    this.setState({ activeItem: name });
  }

  componentWillMount() {
    this.getUser();
    this.getBooks();
  }
  
  isLoggedIn = () => {
    return (this.state.user && this.state.user.google);
  }

  getBooks = (my) => {
    fetch('/api/books')
    .then((res) => {
      return res.json();
    }).then((data) => {
      this.setState({books: data.books});
      if (this.isLoggedIn()) {
        fetch('/api/books/my', {credentials: 'include'})
        .then((res) => {
          return res.json();
        }).then((data) => {
          this.setState({myBooks: data.books});
        })
      }
    });
  }

  getMyBooks = () => {
    fetch('/api/books/my', {credentials: 'include'})
    .then((res) => {
      return res.json();
    }).then((data) => {
      this.setState({books: data.books});
    })
  }
  
  getUser = () => {
    fetch('/user', {credentials: 'include'})
      .then((res) => {
        if (!res.redirected) {
          return res.json(); 
        }
      }).then((data) => {
        this.setState({user: data});
      })
  }

  handleTrade = (id1, id2) => {
    fetch('/api/books/' + id1 + '/trade/' + id2, {
      method: "post",
      credentials: 'include'
    })
    .then((response) => {
      if (response.status == 200) {
        alert("success");
        this.getBooks();
      }
      else {
        alert("sorry cannot do")
      }
    })
  }

  tradeAction = (action, id1, id2) => {
    fetch('/api/books/' + id1 + '/trade/' + id2, {
      method: action,
      credentials: 'include'
    })
    .then((response) => {
      if (response.status == 200) {
        alert("success");
        this.getMyBooks();
      }
      else {
        alert("sorry cannot do")
      }
    })
  }

  handleSubmit = (event) => {
    fetch('/api/books', {
      headers: { 'content-type': 'application/json' },
      method: "post",
      body: JSON.stringify({book: {title: this.state.title}}),
      credentials: 'include'
    })
    .then(response => response.json().then(json => ({ json, response })))
    .then(({ json, response }) => {
      if (!response.ok) {
        return Promise.reject(json);
      }
      this.getMyBooks();
      this.setState({activeItem: 'my books'});
      return json;
    })
    .then(
      response => response,
      error => error
    );
  }

  handleUserSubmit = (event) => {
    fetch('/api/user', {
      headers: { 'content-type': 'application/json' },
      method: "put",
      body: JSON.stringify({user: this.state.user}),
      credentials: 'include'
    })
    .then(response => response.json().then(json => ({ json, response })))
    .then(({ json, response }) => {
      if (!response.ok) {
        return Promise.reject(json);
      }
      this.getMyBooks();
      this.setState({activeItem: 'my books'});
      return json;
    })
    .then(
      response => response,
      error => error
    );
  }

  handleChange = (event) => {
    this.setState({title: event.target.value});
  }

  handleUserChange = (event) => {
    var newUser = {...this.state.user};
    newUser[event.target.id] = event.target.value;
    this.setState({user: newUser});
  }

  render() {
    const { activeItem } = this.state

    return (
      <div>
        <Menu pointing secondary>
          <Menu.Item header>Book Trade</Menu.Item>
          <Menu.Menu position='right'>
            <Menu.Item name='books' active={activeItem === 'books'} onClick={this.handleItemClick} />
            {this.isLoggedIn() ? 
              <Menu.Item name='my books' active={activeItem === 'my books'} onClick={this.handleItemClick} /> :
              ""            
            }
            {this.isLoggedIn() ?
              <Menu.Item name='add book' active={activeItem === 'add book'} onClick={this.handleItemClick} /> :   
              ""                       
            }
            {this.isLoggedIn() ? 
              <Dropdown item text='Account'>
                <Dropdown.Menu>
                  <Dropdown.Item name='profile' onClick={this.handleItemClick}>Profile</Dropdown.Item>
                  <Dropdown.Item onClick={() => window.location.replace('/logout')}>Logout</Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown> :
              <Menu.Item name='login' active={activeItem === 'login'} onClick={() => window.location.replace('/auth/google')} />
            }
          </Menu.Menu>
        </Menu>
        <div style={{margin: 20}}>
            {this.state.activeItem == 'add book' ?
              <BookForm title={this.state.title} change={this.handleChange} submit={this.handleSubmit}/> :
            this.state.activeItem == 'profile' ?
              <ProfileForm user={this.state.user} change={this.handleUserChange} submit={this.handleUserSubmit}/> :
            this.state.activeItem == 'my books' ?
              <BookList books={this.state.books } user={this.state.user} trade={this.tradeAction}/> :
              <BookList books={this.state.books} myBooks={this.state.myBooks} trade={this.handleTrade} user={this.state.user}/>
            }
        </div>
      </div>
    );
  }
}

function isEmpty(obj) {
    for(var key in obj) {
        if(obj.hasOwnProperty(key))
            return false;
    }
    return true;
}

export default App;
