export function tableFlip(arr: Array<object>) {
  // eslint-disable-next-line
  const obj = {} as any;
  for (const item of arr) {
    for (const key of Object.keys(item)) {
      obj[key] = [];
    }
  }

  for (const item of arr) {
    for (const [k, v] of Object.entries(item)) {
      switch (typeof v) {
        case 'function':
        case 'undefined':
        case 'object':
        case 'symbol':
          break;
        default:
          obj[k].push(v);
      }
    }
  }

  return obj;
}
