const baseQuantities = [
  {
    quantity: 'length',
    mainUnit: 'meter',
  },
  {
    quantity: 'volume',
    mainUnit: 'liter',
  },
  {
    quantity: 'pressure',
    mainUnit: 'pascal',
  },
  {
    quantity: 'energy',
    mainUnit: 'joule',
  },
  {
    quantity: 'mass',
    mainUnit: 'kilogram',
  },
  {
    quantity: 'temperature',
    mainUnit: 'kelvin',
  },
  {
    quantity: 'time',
    mainUnit: 'second',
  },
  {
    quantity: 'substance',
    mainUnit: 'mole',
  },
  {
    quantity: 'electric current',
    mainUnit: 'ampere',
  },
  {
    quantity: 'luminous intensity',
    mainUnit: 'candela',
  },
  {
    quantity: 'information',
    mainUnit: 'bit',
  },
];

const unitConversions = {
  // length
  inch: {
    to: 'meter',
    convert: (inches) => inches / 39.37,
  },
  angstrom: {
    to: 'meter',
    convert: (angstroms) => angstroms * 1e-10,
  },

  // volume
  quart: {
    to: 'liter',
    convert: (quarts) => quarts / 1.05671,
  },
  gallon: {
    to: 'liter',
    convert: (gallons) => 3.785 * gallons,
  },

  // pressure
  atmosphere: {
    to: 'pascal',
    convert: (atmospheres) => 101325 * atmospheres,
  },
  bar: {
    to: 'pascal',
    convert: (bars) => bars * 100000,
  },
  mmhg: {
    to: 'pascal',
    covert: (mmhg) => mmhg * 133.322,
  },

  // energy
  calorie: {
    to: 'joule',
    convert: (calories) => 4184 * calories,
  },

  // mass
  pound: {
    to: 'kilogram',
    convert: (pounds) => pounds / 2.205,
  },
  ounce: {
    to: 'kilogram',
    convert: (ounces) => ounces / 35.274,
  },
  ton: {
    to: 'kilogram',
    convert: (tons) => tons / 907,
  },

  // temperature
  celcius: {
    to: 'kelvin',
    convert: (celcius) => celcius + 273.15,
  },
  fahrenheit: {
    to: 'kelvin',
    convert: (fahrenheit) => (fahrenheit - 32) * (5 / 9) + 273.15,
  },

  // time
  minute: {
    to: 'second',
    convert: (minutes) => 60 * minutes,
  },
  hour: {
    to: 'second',
    convert: (hours) => 3600 * hours,
  },
  day: {
    to: 'second',
    convert: (days) => 86400 * days,
  },
  week: {
    to: 'second',
    convert: (weeks) => 604800 * weeks,
  },

  // information
  byte: {
    to: 'bit',
    convert: (bytes) => 8 * bytes,
  },
};

const unitAliases = {
  // length
  meters: 'meter',
  meters: 'meter',
  metre: 'meter',
  metres: 'meter',
  angstroms: 'angstrom',

  // volume
  liters: 'liter',
  l: 'liter',
  quarts: 'quart',
  gallons: 'gallon',

  // pressure
  pascals: 'pascal',
  pa: 'pascal',
  atmospheres: 'atmosphere',
  bars: 'bar',
  ounces: 'ounce',
  tons: 'ton',

  // energy
  joules: 'joule',
  j: 'joule',
  calories: 'calorie',

  // mass
  kilograms: 'kilogram',
  kg: 'kilogram',
  pounds: 'pound',
  lb: 'pound',

  // temperature
  kelvins: 'kelvin',
  k: 'kelvin',
  '°c': 'celcius',
  '°F': 'fahrenheit',

  // time
  seconds: 'second',
  s: 'second',
  minutes: 'minute',
  m: 'minute',
  min: 'minute',
  hours: 'hour',
  days: 'day',
  weeks: 'week',

  // substance
  moles: 'mole',
  mol: 'mole',

  // electric current
  amperes: 'ampere',
  a: 'ampere',

  // luminous intensity
  candelas: 'candela',
  cd: 'candela',

  // information
  bits: 'bit',
  bytes: 'byte',

  // energy per time
  watts: 'watt',
};

const knownUnits = Object.entries(unitAliases).reduce(
  (knownUnits, [fromUnit, toUnit]) => {
    knownUnits.add(fromUnit.toLowerCase()),
      knownUnits.add(toUnit.toLowerCase());
    return knownUnits;
  },
  new Set()
);

module.exports.knownUnits = {
  has: (str) => knownUnits.has(str.toLowerCase()),
};
