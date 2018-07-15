// @ts-check
import React from 'react';
import ReactDOM from 'react-dom';
import localforage from 'localforage';
import { Button, Row, Col, Form, FormGroup, Label, Input, Table } from 'reactstrap';

import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';

import { Programme, ProgrammeComponent, EditProgrammeComponent } from './programmes';

const store = localforage.createInstance({ name: 'stv-test' });

/**
 * @typedef { Object } State
 * @property { Map<number, Programme> } allProgrammes
 * @property { Programme[] } programmes
 * @property { Programme } [selectedProgramme]
 * @property { { sortBy: string, ord: string } } sortBy
 * @property { string } filterBy
 * @property { boolean } addModal
 */

 /**
 * @extends {React.Component<{}, State>}
 */
class App extends React.Component {
  constructor(props) {
    super(props);

    /** @type { State } */
    this.state = {
      allProgrammes: new Map(),
      programmes: [],
      sortBy: {
        sortBy: 'id',
        ord: null,
      },
      filterBy: null,
      addModal: false,
    };
  }

  async componentDidMount() {
    let data = await store.getItem('programmes');

    if (data == null) {
      const res = await fetch('./programmes.json');
      const json = await res.json();
      data = json.results;
    }

    let allProgrammes = new Map();
    const programmes = data.map(r => new Programme(r));
    programmes.forEach(p => allProgrammes.set(p.id, p));
    this.setState({ programmes, allProgrammes }, () => this.refreshProgrammesHandler());
  }

  /**
   * @param { Programme[] } programmes
   * @param { Object } event
   * @returns { { programmes: Programme[], filterBy?: string } }
   */
  filterProgrammes(programmes, event) {
    if (event == null && this.state.filterBy == null) {
      return { programmes };
    }

    if (event == null) {
      event = {
        target: {
          value: this.state.filterBy,
        }
      };
    }

    /** @type { string } */
    const text = event.target.value ? event.target.value.toLowerCase() : '';

    if (text === '') {
      return { programmes, filterBy: null };
    }

    programmes = programmes.filter(programme => {
      const name = programme.name.toLowerCase();
      return name.includes(text);
    });

    return { programmes, filterBy: text };
  }

  /**
   * @param { Programme[] } programmes
   * @param { { sortBy: string, ord?: string } } sortBy
   * @returns { { programmes: Programme[], sortBy: Object } }
   */
  sortProgrammes(programmes, sortBy) {
    if (sortBy.ord == null) {
      if (sortBy.sortBy !== this.state.sortBy.sortBy) {
        sortBy.ord = 'asc';
      } else {
        sortBy.ord = this.state.sortBy.ord === 'asc' ? 'desc' : 'asc';
      }
    }

    if (sortBy.sortBy === 'id') {
      programmes.sort((a, b) => {
        if (sortBy.ord === 'asc') {
          return a.id - b.id;
        }
        return b.id - a.id;
      });
    }

    if (sortBy.sortBy === 'name') {
      programmes.sort((a, b) => {
        const aN = a.name.toLowerCase();
        const bN = b.name.toLowerCase();

        if (sortBy.ord === 'asc') {
          if (aN < bN) {
            return -1;
          }
          if (aN > bN) {
            return 1;
          }
          return 0;
        }

        if (aN > bN) {
          return -1;
        }
        if (aN < bN) {
          return 1;
        }
        return 0;
      });
    }

    return { programmes, sortBy };
  }

  /**
   * @param { { sortBy: string, ord?: string } } [sortBy]
   * @param { Object } [event]
   * @returns { Promise<any> }
   */
  refreshProgrammesHandler = (sortBy, event) => {
    if (sortBy == null) {
      sortBy = this.state.sortBy;
    }

    let programmes = Array.from(this.state.allProgrammes.values());

    let sorted = this.sortProgrammes(programmes, sortBy);
    let filtered = this.filterProgrammes(sorted.programmes, event);

    return new Promise((resolve, reject) => this.setState({
      programmes: filtered.programmes,
      sortBy: {
        sortBy: sorted.sortBy.sortBy,
        ord: sorted.sortBy.ord,
      },
      filterBy: filtered.filterBy,
    }, () => resolve()));
  }

