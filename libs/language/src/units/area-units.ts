import { UnitOfMeasure } from './known-units';
import { identity } from '../utils';

export const units: UnitOfMeasure[] = [
  {
    name: 'squaremeter',
    abbreviations: ['m2', 'm²'],
    pretty: (n) => `${n} m²`,
    baseQuantity: 'area',
    toBaseQuantity: identity,
    fromBaseQuantity: identity,
  },
  {
    name: 'squarekilometre',
    abbreviations: ['km2', 'km²'],
    pretty: (n) => `${n} km²`,
    baseQuantity: 'area',
    toBaseQuantity: (km2) => km2.mul(1000000),
    fromBaseQuantity: (sqm) => sqm.div(100000),
  },
  {
    name: 'squaremile',
    abbreviations: ['sqmi'],
    pretty: (n) => `${n} sq mi`,
    baseQuantity: 'area',
    toBaseQuantity: (sqmi) => sqmi.mul(2589988110336).div(1000000),
    fromBaseQuantity: (sqm) => sqm.mul(100000).div(2589988110336),
  },
  {
    name: 'squareyard',
    abbreviations: ['sqyd'],
    pretty: (n) => `${n} sq yd`,
    baseQuantity: 'area',
    toBaseQuantity: (sqyd) => sqyd.mul(83612736).div(100000000),
    fromBaseQuantity: (sqm) => sqm.mul(100000000).div(83612736),
  },
  {
    name: 'squarefoot',
    abbreviations: ['sqft'],
    pretty: (n) => `${n} sq ft`,
    baseQuantity: 'area',
    toBaseQuantity: (sqft) => sqft.mul(9290304).div(100000000),
    fromBaseQuantity: (sqm) => sqm.mul(100000000).div(9290304),
  },
  {
    name: 'squareinch',
    abbreviations: ['sqin'],
    pretty: (n) => `${n} sq in`,
    baseQuantity: 'area',
    toBaseQuantity: (sqft) => sqft.mul(64516).div(100000000),
    fromBaseQuantity: (sqm) => sqm.mul(100000000).div(64516),
  },
  {
    name: 'acre',
    abbreviations: ['ac'],
    baseQuantity: 'area',
    toBaseQuantity: (acres) => acres.mul(404686).div(100),
    fromBaseQuantity: (sqm) => sqm.mul(100).div(404686),
  },
  {
    name: 'are',
    abbreviations: ['a'],
    baseQuantity: 'area',
    toBaseQuantity: (ares) => ares.mul(100),
    fromBaseQuantity: (sqm) => sqm.div(100),
  },
  {
    name: 'hectare',
    abbreviations: ['ha'],
    baseQuantity: 'area',
    toBaseQuantity: (hectares) => hectares.mul(10000),
    fromBaseQuantity: (sqm) => sqm.div(10000),
  },
];
