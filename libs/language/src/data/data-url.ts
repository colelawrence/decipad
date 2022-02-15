export function dataURL(data: Buffer, contentType: string): string {
  return `data:${contentType};base64,${data.toString('base64')}`;
}
