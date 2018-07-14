// @ts-check
import React from 'react';
import ReactDOM from 'react-dom';
import { Col, Form, FormGroup, Label, Input, Table } from 'reactstrap';

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

    /** @type { Programme[] } */
    this.allProgrammes = [];

    /** @type { State } */
    this.state = {
      programmes: [],
    };
  }

  async componentDidMount() {
    const res = await fetch('./programmes.json');
    const data = await res.json();
    const programmes = data.results.map(r => new Programme(r));
    this.allProgrammes = programmes;
    this.setState({ programmes });
  }

  filterProgrammes = (event) => {
    /** @type { string } */
    const text = event.target.value ? event.target.value.toLowerCase() : '';
    let programmes = this.allProgrammes.slice();

    if (text === '') {
      this.setState({ programmes });
      return;
    }

    programmes = programmes.filter(programme => {
      const name = programme.name.toLowerCase();
      return name.includes(text);
    });

    this.setState({ programmes });
  }

  render() {
    return (
      <div>
        <Form>
          <FormGroup row>
            <Label for="search" sm={2}>Search</Label>
            <Col sm={10}>
              <Input type="text" name="search" id="search" onChange={this.filterProgrammes}/>
            </Col>
          </FormGroup>
        </Form>
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
              <ProgrammeComponent programme={programme} key={programme.id}/>
            ))}
          </tbody>
        </Table>
      </div>
    );
  }
}

ReactDOM.render(
  <App/>,
  document.getElementById('root')
);
