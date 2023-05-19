import stringify from 'json-stringify-safe';
/**
 * Set a slate fragment value in the data transfer.
 */
export const setSlateFragment = (data: DataTransfer, value: unknown) => {
  const string = stringify(value);
  const encoded = window.btoa(encodeURIComponent(string));
  data.setData('application/x-slate-fragment', encoded);
  // This is needed to make it draggable.
  data.setData('text', '');
};
