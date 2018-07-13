import React from 'react';
import ReactDOM from 'react-dom';

import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';

function HelloWorld(props) {
  return (
    <div>Hello, World!</div>
  );
}

// ========================================

ReactDOM.render(
  <HelloWorld />,
  document.getElementById('root')
);
