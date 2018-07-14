// @ts-check
import React from 'react';
import ReactDOM from 'react-dom';
import { Button, Col, Form, FormGroup, Label, Input, Modal, ModalHeader, ModalBody, ModalFooter, Table } from 'reactstrap';

import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';

import { Programme, ProgrammeComponent } from './programmes';

/**
 * @typedef { Object } State
 * @property { Programme[] } programmes
 * @property { boolean } addModal
 * @property { { isValid: boolean, message: string} } addProgrammeFormValid
 * @property { Object } addProgrammeForm
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
      addModal: false,
      addProgrammeForm: {
        active: false,
      },
      addProgrammeFormValid: this.addProgrammeValid({ id: null }),
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
    let programmes = this.allProgrammes.slice();

    if (event == null) {
      this.setState({ programmes });
      return;
    }

    /** @type { string } */
    const text = event.target.value ? event.target.value.toLowerCase() : '';

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

  showAddModal = () => {
    this.setState({ addModal: true });
  }

  hideAddModal = () => {
    this.setState({ addModal: false });
  }

  handleAddProgramme = (event) => {
    const name = event.target.name;
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;

    const addProgrammeForm = {
      ...this.state.addProgrammeForm,
      [name]: value,
    };

    this.setState({
      addProgrammeForm,
      addProgrammeFormValid: this.addProgrammeValid(addProgrammeForm),
    });
  }

  addProgramme = () => {
    const programme = new Programme(this.state.addProgrammeForm);
    this.allProgrammes.push(programme);
    this.filterProgrammes();
    this.hideAddModal();
  }

  /**
   * @param { Programme } programme
   */
  removeProgramme = (programme) => {
    this.allProgrammes = this.allProgrammes.filter(p => p.id !== programme.id);
    this.filterProgrammes();
  }

  /**
   * @returns { { isValid: boolean, message: string} }
   */
  addProgrammeValid = (data) => {
    if (data.id == null) {
      return { isValid: false, message: 'ID is required.' };
    }

    if (isNaN(+data.id)) {
      return { isValid: false, message: 'ID must be a number.' };
    }

    const programme = this.allProgrammes.find(p => p.id == data.id);
    if (programme != null) {
      return { isValid: false, message: `ID must be unique. Conflicts with "${programme.name}".` };
    }

    if (data.name == null) {
      return { isValid: false, message: 'Name is required.' };
    }

    if (data.shortDescription == null) {
      return { isValid: false, message: 'Description is required.' };
    }

    if (data.active == null) {
      return { isValid: false, message: 'Internal Error' };
    }

    return { isValid: true, message: '' };
  }

  render() {
    return (
      <div>
        <Form onSubmit={e => e.preventDefault()}>
          <FormGroup row>
            <Label for="search" sm={2}>Search</Label>
            <Col sm={8}>
              <Input type="text" name="search" id="search" onChange={this.filterProgrammes}/>
            </Col>
            <Button color="success" onClick={this.showAddModal}>
              Add
            </Button>
          </FormGroup>
        </Form>
        <Table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Description</th>
              <th>Active Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {this.state.programmes.map(programme => (
              <ProgrammeComponent programme={programme} key={programme.id} remove={this.removeProgramme}/>
            ))}
          </tbody>
        </Table>
        <Modal isOpen={this.state.addModal}>
          <ModalHeader>Add Programme</ModalHeader>
          <ModalBody>
            <Form onSubmit={e => e.preventDefault()}>
              <FormGroup row>
                <Label for="id" sm={2}>ID</Label>
                <Col sm={10}>
                  <Input type="text" name="id" id="id" onChange={this.handleAddProgramme}/>
                </Col>
              </FormGroup>
              <FormGroup row>
                <Label for="name" sm={2}>Name</Label>
                <Col sm={10}>
                  <Input type="text" name="name" id="name" onChange={this.handleAddProgramme}/>
                </Col>
              </FormGroup>
              <FormGroup row>
                <Label for="shortDescription" sm={2}>Description</Label>
                <Col sm={10}>
                  <Input type="text" name="shortDescription" id="shortDescription" onChange={this.handleAddProgramme}/>
                </Col>
              </FormGroup>
              <FormGroup row>
                <Label for="active" sm={2}>Active</Label>
                <Col sm={10}>
                  <FormGroup check inline>
                    <Label check>
                      <Input type="checkbox" name="active" id="active" onChange={this.handleAddProgramme}/>{' '}
                      Check me out
                    </Label>
                  </FormGroup>
                </Col>
              </FormGroup>
            </Form>
            <div className="text-danger">{ this.state.addProgrammeFormValid.message }</div>
          </ModalBody>
          <ModalFooter>
            <Button color="success" onClick={this.addProgramme} disabled={this.state.addProgrammeFormValid.isValid === false}>Add</Button>{' '}
            <Button color="secondary" onClick={this.hideAddModal}>Cancel</Button>
          </ModalFooter>
        </Modal>
      </div>
    );
  }
}

ReactDOM.render(
  <App/>,
  document.getElementById('root')
);
