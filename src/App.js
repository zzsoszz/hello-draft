import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import MyEditor from "./MyEditor";
class App extends Component {
  render() {
    return (
        <div>
            <MyEditor />
        </div>
    );
  }
}

export default App;
