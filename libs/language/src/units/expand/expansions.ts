import Fraction from 'fraction.js';
import { identity } from '../../utils';
import type { BaseQuantity } from '../known-units';

export interface ExpandTo {
  baseQuantity: BaseQuantity;
  exp: number;
}

export type BaseQuantityExpansion = {
  expandedUnits: ExpandTo[];
  convertToExpanded: (n: Fraction) => Fraction;
};
type Expansions = Record<BaseQuantity, BaseQuantityExpansion>;

export const expansions: Partial<Expansions> = {
  force: {
    expandedUnits: [
      { baseQuantity: 'mass', exp: 1 },
      { baseQuantity: 'length', exp: 1 },
      { baseQuantity: 'second', exp: -2 },
    ],
    convertToExpanded: (newton) => newton.mul(1000), // mass is kg -> g
  },
  pressure: {
    expandedUnits: [
      { baseQuantity: 'force', exp: 1 },
      { baseQuantity: 'area', exp: -1 },
    ],
    convertToExpanded: (atmospheres) => atmospheres.mul(101325), // atmosphere to Pa
  },
  area: {
    expandedUnits: [{ baseQuantity: 'length', exp: 2 }],
    convertToExpanded: identity,
  },
  volume: {
    expandedUnits: [{ baseQuantity: 'length', exp: 3 }],
    convertToExpanded: identity,
  },
  frequency: {
    expandedUnits: [{ baseQuantity: 'second', exp: -1 }],
    convertToExpanded: identity,
  },
  energy: {
    expandedUnits: [
      { baseQuantity: 'mass', exp: 1 },
      { baseQuantity: 'length', exp: 2 },
      { baseQuantity: 'second', exp: -2 },
    ],
    convertToExpanded: (joules) => joules.mul(1000), // mass is kg -> g
  },
  power: {
    expandedUnits: [
      { baseQuantity: 'mass', exp: 1 },
      { baseQuantity: 'length', exp: 2 },
      { baseQuantity: 'second', exp: -3 },
    ],
    convertToExpanded: (watts) => watts.mul(1000), // mass is kg -> g
  },
  'electric charge': {
    expandedUnits: [
      { baseQuantity: 'second', exp: 1 },
      { baseQuantity: 'electric current', exp: 1 },
    ],
    convertToExpanded: identity,
  },
  voltage: {
    expandedUnits: [
      { baseQuantity: 'mass', exp: 1 },
      { baseQuantity: 'length', exp: 2 },
      { baseQuantity: 'second', exp: -3 },
      { baseQuantity: 'electric current', exp: -1 },
    ],
    convertToExpanded: (volts) => volts.mul(1000), // mass is kg -> g
  },
  'electrical capacitance': {
    expandedUnits: [
      { baseQuantity: 'mass', exp: -1 },
      { baseQuantity: 'length', exp: -2 },
      { baseQuantity: 'second', exp: 4 },
      { baseQuantity: 'electric current', exp: 2 },
    ],
    convertToExpanded: (farads) => farads.div(1000), // mass is kg -> g
  },
  'electrical resistance': {
    expandedUnits: [
      { baseQuantity: 'mass', exp: 1 },
      { baseQuantity: 'length', exp: 2 },
      { baseQuantity: 'second', exp: -3 },
      { baseQuantity: 'electric current', exp: -2 },
    ],
    convertToExpanded: (ohms) => ohms.mul(1000), // mass is kg -> g
  },
  'electrical conductance': {
    expandedUnits: [
      { baseQuantity: 'mass', exp: -1 },
      { baseQuantity: 'length', exp: -2 },
      { baseQuantity: 'second', exp: 3 },
      { baseQuantity: 'electric current', exp: 2 },
    ],
    convertToExpanded: (siemens) => siemens.div(1000), // mass is kg -> g
  },
};
