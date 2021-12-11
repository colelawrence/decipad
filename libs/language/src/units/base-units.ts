import { BaseQuantity } from './known-units';

const baseQuantityToBaseUnit: Record<BaseQuantity, string> = {
  length: 'meter',
  area: 'squaremeter',
  volume: 'cubicmeter',
  pressure: 'atmosphere',
  force: 'newton',
  energy: 'joule',
  mass: 'gram',
  temperature: 'kelvin',
  second: 'second',
  month: 'month',
  substance: 'mole',
  'electric current': 'ampere',
  'electric charge': 'coulomb',
  voltage: 'volt',
  power: 'watt',
  'electrical capacitance': 'farad',
  'electrical resistance': 'ohm',
  'electrical conductance': 'siemens',
  frequency: 'hertz',
  information: 'bit',
  'luminous intensity': 'candela',
  'luminous flow': 'lumen',
  'solid angle': 'steradian',
  EUR: 'EUR',
  USD: 'USD',
  GBP: 'GBP',
  SEK: 'SEK',
};

export function baseUnitForBaseQuantity(baseQuantity: BaseQuantity): string {
  return baseQuantityToBaseUnit[baseQuantity];
}
