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

const generatedNames = () => {
  const tI = Math.floor(Math.random() * Everything.length);
  const wI = Math.floor(Math.random() * PositiveWords.length);
  return `${Math.random() > 0.5 ? PositiveWords[wI] : ''}${Everything[tI]}`;
};

export const generateVarName = (isFlagEnabled = false) => {
  return isFlagEnabled ? generatedNames() : 'Variable';
};

export const generateTableName = (prefix = '') => {
  return `${prefix}Table`;
};

export const generateInputName = () => 'Input';
export const generateSliderName = () => 'Slider';
export const generateDropdownName = () => 'Dropdown';
export const generateColumnName = () => 'Column';
