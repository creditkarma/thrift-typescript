import { getTypeDefs } from './get';

export function validateTypes(idl) {
  const typedefs = getTypeDefs(idl);

  typedefs.forEach((typedef) => {
    if (!typedef.type) {
      throw new Error(`Unable to find typedef: ${typedef.originalType}`);
    }
  });
}