  /** @returns { Promise<any> } */
  showAddModal = () => {
    return new Promise((resolve, reject) => this.setState({ addModal: true }, () => resolve()));
  }

  /** @returns { Promise<any> } */
  hideAddModal = () => {
    return new Promise((resolve, reject) => this.setState({ addModal: false, selectedProgramme: null }, () => resolve()));
  }

  /**
   * @param { Programme? } programme
   * @param { Programme? } oldProgramme
   */
  addProgramme = async (programme, oldProgramme) => {
    await this.hideAddModal();

    if (programme == null) {
      return;
    }

    let allProgrammes = new Map(this.state.allProgrammes.entries());

    if (oldProgramme != null) {
      allProgrammes.delete(oldProgramme.id);
    }

    allProgrammes.set(programme.id, programme);

    await new Promise((resolve, reject) => this.setState({ allProgrammes }, async () => {
      await this.refreshProgrammesHandler();
      await this.saveData();
      resolve();
    }));

    await this.hideAddModal();
  }

  /**
   * @param { Programme } programme
   */
  removeProgramme = (programme) => {
    let allProgrammes = new Map(this.state.allProgrammes.entries());
    allProgrammes.delete(programme.id);

    this.setState({ allProgrammes }, async () => {
      await this.refreshProgrammesHandler();
      await this.saveData();
    });
  }

  /**
   * @param { Programme } programme
   */
  selectProgramme = (programme) => {
    this.setState({ selectedProgramme: programme }, () => this.showAddModal());
  }

  /** @returns { Promise<any> } */
  saveData() {
    return store.setItem('programmes', Array.from(this.state.allProgrammes.values()));
  }

  /** @returns { Promise<any> } */
  deleteData() {
    return store.removeItem('programmes');
  }

  deleteDataHandler = async () => {
    await this.deleteData();
    this.componentDidMount();
  }

  render() {
    const up = '↑';
    const down = '↓';

    let sortById = '';
    let sortByName = '';

    const sortBySymbol = () => this.state.sortBy.ord === 'asc' ? up : down;

    if (this.state.sortBy.sortBy === 'id') {
      sortById = sortBySymbol();
    } else if (this.state.sortBy.sortBy === 'name') {
      sortByName = sortBySymbol();
    }

    return (
      <div>
        <Row>
          <Col sm={5}>
            <Button color="success" onClick={this.showAddModal}>
              Add New Programme
            </Button>
          </Col>
          <Col sm={5}>
            <Button color="danger" onClick={this.deleteDataHandler}>
              Delete Local Data
            </Button>
          </Col>
        </Row>
        <Form onSubmit={e => e.preventDefault()}>
          <FormGroup row>
            <Label for="search" sm={2}>Search</Label>
            <Col sm={10}>
              <Input type="text" name="search" id="search" onChange={e => this.refreshProgrammesHandler(null, e)}/>
            </Col>
          </FormGroup>
        </Form>
        <Table>
          <thead>
            <tr>
              <th onClick={() => this.refreshProgrammesHandler({ sortBy: 'id' })}>
                ID
                { sortById }
              </th>
              <th onClick={() => this.refreshProgrammesHandler({ sortBy: 'name' })}>
                Name
                { sortByName }
              </th>
              <th>Description</th>
              <th>Active Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {this.state.programmes.map(programme => (
              <ProgrammeComponent
                programme={programme}
                key={programme.id}
                remove={this.removeProgramme}
                select={this.selectProgramme}
              />
            ))}
          </tbody>
        </Table>
        { this.state.addModal === true ?
          <EditProgrammeComponent
            allProgrammes={this.state.allProgrammes}
            programme={this.state.selectedProgramme}
            onClose={this.addProgramme}/> :
          null
        }
      </div>
    );
  }
}

ReactDOM.render(
  <App/>,
  document.getElementById('root')
);
