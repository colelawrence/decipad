export function toJS(node) {
  try {
    return JSON.parse(JSON.stringify(node));
  } catch (e) {
    console.error('Convert to js failed!!! Return null');
    return null;
  }
}
