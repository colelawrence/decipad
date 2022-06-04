/**
 * Set a slate fragment value in the data transfer.
 */
export const setSlateFragment = (data: DataTransfer, value: unknown) => {
  const string = JSON.stringify(value);
  const encoded = window.btoa(encodeURIComponent(string));
  data.setData('application/x-slate-fragment', encoded);
};
