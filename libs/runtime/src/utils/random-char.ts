let CHARS = [
  'a',
  'b',
  'c',
  'd',
  'e',
  'f',
  'g',
  'h',
  'i',
  'j',
  'k',
  'l',
  'm',
  'n',
  'o',
  'p',
  'q',
  'r',
  's',
  't',
  'u',
  'w',
  'v',
  'x',
  'y',
  'z',
  ' ',
];
CHARS = CHARS.concat(CHARS.map((c) => c.toUpperCase()));

export default function randomChar(): string {
  const charIndex = Math.floor(Math.random() * CHARS.length);
  return CHARS[charIndex];
}
