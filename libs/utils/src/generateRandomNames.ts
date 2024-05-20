const Fruits = [
  'Orange',
  'Lime',
  'Apple',
  'Cherry',
  'Mulberry',
  'Lemon',
  'Mango',
  'Peach',
  'Grape',
  'Banana',
];

const Animals = [
  'Cat',
  'Dog',
  'Rabbit',
  'Panda',
  'Koala',
  'Otter',
  'Hedgehog',
  'Seal',
  'Panda',
  'Chipmunk',
];

const PositiveWords = [
  'Up',
  'Joy',
  'Hope',
  'Kind',
  'Calm',
  'Nice',
  'Good',
  'Pure',
  'True',
  'Gift',
];

const Everything = [...Animals, ...Fruits];

export const generatedNames = () => {
  const tI = Math.floor(Math.random() * Everything.length);
  const wI = Math.floor(Math.random() * PositiveWords.length);
  return `${Math.random() > 0.5 ? PositiveWords[wI] : ''}${Everything[tI]}`;
};
