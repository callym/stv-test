// @ts-check
import React from 'react';
import classNames from 'classnames';

const width = 1024;
const height = 576;

export class Programme {
  constructor(data) {
    /** @type { number } */
    this.id = data.id;

    /** @type { string } */
    this.slug = data.slug;

    /** @type { string } */
    this.name = data.name;

    /** @type { string } */
    this.description = data.shortDescription;

    /** @type { boolean } */
    this.active = data.active;

    const i = data.images ? data.images[0] : null;
    if (i != null) {
      /** @type { string } */
      this.imageUrl = `https://files.stv.tv/imagebase/${i.masterFilepath}/${width}x${height}/${i.filename}`;
    }
  }
}

/**
 * @typedef { Object } Props
 * @property { Programme } programme
 */

/**
 * @extends {React.Component<Props, {}>}
 */
export class ProgrammeComponent extends React.Component {
  render() {
    const classes = classNames({ inactive: this.props.programme.active === false })
    return (
      <tr className={ classes }>
        <td>{ this.props.programme.id }</td>
        <td>{ this.props.programme.name }</td>
        <td>{ this.props.programme.description }</td>
        <td>{ this.props.programme.active ? 'Active' : 'Inactive' }</td>
      </tr>
    );
  }
}
