// @ts-check
import React from 'react';
import classNames from 'classnames';
import { Button, Col, Form, FormGroup, Label, Input, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';

const width = 1024;
const height = 576;

export class Programme {
  get shortDescription() {
    return this.description;
  }

  constructor(data) {
    if (data == null) {
      data = {};
    }

    /** @type { number } */
    this.id = data.id || '';

    /** @type { string } */
    this.slug = data.slug || '';

    /** @type { string } */
    this.name = data.name || '';

    /** @type { string } */
    this.description = data.shortDescription || '';
    if (this.description === '' && data.description != null) {
      this.description = data.description;
    }

    /** @type { boolean } */
    this.active = data.active || false;

    const i = data.images ? data.images[0] : null;
    if (i != null) {
      /** @type { string } */
      this.imageUrl = `https://files.stv.tv/imagebase/${i.masterFilepath}/${width}x${height}/${i.filename}`;
    }
  }
}

/**
 * @typedef { Object } ProgrammeProps
 * @property { Programme } programme
 * @property { (Programme) => void } remove
 * @property { (Programme) => void } select
 */

/**
 * @extends {React.Component<ProgrammeProps, {}>}
 */
export class ProgrammeComponent extends React.Component {
  remove = () => {
    if (this.props.remove != null) {
      this.props.remove(this.props.programme);
    }
  }

  select = () => {
    if (this.props.select != null) {
      this.props.select(this.props.programme);
    }
  }

  render() {
    const classes = classNames({ inactive: this.props.programme.active === false })
    return (
      <tr className={ classes }>
        <td>{ this.props.programme.id }</td>
        <td>{ this.props.programme.name }</td>
        <td>{ this.props.programme.description }</td>
        <td>{ this.props.programme.active ? 'Active' : 'Inactive' }</td>
        <td>
          <Button onClick={this.select} color="primary" size="sm" block>
            ✎
          </Button>
        </td>
        <td>
          <Button onClick={this.remove} color="danger" size="sm" block>
            ×
          </Button>
        </td>
      </tr>
    );
  }
}

/**
 * @typedef { Object } EditProps
 * @property { Programme } [programme]
 * @property { Map<number, Programme> } allProgrammes
 * @property { (Programme?, EditProgrammeComponent) => void } onClose
 */

/**
 * @typedef { Object } EditState
 * @property { { isValid: boolean, message: string } } isValid
 * @property { Programme } programme
 */

/**
 * @extends {React.Component<EditProps, EditState>}
 */
export class EditProgrammeComponent extends React.Component {
  /** @param { EditProps } props */
  constructor(props) {
    super(props);

    const programme = props.programme == null ? new Programme() : props.programme;

    this.state = {
      isValid: this.editProgrammeValid(programme),
      programme,
    };
  }

  /** @param { boolean } success */
  close = (success) => {
    if (success === true) {
      this.props.onClose(this.state.programme, this.props.programme);
    } else {
      this.props.onClose(null, this.props.programme);
    }
  }

  handleEditProgramme = (event) => {
    const name = event.target.name;
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;

    let programme = new Programme(this.state.programme);
    if (programme[name] === undefined) {
      return;
    }

    if (name === 'id') {
      programme[name] = isNaN(+value) ? '' : +value;
    } else {
      programme[name] = value;
    }

    programme[name] = value;

    this.setState({
      programme,
      isValid: this.editProgrammeValid(programme),
    });
  }

  /**
   * @returns { { isValid: boolean, message: string} }
   */
  editProgrammeValid = (data) => {
    if (data.id == null || data.id === '') {
      return { isValid: false, message: 'ID is required.' };
    }

    if (isNaN(+data.id)) {
      return { isValid: false, message: 'ID must be a number.' };
    }

    const programme = this.props.allProgrammes.get(+data.id);
    if (programme != null) {
      if (this.props.programme == null || programme.id !== this.props.programme.id) {
        return { isValid: false, message: `ID must be unique. Conflicts with "${programme.name}".` };
      }
    }

    if (data.name == null || data.name === '') {
      return { isValid: false, message: 'Name is required.' };
    }

    if (data.description == null || data.description === '') {
      return { isValid: false, message: 'Description is required.' };
    }

    if (data.active == null) {
      return { isValid: false, message: 'Internal Error' };
    }

    return { isValid: true, message: '' };
  }

  render() {
    return (
      <Modal isOpen={true} size="lg">
        <ModalHeader>Add Programme</ModalHeader>
        <ModalBody>
          <Form onSubmit={e => e.preventDefault()}>
            <FormGroup row>
              <Label for="id" sm={2}>ID</Label>
              <Col sm={10}>
                <Input type="text" name="id" id="id" value={this.state.programme.id} onChange={this.handleEditProgramme}/>
              </Col>
            </FormGroup>
            <FormGroup row>
              <Label for="name" sm={2}>Name</Label>
              <Col sm={10}>
                <Input type="text" name="name" id="name" value={this.state.programme.name} onChange={this.handleEditProgramme}/>
              </Col>
            </FormGroup>
            <FormGroup row>
              <Label for="description" sm={2}>Description</Label>
              <Col sm={10}>
                <Input type="text" name="description" id="description" value={this.state.programme.description} onChange={this.handleEditProgramme}/>
              </Col>
            </FormGroup>
            <FormGroup row>
              <Col sm={2}/>
              <Col sm={10}>
                <FormGroup check inline>
                  <Label check>
                    <Input type="checkbox" name="active" id="active" checked={this.state.programme.active} onChange={this.handleEditProgramme}/>{' '}
                    Active
                  </Label>
                </FormGroup>
              </Col>
            </FormGroup>
          </Form>
          <div className="text-danger">{ this.state.isValid.message }</div>
        </ModalBody>
        <ModalFooter>
          <Button color="success" onClick={() => this.close(true)} disabled={this.state.isValid.isValid === false}>Add</Button>{' '}
          <Button color="secondary" onClick={() => this.close(false)}>Cancel</Button>
        </ModalFooter>
      </Modal>
    );
  }
}
