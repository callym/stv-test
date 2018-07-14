// @ts-check
import React from 'react';
import ReactDOM from 'react-dom';
import { Table } from 'reactstrap';

import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';

import { Programme, ProgrammeComponent } from './programmes';

/**
 * @typedef { Object } State
 * @property { Programme[] } programmes
 */

 /**
 * @extends {React.Component<{}, State>}
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
      <Table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Description</th>
            <th>Active Status</th>
          </tr>
        </thead>
        <tbody>
          {this.state.programmes.map(programme => (
            <ProgrammeComponent programme={programme}/>
          ))}
        </tbody>
      </Table>
    );
  }
}

ReactDOM.render(
  <App/>,
  document.getElementById('root')
);
