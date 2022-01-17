import Fraction from '@decipad/fraction';
import { identity, F } from '../../utils';
import type { BaseQuantity } from '../known-units';

export interface ExpandTo {
  baseQuantity: BaseQuantity;
  exp: Fraction;
}

export type BaseQuantityExpansion = {
  expandedUnits: ExpandTo[];
  convertToExpanded: (n: Fraction) => Fraction;
};
type Expansions = Record<BaseQuantity, BaseQuantityExpansion>;

export const expansions: Partial<Expansions> = {
  force: {
    expandedUnits: [
      { baseQuantity: 'mass', exp: F(1) },
      { baseQuantity: 'length', exp: F(1) },
      { baseQuantity: 'second', exp: F(-2) },
    ],
    convertToExpanded: (newton) => newton.mul(1000), // mass is kg -> g
  },
  pressure: {
    expandedUnits: [
      { baseQuantity: 'force', exp: F(1) },
      { baseQuantity: 'area', exp: F(-1) },
    ],
    convertToExpanded: (atmospheres) => atmospheres.mul(101325), // atmosphere to Pa
  },
  area: {
    expandedUnits: [{ baseQuantity: 'length', exp: F(2) }],
    convertToExpanded: identity,
  },
  volume: {
    expandedUnits: [{ baseQuantity: 'length', exp: F(3) }],
    convertToExpanded: identity,
  },
  frequency: {
    expandedUnits: [{ baseQuantity: 'second', exp: F(-1) }],
    convertToExpanded: identity,
  },
  energy: {
    expandedUnits: [
      { baseQuantity: 'mass', exp: F(1) },
      { baseQuantity: 'length', exp: F(2) },
      { baseQuantity: 'second', exp: F(-2) },
    ],
    convertToExpanded: (joules) => joules.mul(1000), // mass is kg -> g
  },
  power: {
    expandedUnits: [
      { baseQuantity: 'mass', exp: F(1) },
      { baseQuantity: 'length', exp: F(2) },
      { baseQuantity: 'second', exp: F(-3) },
    ],
    convertToExpanded: (watts) => watts.mul(1000), // mass is kg -> g
  },
  'electric charge': {
    expandedUnits: [
      { baseQuantity: 'second', exp: F(1) },
      { baseQuantity: 'electric current', exp: F(1) },
    ],
    convertToExpanded: identity,
  },
  'luminous flow': {
    expandedUnits: [
      { baseQuantity: 'luminous intensity', exp: F(1) },
      { baseQuantity: 'solid angle', exp: F(1) },
    ],
    convertToExpanded: identity,
  },
  speed: {
    expandedUnits: [
      { baseQuantity: 'length', exp: F(1) },
      { baseQuantity: 'second', exp: F(-1) },
    ],
    convertToExpanded: (kph) => kph.mul(10).div(36),
  },
  voltage: {
    expandedUnits: [
      { baseQuantity: 'mass', exp: F(1) },
      { baseQuantity: 'length', exp: F(2) },
      { baseQuantity: 'second', exp: F(-3) },
      { baseQuantity: 'electric current', exp: F(-1) },
    ],
    convertToExpanded: (volts) => volts.mul(1000), // mass is kg -> g
  },
  'electrical capacitance': {
    expandedUnits: [
      { baseQuantity: 'mass', exp: F(-1) },
      { baseQuantity: 'length', exp: F(-2) },
      { baseQuantity: 'second', exp: F(4) },
      { baseQuantity: 'electric current', exp: F(2) },
    ],
    convertToExpanded: (farads) => farads.div(1000), // mass is kg -> g
  },
  'electrical resistance': {
    expandedUnits: [
      { baseQuantity: 'mass', exp: F(1) },
      { baseQuantity: 'length', exp: F(2) },
      { baseQuantity: 'second', exp: F(-3) },
      { baseQuantity: 'electric current', exp: F(-2) },
    ],
    convertToExpanded: (ohms) => ohms.mul(1000), // mass is kg -> g
  },
  'electrical conductance': {
    expandedUnits: [
      { baseQuantity: 'mass', exp: F(-1) },
      { baseQuantity: 'length', exp: F(-2) },
      { baseQuantity: 'second', exp: F(3) },
      { baseQuantity: 'electric current', exp: F(2) },
    ],
    convertToExpanded: (siemens) => siemens.div(1000), // mass is kg -> g
  },
};
