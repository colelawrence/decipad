import DeciNumber, { N, ONE } from '@decipad/number';
import { identity } from '@decipad/utils';
import type { BaseQuantity } from '../known-units';

export interface ExpandTo {
  baseQuantity: BaseQuantity;
  exp: DeciNumber;
}

export type BaseQuantityExpansion = {
  expandedUnits: ExpandTo[];
  convertToExpanded: (n: DeciNumber) => DeciNumber;
};
type Expansions = Record<BaseQuantity, BaseQuantityExpansion>;

const N_10 = N(10);
const N_36 = N(36);
const N_1000 = N(1000);
const N_101325 = N(101325);

export const expansions: Partial<Expansions> = {
  force: {
    expandedUnits: [
      { baseQuantity: 'mass', exp: ONE },
      { baseQuantity: 'length', exp: ONE },
      { baseQuantity: 'second', exp: N(-2) },
    ],
    convertToExpanded: (newton) => newton.mul(N_1000), // mass is kg -> g
  },
  pressure: {
    expandedUnits: [
      { baseQuantity: 'force', exp: ONE },
      { baseQuantity: 'area', exp: N(-1) },
    ],
    convertToExpanded: (atmospheres) => atmospheres.mul(N_101325), // atmosphere to Pa
  },
  area: {
    expandedUnits: [{ baseQuantity: 'length', exp: N(2) }],
    convertToExpanded: identity,
  },
  volume: {
    expandedUnits: [{ baseQuantity: 'length', exp: N(3) }],
    convertToExpanded: identity,
  },
  frequency: {
    expandedUnits: [{ baseQuantity: 'second', exp: N(-1) }],
    convertToExpanded: identity,
  },
  energy: {
    expandedUnits: [
      { baseQuantity: 'mass', exp: ONE },
      { baseQuantity: 'length', exp: N(2) },
      { baseQuantity: 'second', exp: N(-2) },
    ],
    convertToExpanded: (joules) => joules.mul(N_1000), // mass is kg -> g
  },
  power: {
    expandedUnits: [
      { baseQuantity: 'mass', exp: ONE },
      { baseQuantity: 'length', exp: N(2) },
      { baseQuantity: 'second', exp: N(-3) },
    ],
    convertToExpanded: (watts) => watts.mul(N_1000), // mass is kg -> g
  },
  'electric charge': {
    expandedUnits: [
      { baseQuantity: 'second', exp: ONE },
      { baseQuantity: 'electric current', exp: ONE },
    ],
    convertToExpanded: identity,
  },
  'luminous flow': {
    expandedUnits: [
      { baseQuantity: 'luminous intensity', exp: ONE },
      { baseQuantity: 'solid angle', exp: ONE },
    ],
    convertToExpanded: identity,
  },
  speed: {
    expandedUnits: [
      { baseQuantity: 'length', exp: ONE },
      { baseQuantity: 'second', exp: N(-1) },
    ],
    convertToExpanded: (kph) => kph.mul(N_10).div(N_36),
  },
  voltage: {
    expandedUnits: [
      { baseQuantity: 'mass', exp: ONE },
      { baseQuantity: 'length', exp: N(2) },
      { baseQuantity: 'second', exp: N(-3) },
      { baseQuantity: 'electric current', exp: N(-1) },
    ],
    convertToExpanded: (volts) => volts.mul(N_1000), // mass is kg -> g
  },
  'electrical capacitance': {
    expandedUnits: [
      { baseQuantity: 'mass', exp: N(-1) },
      { baseQuantity: 'length', exp: N(-2) },
      { baseQuantity: 'second', exp: N(4) },
      { baseQuantity: 'electric current', exp: N(2) },
    ],
    convertToExpanded: (farads) => farads.div(N_1000), // mass is kg -> g
  },
  'electrical resistance': {
    expandedUnits: [
      { baseQuantity: 'mass', exp: ONE },
      { baseQuantity: 'length', exp: N(2) },
      { baseQuantity: 'second', exp: N(-3) },
      { baseQuantity: 'electric current', exp: N(-2) },
    ],
    convertToExpanded: (ohms) => ohms.mul(N_1000), // mass is kg -> g
  },
  'electrical conductance': {
    expandedUnits: [
      { baseQuantity: 'mass', exp: N(-1) },
      { baseQuantity: 'length', exp: N(-2) },
      { baseQuantity: 'second', exp: N(3) },
      { baseQuantity: 'electric current', exp: N(2) },
    ],
    convertToExpanded: (siemens) => siemens.div(N_1000), // mass is kg -> g
  },
};
