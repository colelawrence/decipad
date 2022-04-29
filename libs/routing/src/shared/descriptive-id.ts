import { Parser } from 'typesafe-routes';

export interface DescriptiveId {
  readonly id: string;
  // not using ?. but requiring explicit undefined to avoid creating non-pretty paths unless the user types an id-only URL
  readonly name: string | undefined;
}

export const descriptiveIdParser: Parser<DescriptiveId> = {
  serialize: ({ id, name }) => {
    if (id.includes(':')) {
      throw new Error(
        `Id must not include separator character ":", but received the following id that does: ${id}`
      );
    }
    return (name ? `${name.replace(/\W+/g, '-')}:` : '') + id;
  },
  parse: (pathSegment) => {
    // Encoding seems to be done for us, but not decoding, not sure why.
    const [id] = decodeURIComponent(pathSegment).split(':').slice(-1);
    return {
      id,
      // There is probably no use case for retrieving the pretty name back from the URL.
      name: undefined,
    };
  },
};
