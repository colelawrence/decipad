import pluralize, { singular, plural, addIrregularRule } from 'pluralize';
import * as LenghtUnits from './units/length-units';
import * as AreaUnits from './units/area-units';
import * as VolumeUnits from './units/volume-units';

const duplicates: Record<string, string> = {};

[LenghtUnits, AreaUnits, VolumeUnits].map(function Iter(x) {
  x.units.map((unit) => {
    if (duplicates[unit.name]) {
      throw new Error(`Trying to declare twice ${unit.name}`);
    }
    duplicates[unit.name] = unit.name;
    (unit.abbreviations || []).forEach((abbr) => {
      if (duplicates[abbr]) {
        throw new Error(`Trying to declare twice ${abbr}`);
      }
      addIrregularRule(abbr.toLowerCase(), abbr.toLowerCase());
      duplicates[abbr] = abbr;
    });
  });
});

addIrregularRule('calorie', 'calories');
addIrregularRule('celsius', 'celsius');
addIrregularRule('USD', 'USD');
addIrregularRule('EUR', 'EUR');
addIrregularRule('are', 'are');
addIrregularRule('s', 's');

export default pluralize;
export { singular, plural };
