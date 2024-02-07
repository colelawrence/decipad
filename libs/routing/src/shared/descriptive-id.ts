import slug from 'slug';
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
    return `${slug(name ?? '', { lower: false })}:${id}`;
  },
  parse: (_pathSegment) => {
    let pathSegment = decodeURIComponent(_pathSegment);
    if (!pathSegment.includes(':')) {
      pathSegment = `:${pathSegment}`;
    }
    const [name, id] = pathSegment.split(':');
    return {
      id,
      name,
    };
  },
};
