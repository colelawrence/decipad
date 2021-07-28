export default function timestamp(): number {
  return Math.round(Date.now() / 1000);
}
