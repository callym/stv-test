// @ts-check
import React from 'react';
import ReactDOM from 'react-dom';
import { ListGroup, ListGroupItem } from 'reactstrap';

import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';

import { Programme } from './programmes';

/**
 * @typedef { { programmes: Programme[] } } State
 */

class App extends React.Component {
  constructor(props) {
    super(props);

    /** @type { State } */
    this.state = {
      programmes: [],
    };
  }

  async componentDidMount() {
    const res = await fetch('./programmes.json');
    const data = await res.json();
    const programmes = data.results.map(r => new Programme(r));
    this.setState({ programmes });
  }

  render() {
    return (
      <ListGroup>
        {this.state.programmes.map(p => (
          <ListGroupItem>
            {p.name}
          </ListGroupItem>
        ))}
      </ListGroup>
    );
  }
}

ReactDOM.render(
  <App/>,
  document.getElementById('root')
);
