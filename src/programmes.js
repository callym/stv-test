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
