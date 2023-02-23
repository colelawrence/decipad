export const jsonify = <T>(o: T): T | undefined => {
  try {
    return JSON.parse(JSON.stringify(o));
  } catch (err) {
    return undefined;
  }
};
