import Fraction, { pow } from '@decipad/fraction';
import { parseUnit } from '@decipad/language';
import * as CurrencyUnits from '../../language/src/units/currency-units';
import { formatNumber, getIsPrecise } from './formatNumber';
import {
  bananasPerDay,
  makeFractionUnitTuple,
  metersPerDay,
  metersPerSecond,
  perBanana,
  perDay,
  perEuros,
  u,
  U,
  F,
  usd,
  usdPerDay,
} from './testUtils';

const locale = 'en-US';

describe('formatNumber', () => {
  describe('default rules', () => {
    describe('unitless', () => {
      it('10 = 10', () => {
        const { partsOf, asString } = formatNumber(locale, null, F(10));
        expect(partsOf).toEqual([{ type: 'integer', value: '10' }]);
        expect(asString).toEqual('10');
      });

      it('π = 3.14 [3.14159]', () => {
        const pi = F(355, 113);
        const deciNumber = formatNumber(locale, null, pi);
        expect(deciNumber.asString).toEqual('≈3.14');
        expect(deciNumber.isPrecise).toBe(false);
      });

      it('e = 2.71 [2.71828]', () => {
        const euler = F(1264, 465);
        const { asString } = formatNumber(locale, null, euler);
        expect(asString).toEqual('≈2.72');
      });

      it('-10 = -10', () => {
        const { isPrecise, partsOf, asString } = formatNumber(
          locale,
          null,
          F(-10)
        );
        expect(partsOf).toEqual([
          { type: 'minusSign', value: '-' },
          { type: 'integer', value: '10' },
        ]);
        expect(asString).toEqual('-10');
        expect(isPrecise).toBe(true);
      });

      it('1.001 = 1 [1.001001001001]', () => {
        const { isPrecise, partsOf, asString, asStringPrecise } = formatNumber(
          locale,
          null,
          F(1000, 999)
        );
        expect(asString).toEqual('≈1');
        expect(partsOf).toEqual([
          { type: 'roughly', value: '≈' },
          { type: 'integer', value: '1' },
        ]);
        expect(isPrecise).toBe(false);
        expect(asStringPrecise).toBe('1.001001001001001');
      });

      it('1.11111 = 1.11 [1.1111]', () => {
        const { isPrecise, partsOf, asString, asStringPrecise } = formatNumber(
          locale,
          null,
          F(10, 9)
        );
        expect(partsOf).toEqual([
          { type: 'roughly', value: '≈' },
          { type: 'integer', value: '1' },
          { type: 'decimal', value: '.' },
          { type: 'fraction', value: '11' },
        ]);
        expect(asString).toEqual('≈1.11');
        expect(isPrecise).toBe(false);
        expect(asStringPrecise).toBe('1.1111111111111112');
      });

      it('1337 = 1,337', () => {
        const { isPrecise, partsOf, asString, asStringPrecise } = formatNumber(
          locale,
          null,
          F(1337)
        );
        expect(asString).toEqual('1,337');
        expect(isPrecise).toBe(true);
        expect(asStringPrecise).toBe('1,337');
        expect(partsOf).toEqual([
          { type: 'integer', value: '1' },
          { type: 'group', value: ',' },
          { type: 'integer', value: '337' },
        ]);
      });

      it('1/1337^-200 = ?', () => {
        const { isPrecise, partsOf, asStringPrecise } = formatNumber(
          locale,
          null,
          pow(F(1, 1337), F(-200))
        );
        expect(partsOf).toEqual([
          {
            type: 'integer',
            value:
              '16837649018724680393221597634529456095176966235086989532247647724859391166053667163310011477442078488145302723722450336885772578729349838863255488238159891913547273306421035216207046997753155679059051244769990322185237015192119004661414943597826271657371672709631680239331959205052676375736716236348237843655474747196973896429238224708722182317137298973716628937624354831024002602173454239860364667575419830169549562657532688324457594740965901083602110440558197080178799758815902087272815429369456950578548715162623548287697161750561308400180806157380581322260862382227885368549617688203603194844295816377338454726358030648001',
          },
        ]);
        expect(isPrecise).toBe(true);
        expect(asStringPrecise).toBe(
          '16837649018724680393221597634529456095176966235086989532247647724859391166053667163310011477442078488145302723722450336885772578729349838863255488238159891913547273306421035216207046997753155679059051244769990322185237015192119004661414943597826271657371672709631680239331959205052676375736716236348237843655474747196973896429238224708722182317137298973716628937624354831024002602173454239860364667575419830169549562657532688324457594740965901083602110440558197080178799758815902087272815429369456950578548715162623548287697161750561308400180806157380581322260862382227885368549617688203603194844295816377338454726358030648001'
        );
      });

      it('0.(3) = 0.33 [0.3333]', () => {
        const { isPrecise, partsOf, asString, asStringPrecise } = formatNumber(
          locale,
          null,
          F(1, 3)
        );
        expect(asString).toEqual('≈0.33');
        expect(partsOf).toEqual([
          { type: 'roughly', value: '≈' },
          { type: 'integer', value: '0' },
          { type: 'decimal', value: '.' },
          { type: 'fraction', value: '33' },
        ]);
        expect(isPrecise).toBe(false);
        expect(asStringPrecise).toBe('0.3333333333333333');
      });

      it('1/27.932.716.234.532.345.672.234.567 = 0 [0.000000000000000]', () => {
        const { isPrecise, partsOf, asString, asStringPrecise } = formatNumber(
          locale,
          null,
          F(1n, 27932716234532345672234567n)
        );
        expect(asString).toEqual('≈0.00');
        expect(partsOf).toEqual([
          { type: 'roughly', value: '≈' },
          { type: 'integer', value: '0' },
          { type: 'decimal', value: '.' },
          { type: 'fraction', value: '00' },
        ]);
        expect(isPrecise).toBe(false);
        expect(asStringPrecise).toBe('3.5800313567920443×10⁻²⁶');
      });

      it('1,000 in 56 parts = 17.86 [17.857142857142857]', () => {
        const { isPrecise, partsOf, asString, asStringPrecise } = formatNumber(
          locale,
          null,
          F(1000, 56)
        );
        expect(partsOf).toEqual([
          { type: 'roughly', value: '≈' },
          { type: 'integer', value: '17' },
          { type: 'decimal', value: '.' },
          { type: 'fraction', value: '86' },
        ]);
        expect(asString).toEqual('≈17.86');
        expect(isPrecise).toBe(false);
        expect(asStringPrecise).toBe('17.857142857142858');
      });

      it('1/100 = 0.01', () => {
        const { isPrecise, partsOf, asString } = formatNumber(
          locale,
          null,
          F(1, 100)
        );
        expect(partsOf).toEqual([
          { type: 'integer', value: '0' },
          { type: 'decimal', value: '.' },
          { type: 'fraction', value: '01' },
        ]);
        expect(asString).toEqual('0.01');
        expect(isPrecise).toBe(true);
      });

      it('1,000,000 = 1 million', () => {
        const { partsOf, asString } = formatNumber(locale, null, F(1000000));
        expect(partsOf).toEqual([
          { type: 'integer', value: '1' },
          { type: 'literal', value: ' ' },
          { type: 'compact', value: 'million' },
        ]);
        expect(asString).toEqual('1 million');
      });

      it('1,000,001 = 1 million [1000001]', () => {
        const { isPrecise, partsOf, asString, asStringPrecise } = formatNumber(
          locale,
          null,
          F(1000001)
        );
        expect(partsOf).toEqual([
          { type: 'roughly', value: '≈' },
          { type: 'integer', value: '1' },
          { type: 'literal', value: ' ' },
          { type: 'compact', value: 'million' },
        ]);
        expect(asString).toEqual('≈1 million');
        expect(isPrecise).toBe(false);
        expect(asStringPrecise).toBe('1,000,001');
      });

      it('1,010,000 = 1.01 million', () => {
        const { asString } = formatNumber(locale, null, F(1010000));
        expect(asString).toEqual('1.01 million');
      });

      it('1,000,567 = 1 million [1000567]', () => {
        const { asString, asStringPrecise } = formatNumber(
          locale,
          null,
          F(1000567)
        );
        expect(asString).toEqual('≈1 million');
        expect(asStringPrecise).toEqual('1,000,567');
        expect(formatNumber(locale, null, F(1000567))).toMatchObject({
          isPrecise: false,
          asString: '≈1 million',
          value: 1000567,
          partsOf: [
            { type: 'roughly', value: '≈' },
            { type: 'integer', value: '1' },
            { type: 'literal', value: ' ' },
            { type: 'compact', value: 'million' },
          ],
        });
      });

      it('1,000,000,000 = 1 billion', () => {
        const { partsOf, asString } = formatNumber(locale, null, F(1000000000));
        expect(partsOf).toEqual([
          { type: 'integer', value: '1' },
          { type: 'literal', value: ' ' },
          { type: 'compact', value: 'billion' },
        ]);
        expect(asString).toEqual('1 billion');
      });

      it('1,000,000,001 = 1 billion [1000000001]', () => {
        const { isPrecise, partsOf, asString, asStringPrecise } = formatNumber(
          locale,
          null,
          F(1000000001)
        );
        expect(partsOf).toEqual([
          { type: 'roughly', value: '≈' },
          { type: 'integer', value: '1' },
          { type: 'literal', value: ' ' },
          { type: 'compact', value: 'billion' },
        ]);
        expect(asString).toEqual('≈1 billion');
        expect(isPrecise).toBe(false);
        expect(asStringPrecise).toBe('1,000,000,001');
      });

      it('1,000,000,000 = 1 trillion', () => {
        const { partsOf, asString } = formatNumber(
          locale,
          null,
          F(1000000000000)
        );
        expect(partsOf).toEqual([
          { type: 'integer', value: '1' },
          { type: 'literal', value: ' ' },
          { type: 'compact', value: 'trillion' },
        ]);
        expect(asString).toEqual('1 trillion');
      });

      it('1,000,000,000,001 = 1 trillion [1000000000001]', () => {
        const { isPrecise, partsOf, asString, asStringPrecise } = formatNumber(
          locale,
          null,
          F(1000000000001n)
        );
        expect(isPrecise).toBe(false);
        expect(asStringPrecise).toBe('1.000000000001×10¹²');
        expect(asString).toEqual('≈1 trillion');
        expect(partsOf).toEqual([
          { type: 'roughly', value: '≈' },
          { type: 'integer', value: '1' },
          { type: 'literal', value: ' ' },
          { type: 'compact', value: 'trillion' },
        ]);
      });

      it('1,000,000,000,000,001 = ≈1×10¹⁵', () => {
        const { isPrecise, partsOf, asString, asStringPrecise } = formatNumber(
          locale,
          null,
          F(1000000000000001n)
        );
        expect(isPrecise).toBe(false);
        expect(asStringPrecise).toBe('1.000000000000001×10¹⁵');
        expect(asString).toEqual('≈1×10¹⁵');
        expect(partsOf).toEqual([
          { type: 'roughly', value: '≈' },
          { type: 'integer', value: '1' },
          { originalValue: 'E', type: 'exponentSeparator', value: '×10' },
          { originalValue: '15', type: 'exponentInteger', value: '¹⁵' },
        ]);
      });

      it('100,000,000,000,000,000,000,000,000,000,000,000 = 100×10⁻³³', () => {
        const { partsOf, asString } = formatNumber(
          locale,
          null,
          F(100000000000000000000000000000000000n)
        );
        expect(asString).toEqual('100000000000000000000000000000000000');
        expect(partsOf).toEqual([
          { type: 'integer', value: '100000000000000000000000000000000000' },
        ]);
      });

      it('-100,000,000,000,000,000,000,000,000,000,000,000 = -100×10³³', () => {
        const { partsOf, asString } = formatNumber(
          locale,
          null,
          F(-100000000000000000000000000000000000n)
        );
        expect(asString).toEqual('-100000000000000000000000000000000000');
        expect(partsOf).toEqual([
          { type: 'integer', value: '-100000000000000000000000000000000000' },
        ]);
      });

      it('-1/100,000,000,000,000,000,000,000,000,000,000,000 = 0 [-0.000000000000000]', () => {
        const { asString, partsOf, asStringPrecise } = formatNumber(
          locale,
          null,
          F(-1, 100000000000000000000000000000000000n)
        );
        expect(partsOf).toEqual([
          { type: 'roughly', value: '≈' },
          { type: 'integer', value: '-0.00' },
        ]);
        expect(asString).toEqual('≈-0.00');
        expect(asStringPrecise).toEqual('-1×10⁻³⁵');
      });

      it('1/100,000,000,000,000,000,000,000,000,000,000,000 = 0 [0.000000000000000]', () => {
        const { isPrecise, asString, partsOf, asStringPrecise } = formatNumber(
          locale,
          null,
          F(1, 100000000000000000000000000000000000n)
        );
        expect(partsOf).toEqual([
          { type: 'roughly', value: '≈' },
          { type: 'integer', value: '0' },
          { type: 'decimal', value: '.' },
          { type: 'fraction', value: '00' },
        ]);
        expect(asString).toEqual('≈0.00');
        expect(asStringPrecise).toBe('1×10⁻³⁵');
        expect(isPrecise).toEqual(false);
      });

      it('large numbers dont NaN', () => {
        const { isPrecise, asString, partsOf, asStringPrecise } = formatNumber(
          locale,
          null,
          F(
            62657874821779703792562241943419303322066944468106652748595980508010000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000n,
            99841105961333740249832526095785439715019611210891297448940309958414571344942004777775447146813196387426531389711440107440518358529668957393764724110006564062164949390227139418902680190382417464665695698754232071972555328137006309409164907026740968759220322118653548973829100361706011760111439311632915849634542560941761883439196545435007035742001n
          )
        );
        expect(partsOf).toEqual([
          { type: 'roughly', value: '≈' },
          { type: 'integer', value: '0' },
          { type: 'decimal', value: '.' },
          { type: 'fraction', value: '63' },
        ]);
        expect(asString).toEqual('≈0.63');
        expect(isPrecise).toEqual(false);
        expect(asStringPrecise).toBe('0.627575928957014');
      });
    });

    describe('known units', () => {
      it('1/1000 km = 0 km [0.001 km]', () => {
        const [value, unit] = makeFractionUnitTuple(F(1, 1000), 'km');
        const { asString } = formatNumber(locale, unit, value);
        expect(asString).toEqual('≈0 km');

        expect(formatNumber(locale, unit, value)).toEqual({
          isPrecise: false,
          asString: '≈0 km',
          asStringPrecise: '0.001',
          value: 0.001,
          partsOf: [
            { type: 'roughly', value: '≈' },
            { type: 'integer', value: '0' },
            {
              partsOf: [
                { type: 'unit-prefix', value: 'k' },
                { base: 'length', type: 'unit', value: 'm' },
              ],
              type: 'unit',
              value: 'km',
            },
          ],
        });
      });

      it('23/2 km = 11.5 km', () => {
        const [value, unit] = makeFractionUnitTuple(F(23, 2), 'km');
        const { partsOf, asString } = formatNumber(locale, unit, value);
        expect(asString).toEqual('11.5 km');
        expect(partsOf).toEqual([
          { type: 'integer', value: '11' },
          { type: 'decimal', value: '.' },
          { type: 'fraction', value: '5' },
          {
            partsOf: [
              { type: 'unit-prefix', value: 'k' },
              { base: 'length', type: 'unit', value: 'm' },
            ],
            type: 'unit',
            value: 'km',
          },
        ]);
      });

      it('69 m^420 in ft^420 != NaN', () => {
        const [nr, unit] = makeFractionUnitTuple(
          F({
            s: 1n,
            n: 1158599400386353787391341320859783096291643208506792589783578167451166660656680041931644741957759954362252985125806803357892303871467013882823658276497874415235931828073019341668370731040105939034390724355135684919733303913471085079588098476247647539436434001774471991660034135303856459138537988852406176124967715195368370210479291187129751933215879214957082423429581385762868422322030174550786676045811387738836075601620308354443680582039194889519852833566573724682948434505706499901343239775026299359036951049266393138218850566896989569994946488243012551464293423954004070321598510829658736381093205829725315512549825121853508620713563442786812327143570675644672818966210123797222659202395692606745856127205015250369642619130308682998145537871920359326094947990310885149646671812265447263672779360679480630004948865227179987276627328132336779142885774263049825094640254974365234375000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000n,
            d: 3246149588547966442830098168207635181510553701652342445190408355159473823099147795964345884420617275321330479371287399543594807607611033046831330323781257185934381412655878355674446190895440664953872908769228055382650582181451090466374013332769287322207687201322818880250475797728202733368045047900498409893342886897411560478996118645676324263528600523839826014708048475206815551227614339549391199923738265242027681611880978035487319580471124040461924837602594531262381137167959516323256184675937988944065864708173298551488723290236365072519349692756863044823147261190338441386862862440643214676737966268101787871930382270677151484112082155573968315189225146083147387479964158736435765447388231668192092854561677617511460877120370230580926197947986794869764427495339337125931143337535953851634241952657621209631969949218655385081445882631106309023397661729925892211474071887137792447433071162875103738635832568387533439920770391392381550561036746741912185854467851928653442959531259050933087505065379506388933111732304320627378077356036626309341430635223680440263973122331802309331867n,
          }).mul(F(10).pow(F(215))),
          'ft^420'
        );
        const { isPrecise, asString } = formatNumber(locale, unit, nr);
        expect(isPrecise).toBe(false);
        expect(asString).toBe(
          '≈35691497535226228088253152765922119773249419234416657677982409798782695048152680387528697137416485628569985335889258961085517741856058020851731040050761051555343355633316779181732731779488977246423696648684094377911350116728582974468377919620996834977348869510734725858683444687968465716212761167185996267898556835897940312308852382466483915240730770862022243950708278468996945470007867908023316203049808239781132704443572650954437370.19 ft^420s'
        );
      });

      it('90,000 m = 90 thousand m', () => {
        const [value, unit] = makeFractionUnitTuple(F(90000), 'm');
        const { asString } = formatNumber(locale, unit, value);
        expect(asString).toEqual('90 thousand m');
      });

      it('15,000 km = 15 thousand kilometers', () => {
        const [value, unit] = makeFractionUnitTuple(F(15000), 'kilometer');
        const { asString } = formatNumber(locale, unit, value);
        expect(asString).toEqual('15 thousand kilometers');
      });

      it('12 months = 1 year', () => {
        const [value, unit] = makeFractionUnitTuple(F(12), 'month');
        const { asString, partsOf } = formatNumber(locale, unit, value);
        expect(partsOf).toEqual([
          { type: 'integer', value: '1' },
          { type: 'unit', value: 'year' },
        ]);
        expect(asString).toEqual('1 year');
      });

      it('60 second = 1 minute', () => {
        const [value, unit] = makeFractionUnitTuple(F(60), 'second');
        const { asString, partsOf } = formatNumber(locale, unit, value);
        expect(partsOf).toEqual([
          { type: 'integer', value: '1' },
          { type: 'unit', value: 'minute' },
        ]);
        expect(asString).toEqual('1 minute');
      });

      it('15,000 weeks = 287y 245d', () => {
        const [value, unit] = makeFractionUnitTuple(F(15000), 'week');
        const { asString } = formatNumber(locale, unit, value);
        expect(asString).toEqual('287 years 245 days');
      });

      it('1/150000 seconds = [Object]', () => {
        const [value, unit] = makeFractionUnitTuple(F(1, 150000), 'seconds');
        const deciNum = formatNumber(locale, unit, value);
        expect(deciNum).toEqual({
          asString: '6 µs 666 ns',
          asStringPrecise: '0.000006666666666666667 seconds',
          isPrecise: true,
          partsOf: [
            { type: 'integer', value: '6' },
            { type: 'unit', value: 'µs' },
            { type: 'literal', value: ' ' },
            { type: 'integer', value: '666' },
            { type: 'unit', value: 'ns' },
          ],
          value: 0.000006666666666666667,
        });
      });

      it('1/1500 weeks = 6 minutes 43.2 seconds', () => {
        const [value, unit] = makeFractionUnitTuple(F(1, 1500), 'week');
        const { asString } = formatNumber(locale, unit, value);
        expect(asString).toEqual('6 minutes 43.2 seconds');
      });

      it('90.000 m/day = 90K meters per day', () => {
        const { asString } = formatNumber(locale, metersPerDay, F(90000));
        expect(asString).toEqual('90K meters per day');
      });

      it('0.45359 kg = 0.45 kg', () => {
        const [value, unit] = makeFractionUnitTuple(
          new Fraction(0.45359),
          'kg'
        );
        const { asString } = formatNumber(locale, unit, value);
        expect(asString).toEqual('≈0.45 kg');
      });

      it('0.01 liter/meter = 0.01 liters per meter', () => {
        const { partsOf, asString } = formatNumber(
          locale,
          [parseUnit('liter'), u('meter', { exp: new Fraction(-1) })],
          F(1, 100)
        );
        expect(asString).toEqual('0.01 liters per meter');
        expect(partsOf).toEqual([
          { type: 'integer', value: '0' },
          { type: 'decimal', value: '.' },
          { type: 'fraction', value: '01' },
          {
            partsOf: [
              { base: 'volume', type: 'unit', value: 'liters' },
              { type: 'unit-literal', value: ' ' },
              { type: 'unit-group', value: 'per' },
              { type: 'unit-literal', value: ' ' },
              { base: 'length', type: 'unit', value: 'meter' },
            ],
            type: 'unit',
            value: 'liters per meter',
          },
        ]);
      });

      it('1 liter * meter = 1 liter · meter', () => {
        const { partsOf, asString } = formatNumber(
          locale,
          [parseUnit('liter'), parseUnit('meter')],
          F(1)
        );
        expect(asString).toEqual('1 liter · meter');
        expect(partsOf).toEqual([
          { type: 'integer', value: '1' },
          {
            partsOf: [
              { base: 'volume', type: 'unit', value: 'liter' },
              { type: 'unit-group', value: '·' },
              { base: 'length', type: 'unit', value: 'meter' },
            ],
            type: 'unit',
            value: 'liter · meter',
          },
        ]);
      });

      it('$1 * meter = $1 meter', () => {
        const { partsOf, asString, asStringPrecise } = formatNumber(
          locale,
          [parseUnit('usd'), parseUnit('meter')],
          F(1)
        );
        expect(partsOf).toEqual([
          { type: 'currency', value: '$' },
          { type: 'integer', value: '1' },
          {
            partsOf: [{ base: 'length', type: 'unit', value: 'meter' }],
            type: 'unit',
            value: 'meter',
          },
        ]);
        expect(asString).toEqual('$1 meter');
        expect(asStringPrecise).toEqual('1');
      });

      it('$1 / meter = $1 per meter', () => {
        const { partsOf, asString, asStringPrecise } = formatNumber(
          locale,
          [parseUnit('usd'), u('meter', { exp: new Fraction(-1) })],
          F(1)
        );
        expect(asString).toEqual('$1 per meter');
        expect(asStringPrecise).toEqual('1');
        expect(partsOf).toEqual([
          { type: 'currency', value: '$' },
          { type: 'integer', value: '1' },
          {
            partsOf: [
              { type: 'unit-literal', value: ' ' },
              { type: 'unit-group', value: 'per' },
              { type: 'unit-literal', value: ' ' },
              { base: 'length', type: 'unit', value: 'meter' },
            ],
            type: 'unit',
            value: 'per meter',
          },
        ]);
      });

      it('£5/kWh is £5 per kWh', () => {
        const { asString } = formatNumber(
          locale,
          [
            parseUnit('gbp'),
            u('Wh', { exp: new Fraction(-1), multiplier: F(1000) }),
          ],
          F(5, 1000)
        );
        expect(asString).toEqual('£5 per kWh');
      });

      it('£5/$ is £5 per kWh', () => {
        const { asString } = formatNumber(
          locale,
          [parseUnit('gbp'), u('usd', { exp: new Fraction(-1) })],
          F(5)
        );
        expect(asString).toEqual('£5 per $');
      });

      it('1/90000 meters = 0 m', () => {
        const [nr, unit] = makeFractionUnitTuple(F(1, 90000), 'm');
        const { asString } = formatNumber(locale, unit, nr);
        expect(asString).toEqual('≈0 m');
      });

      it('1/100 meters = 0.01 m', () => {
        const [value, unit] = makeFractionUnitTuple(F(1, 100), 'm');
        const { asString } = formatNumber(locale, unit, value);
        expect(asString).toEqual('0.01 m');
      });

      it('1/100 km = 0.01 km', () => {
        const [value, unit] = makeFractionUnitTuple(F(1, 100), 'km');
        const { asString } = formatNumber(locale, unit, value);
        expect(asString).toEqual('0.01 km');
      });

      it('69 m^420 = 69 m⁴²⁰', () => {
        const { partsOf, asString } = formatNumber(
          locale,
          U('m', { exp: F(420) }),
          F(69)
        );
        expect(partsOf).toEqual([
          { type: 'integer', value: '69' },
          {
            partsOf: [
              { base: 'length', type: 'unit', value: 'm' },
              { value: '⁴²⁰', type: 'unit-exponent', originalValue: '420' },
            ],
            type: 'unit',
            value: 'm⁴²⁰',
          },
        ]);
        expect(asString).toEqual('69 m⁴²⁰');
      });
      it('69 m^-420 = 69 m⁻⁴²⁰', () => {
        const { partsOf, asString } = formatNumber(
          locale,
          U('m', { exp: F(-420) }),
          F(69)
        );
        expect(partsOf).toEqual([
          { type: 'integer', value: '69' },
          {
            partsOf: [
              { base: 'length', type: 'unit', value: 'm' },
              { value: '⁻⁴²⁰', type: 'unit-exponent', originalValue: '-420' },
            ],
            type: 'unit',
            value: 'm⁻⁴²⁰',
          },
        ]);
        expect(asString).toEqual('69 m⁻⁴²⁰');
      });
      it('1,000,000,000 meters = 1 trillion meters', () => {
        const [nr, unit] = makeFractionUnitTuple(F(1000000000000), 'meters');
        const { asString } = formatNumber(locale, unit, nr);
        expect(asString).toEqual('1 trillion meters');
      });
      it('1,000,000 meters = 1 billion meters', () => {
        const [nr, unit] = makeFractionUnitTuple(F(1000000000), 'meter');
        const { asString } = formatNumber(locale, unit, nr);
        expect(asString).toEqual('1 billion meters');
      });

      it('1,000,000,000 meters/day = 1T meters per day', () => {
        const { asString, partsOf } = formatNumber(
          locale,
          metersPerDay,
          F(1000000000000)
        );
        expect(asString).toEqual('1T meters per day');
        expect(partsOf).toEqual([
          { type: 'integer', value: '1' },
          { type: 'compact', value: 'T' },
          {
            partsOf: [
              { base: 'length', type: 'unit', value: 'meters' },
              { type: 'unit-literal', value: ' ' },
              { type: 'unit-group', value: 'per' },
              { type: 'unit-literal', value: ' ' },
              { base: 'second', type: 'unit', value: 'day' },
            ],
            type: 'unit',
            value: 'meters per day',
          },
        ]);
      });

      it('10 meter/day = 10 meters per day', () => {
        const { partsOf, asString } = formatNumber(
          'en-US',
          metersPerDay,
          F(10)
        );
        expect(partsOf).toEqual([
          { type: 'integer', value: '10' },
          {
            partsOf: [
              { base: 'length', type: 'unit', value: 'meters' },
              { type: 'unit-literal', value: ' ' },
              { type: 'unit-group', value: 'per' },
              { type: 'unit-literal', value: ' ' },
              { base: 'second', type: 'unit', value: 'day' },
            ],
            type: 'unit',
            value: 'meters per day',
          },
        ]);
        expect(asString).toEqual('10 meters per day');
      });
      it('100/day = 100 per day', () => {
        const { partsOf, asString } = formatNumber('en-US', perDay, F(100));
        expect(asString).toEqual('100 per day');
        expect(partsOf).toEqual([
          { type: 'integer', value: '100' },
          {
            partsOf: [
              { type: 'unit-literal', value: ' ' },
              { type: 'unit-group', value: 'per' },
              { type: 'unit-literal', value: ' ' },
              { base: 'second', type: 'unit', value: 'day' },
            ],
            type: 'unit',
            value: 'per day',
          },
        ]);
      });
    });

    describe('known currencies conform to standard', () => {
      test.each(CurrencyUnits.units.map((x) => x.baseQuantity))(
        '%p is monies?',
        (fx) => {
          const { partsOf } = formatNumber(locale, [parseUnit(fx)], F(100000));
          expect(partsOf.map((x) => x.type)).toContain('currency');
        }
      );

      const prettyCurrencies = CurrencyUnits.units.filter((x) => x.pretty);
      test.each(prettyCurrencies.map((x) => x.baseQuantity))(
        '%p is pretty printed?',
        (fx) => {
          expect(prettyCurrencies.map((x) => x.pretty)).toContain(
            formatNumber(locale, [parseUnit(fx)], F(100000))
              .partsOf.filter((x) => x.type === 'currency')
              .map((x) => x.value)[0]
          );
        }
      );
    });

    describe('currencies', () => {
      it('1 usd = $1', () => {
        const [nr, unit] = makeFractionUnitTuple(F(1), 'usd');
        const { partsOf, asString } = formatNumber(locale, unit, nr);
        expect(partsOf).toEqual([
          { type: 'currency', value: '$' },
          { type: 'integer', value: '1' },
        ]);
        expect(asString).toEqual('$1');
      });

      it('-100 usd = -$100', () => {
        const [nr, unit] = makeFractionUnitTuple(F(-100), 'usd');
        const { partsOf, asString } = formatNumber(locale, unit, nr);
        expect(partsOf).toEqual([
          { type: 'minusSign', value: '-' },
          { type: 'currency', value: '$' },
          { type: 'integer', value: '100' },
        ]);
        expect(asString).toEqual('-$100');
      });

      it('11.5 gbp = £11.5', () => {
        const [nr, unit] = makeFractionUnitTuple(F(23, 2), 'gbp');
        const { asString } = formatNumber(locale, unit, nr);
        expect(asString).toEqual('£11.5');
      });

      it('$11.5/day = $11.5 per day', () => {
        const { asString } = formatNumber(locale, usdPerDay, F(23, 2));
        expect(asString).toEqual('$11.5 per day');
      });

      it('$11.5k/day = $11.5K per day', () => {
        const { asString } = formatNumber(locale, usdPerDay, F(23000, 2));
        expect(asString).toEqual('$11.5K per day');
      });

      it('100 usd = $100', () => {
        const { partsOf, asString } = formatNumber('en-US', usd, F(100));
        expect(partsOf).toEqual([
          { type: 'currency', value: '$' },
          { type: 'integer', value: '100' },
        ]);
        expect(asString).toEqual('$100');
      });

      it('100,000 gbp = £100K', () => {
        const [nr, unit] = makeFractionUnitTuple(F(100000), 'gbp');
        const { partsOf, asString } = formatNumber(locale, unit, nr);
        expect(partsOf).toEqual([
          { type: 'currency', value: '£' },
          { type: 'integer', value: '100' },
          { type: 'compact', value: 'K' },
        ]);
        expect(asString).toEqual('£100K');
      });

      it('100,100 gbp = £101K', () => {
        const [nr, unit] = makeFractionUnitTuple(F(100100), 'gbp');
        const { asString } = formatNumber(locale, unit, nr);
        expect(asString).toEqual('≈£100.1K');
      });

      it('100,000 eur = €100K', () => {
        const [nr, unit] = makeFractionUnitTuple(F(100000), 'eur');
        const { partsOf, asString } = formatNumber(locale, unit, nr);
        expect(partsOf).toEqual([
          { type: 'currency', value: '€' },
          { type: 'integer', value: '100' },
          { type: 'compact', value: 'K' },
        ]);
        expect(asString).toEqual('€100K');
      });

      it('100,000 yen = ¥100K', () => {
        const [nr, unit] = makeFractionUnitTuple(F(100000), 'JPY');
        const { partsOf, asString } = formatNumber(locale, unit, nr);
        expect(partsOf).toEqual([
          { type: 'currency', value: '¥' },
          { type: 'integer', value: '100' },
          { type: 'compact', value: 'K' },
        ]);
        expect(asString).toEqual('¥100K');
      });

      it('100,000,000 / 13 Euros = €7.69M [7692307.692307692307692]', () => {
        const [nr, unit] = makeFractionUnitTuple(F(100000000, 13), 'eur');
        const { partsOf, asString, asStringPrecise } = formatNumber(
          locale,
          unit,
          nr
        );
        expect(partsOf).toEqual([
          { type: 'roughly', value: '≈' },
          { type: 'currency', value: '€' },
          { type: 'integer', value: '7' },
          { type: 'decimal', value: '.' },
          { type: 'fraction', value: '69' },
          { type: 'compact', value: 'M' },
        ]);
        expect(asString).toEqual('≈€7.69M'); // -> precise
        expect(asStringPrecise).toEqual('7,692,307.692307692');
      });

      it('1,404,000 $ = $1.4M [1404000]', () => {
        const [nr, unit] = makeFractionUnitTuple(F(1404000), 'usd');
        const { partsOf, asString, asStringPrecise } = formatNumber(
          locale,
          unit,
          nr
        );
        expect(partsOf).toEqual([
          { type: 'roughly', value: '≈' },
          { type: 'currency', value: '$' },
          { type: 'integer', value: '1' },
          { type: 'decimal', value: '.' },
          { type: 'fraction', value: '4' },
          { type: 'compact', value: 'M' },
        ]);
        expect(asString).toEqual('≈$1.4M');
        expect(asStringPrecise).toEqual('1,404,000');
      });

      it('1,000 gbp in 56 parts = £17.86 each [17.857142857142857]', () => {
        const [nr, unit] = makeFractionUnitTuple(F(1000, 56), 'gbp');
        const { partsOf, asString, asStringPrecise } = formatNumber(
          locale,
          unit,
          nr
        );
        expect(partsOf).toEqual([
          { type: 'roughly', value: '≈' },
          { type: 'currency', value: '£' },
          { type: 'integer', value: '17' },
          { type: 'decimal', value: '.' },
          { type: 'fraction', value: '86' },
        ]);
        expect(asString).toEqual('≈£17.86');
        expect(asStringPrecise).toEqual('17.857142857142858');
      });

      it('$0.001 = $0 [0.001]', () => {
        const [nr, unit] = makeFractionUnitTuple(F(1, 1000), 'usd');
        const { asString, asStringPrecise } = formatNumber(locale, unit, nr);
        expect(formatNumber(locale, unit, nr)).toEqual({
          isPrecise: false,
          asString: '≈$0',
          asStringPrecise: '0.001',
          value: 0.001,
          partsOf: [
            { type: 'roughly', value: '≈' },
            { type: 'currency', value: '$' },
            { type: 'integer', value: '0' },
          ],
        });
        expect(asString).toEqual('≈$0');
        expect(asStringPrecise).toEqual('0.001');
      });

      it('$0.001k = $1', () => {
        const [nr, unit] = makeFractionUnitTuple(F(1, 1000), 'kilousd');
        const { asString } = formatNumber(locale, unit, nr);
        expect(asString).toEqual('$1');
      });

      it('$0.01 = $0.01', () => {
        const [nr, unit] = makeFractionUnitTuple(F(1, 100), 'usd');
        const { asString } = formatNumber(locale, unit, nr);
        expect(asString).toEqual('$0.01');
      });

      it('1 centiusd = $0.01', () => {
        const [nr, unit] = makeFractionUnitTuple(F(1), 'centiusd');
        const { asString } = formatNumber(locale, unit, nr);
        expect(asString).toEqual('$0.01');
      });

      it('$1,000 = $1K', () => {
        const [nr, unit] = makeFractionUnitTuple(F(1000), 'usd');
        const { asString } = formatNumber(locale, unit, nr);
        expect(asString).toEqual('$1,000');
      });

      it('0.01 euros = 0.01 eur', () => {
        const [nr, unit] = makeFractionUnitTuple(F(1, 100), 'eur');
        const { asString } = formatNumber(locale, unit, nr);
        expect(asString).toEqual('€0.01');
      });

      it('1 k usd = $1K', () => {
        const [nr, unit] = makeFractionUnitTuple(F(1), 'kusd');
        const { isPrecise, asString } = formatNumber(locale, unit, nr);
        expect(asString).toEqual('$1,000');
        expect(isPrecise).toBe(true);
      });

      it('$1000 = $1,000', () => {
        const [nr, unit] = makeFractionUnitTuple(F(1000), 'usd');
        const { asString } = formatNumber(locale, unit, nr);
        expect(asString).toEqual('$1,000');
      });
      it('69 $^420 = 69 $⁴²⁰', () => {
        // todo: no idea what this should be
        const { asString } = formatNumber(
          locale,
          U('usd', { exp: F(420) }),
          F(69)
        );
        expect(asString).toEqual('69 $⁴²⁰');
      });
      it('$1,000,000,000 = $1T', () => {
        const { partsOf, asString } = formatNumber(
          locale,
          usd,
          F(1000000000000)
        );
        expect(partsOf).toEqual([
          { type: 'currency', value: '$' },
          { type: 'integer', value: '1' },
          { type: 'compact', value: 'T' },
        ]);
        expect(asString).toEqual('$1T');
      });

      it('100 usd/day = $100 per day', () => {
        const { asString } = formatNumber('en-US', usdPerDay, F(100));
        expect(asString).toEqual('$100 per day');
      });

      it('100/eur = 100 per euro', () => {
        const { partsOf, asString } = formatNumber('en-US', perEuros, F(100));
        expect(asString).toEqual('100 per €');
        expect(partsOf).toEqual([
          { type: 'integer', value: '100' },
          {
            partsOf: [
              { type: 'unit-literal', value: ' ' },
              { type: 'unit-group', value: 'per' },
              { type: 'unit-literal', value: ' ' },
              {
                base: 'currency',
                originalValue: 'euro',
                type: 'unit',
                value: '€',
              },
            ],
            type: 'unit',
            value: 'per €',
          },
        ]);
      });

      it('$1,000,000,000/day = $1T per day', () => {
        const { asString } = formatNumber(locale, usdPerDay, F(1000000000000));
        expect(asString).toEqual('$1T per day');
      });
      it('10,000 usd/day = $10K per day', () => {
        const { asString } = formatNumber('en-US', usdPerDay, F(10000));
        expect(asString).toEqual('$10K per day');
      });
      it('90,000 usd/day = $90K per day', () => {
        const { asString } = formatNumber(locale, usdPerDay, F(90000));
        expect(asString).toEqual('$90K per day');
      });

      it('1,000,000,000,000 usd = $1T', () => {
        const [nr, unit] = makeFractionUnitTuple(F(1000000000000), 'usd');
        const { asString } = formatNumber(locale, unit, nr);
        expect(asString).toEqual('$1T');
      });
      it('1,000,000,000 usd = $1B', () => {
        const [nr, unit] = makeFractionUnitTuple(F(1000000000), 'usd');
        const { asString } = formatNumber(locale, unit, nr);
        expect(asString).toEqual('$1B');
      });
    });

    describe('user defined units', () => {
      it('1/1000 kilobananas = 0 kilobananas', () => {
        const [value, unit] = makeFractionUnitTuple(F(1, 1000), 'kilobanana');
        const { asString } = formatNumber(locale, unit, value);
        expect(asString).toEqual('≈0 kilobananas');
      });
      it('1 kilobanana = 1 kilobananas', () => {
        // todo: ideal world this would be 1 thousand bananas
        // but so many potential consequences rather not touch it
        const [value, unit] = makeFractionUnitTuple(F(1), 'kilobanana');
        const { asString } = formatNumber(locale, unit, value);
        expect(asString).toEqual('1 kilobanana');
      });

      it('1000 bananas = 1 thousand bananas', () => {
        const [nr, unit] = makeFractionUnitTuple(F(1000), 'banana');
        const { partsOf, asString } = formatNumber(locale, unit, nr);
        expect(partsOf).toEqual([
          { type: 'integer', value: '1' },
          { type: 'group', value: ',' },
          { type: 'integer', value: '000' },
          { type: 'literal', value: ' ' },
          { type: 'unit', value: 'bananas' },
        ]);
        expect(asString).toEqual('1,000 bananas');
      });

      it('90,000 bananas = 90 thousand bananas', () => {
        const [nr, unit] = makeFractionUnitTuple(F(90000), 'banana');
        const { partsOf, asString } = formatNumber(locale, unit, nr);
        expect(asString).toEqual('90 thousand bananas');
        expect(partsOf).toEqual([
          { type: 'integer', value: '90' },
          { type: 'literal', value: ' ' },
          { type: 'compact', value: 'thousand' },
          { type: 'literal', value: ' ' },
          { type: 'unit', value: 'bananas' },
        ]);
      });
      it('1/90.000 bananas = 0 bananas [0.00001 bananas]', () => {
        const [nr, unit] = makeFractionUnitTuple(F(1, 90000), 'banana');
        const { asString } = formatNumber(locale, unit, nr);
        expect(asString).toEqual('≈0 bananas');
        expect(formatNumber(locale, unit, nr).asString).toEqual('≈0 bananas');
      });

      it('1/100 bananas = 0.01 bananas', () => {
        const [nr, unit] = makeFractionUnitTuple(F(1, 100), 'banana');
        const { partsOf, asString } = formatNumber(locale, unit, nr);
        expect(asString).toEqual('0.01 bananas');
        expect(partsOf).toEqual([
          { type: 'integer', value: '0' },
          { type: 'decimal', value: '.' },
          { type: 'fraction', value: '01' },
          { type: 'literal', value: ' ' },
          { type: 'unit', value: 'bananas' },
        ]);
      });
      it('1/1000 bananas = 0 bananas', () => {
        const [nr, unit] = makeFractionUnitTuple(F(1, 1000), 'banana');
        const { asString } = formatNumber(locale, unit, nr);
        expect(asString).toEqual('≈0 bananas');
      });
      it('69 bananas^420 = 69 bananas⁴²⁰', () => {
        const { partsOf, asString } = formatNumber(
          locale,
          U('banana', { exp: F(420) }),
          F(69)
        );
        expect(asString).toEqual('69 bananas⁴²⁰');
        expect(partsOf).toEqual([
          { type: 'integer', value: '69' },
          {
            partsOf: [
              {
                base: 'user-defined-unit',
                type: 'unit',
                value: 'bananas',
              },
              { value: '⁴²⁰', type: 'unit-exponent', originalValue: '420' },
            ],
            type: 'unit',
            value: 'bananas⁴²⁰',
          },
        ]);
      });
      it('1,000,000,000,000 bananas = 1 trillion bananas', () => {
        const [nr, unit] = makeFractionUnitTuple(F(1000000000000), 'banana');
        const { partsOf, asString } = formatNumber(locale, unit, nr);
        expect(asString).toEqual('1 trillion bananas');
        expect(partsOf).toEqual([
          { type: 'integer', value: '1' },
          { type: 'literal', value: ' ' },
          { type: 'compact', value: 'trillion' },
          { type: 'literal', value: ' ' },
          { type: 'unit', value: 'bananas' },
        ]);
      });

      it('1,000,000,000 banana/day = 1B bananas per day', () => {
        const { partsOf, asString } = formatNumber(
          locale,
          bananasPerDay,
          F(1000000000)
        );
        expect(partsOf).toEqual([
          { type: 'integer', value: '1' },
          { type: 'compact', value: 'B' },
          {
            partsOf: [
              { base: 'user-defined-unit', type: 'unit', value: 'bananas' },
              { type: 'unit-literal', value: ' ' },
              { type: 'unit-group', value: 'per' },
              { type: 'unit-literal', value: ' ' },
              { base: 'second', type: 'unit', value: 'day' },
            ],
            type: 'unit',
            value: 'bananas per day',
          },
        ]);
        expect(asString).toEqual('1B bananas per day');
      });
      it('10 banana/day = 10 bananas per day', () => {
        const { partsOf, asString } = formatNumber(
          'en-US',
          bananasPerDay,
          F(10)
        );
        expect(partsOf).toEqual([
          { type: 'integer', value: '10' },
          {
            partsOf: [
              { base: 'user-defined-unit', type: 'unit', value: 'bananas' },
              { type: 'unit-literal', value: ' ' },
              { type: 'unit-group', value: 'per' },
              { type: 'unit-literal', value: ' ' },
              { base: 'second', type: 'unit', value: 'day' },
            ],
            type: 'unit',
            value: 'bananas per day',
          },
        ]);
        expect(asString).toEqual('10 bananas per day');
      });
      it('100/banana = 100 per banana', () => {
        const { partsOf, asString } = formatNumber('en-US', perBanana, F(100));
        expect(asString).toEqual('100 per banana');
        expect(partsOf).toEqual([
          { type: 'integer', value: '100' },
          {
            partsOf: [
              { type: 'unit-literal', value: ' ' },
              { type: 'unit-group', value: 'per' },
              { type: 'unit-literal', value: ' ' },
              { base: 'user-defined-unit', type: 'unit', value: 'banana' },
            ],
            type: 'unit',
            value: 'per banana',
          },
        ]);
      });
      it('90,000 banana/day = 90K banana per day', () => {
        const { asString } = formatNumber(locale, bananasPerDay, F(90000));
        expect(asString).toEqual('90K bananas per day');
      });

      it('1,000,000 bananas = 1 billion bananas', () => {
        const [nr, unit] = makeFractionUnitTuple(F(1000000000), 'banana');
        const { asString } = formatNumber(locale, unit, nr);
        expect(asString).toEqual('1 billion bananas');
      });
    });

    describe('precision with units', () => {
      it('$100,000,000,000,000,000,000,000,000,000,000,000 = $100 ×10³³', () => {
        const { asString } = formatNumber(
          locale,
          usd,
          F(100000000000000000000000000000000000n)
        );
        expect(asString).toEqual('$100000000000000000000000000000000000');
      });

      it('100,000,000,000,000,000,000,000,000,000,000,000 meters = 100×10³³ meters', () => {
        const [nr, unit] = makeFractionUnitTuple(
          F(100000000000000000000000000000000000n),
          'meter'
        );
        const { asString } = formatNumber(locale, unit, nr);
        expect(asString).toEqual('100000000000000000000000000000000000 meters');
      });

      it('100,000,000,000,000,000,000,000,000,000,000,000 banana = 100×10³³ bananas', () => {
        const [nr, unit] = makeFractionUnitTuple(
          F(100000000000000000000000000000000000n),
          'banana'
        );
        const { asString } = formatNumber(locale, unit, nr);
        expect(asString).toEqual(
          '100000000000000000000000000000000000 bananas'
        );
      });

      it('100,000,000,000,000,000,000,000,000,000,000,000 per bananas = 100×10³³ per banana', () => {
        const { asString } = formatNumber(
          locale,
          perBanana,
          F(100000000000000000000000000000000000n)
        );
        expect(asString).toEqual(
          '100000000000000000000000000000000000 per banana'
        );
      });

      it('100,000,000,000,000,000,000,000,000,000,000,000 banana per day = 100×10³³ bananas per day', () => {
        const { asString } = formatNumber(
          locale,
          bananasPerDay,
          F(100000000000000000000000000000000000n)
        );
        expect(asString).toEqual(
          '100000000000000000000000000000000000 bananas per day'
        );
      });

      it('100,000,000,000,000,000,000,000,000,000,000,000 meters per second = 100×10³³ m per second', () => {
        const { asString, partsOf } = formatNumber(
          locale,
          metersPerSecond,
          F(100000000000000000000000000000000000n)
        );
        expect(partsOf).toMatchInlineSnapshot(`
          Array [
            Object {
              "type": "integer",
              "value": "100000000000000000000000000000000000",
            },
            Object {
              "partsOf": Array [
                Object {
                  "base": "length",
                  "type": "unit",
                  "value": "m",
                },
                Object {
                  "type": "unit-literal",
                  "value": " ",
                },
                Object {
                  "type": "unit-group",
                  "value": "per",
                },
                Object {
                  "type": "unit-literal",
                  "value": " ",
                },
                Object {
                  "base": "second",
                  "type": "unit",
                  "value": "second",
                },
              ],
              "type": "unit",
              "value": "m per second",
            },
          ]
        `);
        expect(asString).toEqual(
          '100000000000000000000000000000000000 m per second'
        );
      });

      it('100,000,000,000,000,000,000,000,000,000,000,000 $ per day = $100×10³³ per day', () => {
        const { asString } = formatNumber(
          locale,
          usdPerDay,
          F(100000000000000000000000000000000000n)
        );
        expect(asString).toEqual(
          '$100000000000000000000000000000000000 per day'
        );
      });

      it('$1/100,000,000,000,000,000,000,000,000,000,000,000 = $0', () => {
        const { asString } = formatNumber(
          locale,
          usd,
          F(1, 100000000000000000000000000000000000n)
        );
        expect(asString).toEqual('≈$0.00');
      });

      it('1/100,000,000,000,000,000,000,000,000,000,000,000 meter = 10 ×10⁻³⁶ meters', () => {
        const [nr, unit] = makeFractionUnitTuple(
          F(1, 100000000000000000000000000000000000n),
          'meter'
        );
        const { asString } = formatNumber(locale, unit, nr);
        expect(asString).toEqual('≈0.00 meters');
      });

      it('1/100,000,000,000,000,000,000,000,000,000,000,000 banana = 0 bananas', () => {
        const [nr, unit] = makeFractionUnitTuple(
          F(1, 100000000000000000000000000000000000n),
          'banana'
        );
        const { asString } = formatNumber(locale, unit, nr);
        expect(asString).toEqual('≈0.00 bananas');
      });

      it('1/100,000,000,000,000,000,000,000,000,000,000,000 per banana = 0 per banana', () => {
        const { asString } = formatNumber(
          locale,
          perBanana,
          F(1, 100000000000000000000000000000000000n)
        );
        expect(asString).toEqual('≈0.00 per banana');
      });

      it('1/100,000,000,000,000,000,000,000,000,000,000,000 banana/day = 0 bananas per day', () => {
        const { asString } = formatNumber(
          locale,
          bananasPerDay,
          F(1, 100000000000000000000000000000000000n)
        );
        expect(asString).toEqual('≈0.00 bananas per day');
      });

      it('1/100,000,000,000,000,000,000,000,000,000,000,000 m/s = 10 ×10⁻³⁶ m per second', () => {
        const { asString } = formatNumber(
          locale,
          metersPerSecond,
          F(1, 100000000000000000000000000000000000n)
        );
        expect(asString).toEqual('≈0.00 m per second');
      });

      it('1/100,000,000,000,000,000,000,000,000,000,000,000 usd/day = $0 per day', () => {
        const { asString } = formatNumber(
          locale,
          usdPerDay,
          F(1, 100000000000000000000000000000000000n)
        );
        expect(asString).toEqual('≈$0.00 per day');
      });
    });

    describe('international', () => {
      it('[fr] 100,000 eur = 100 k €', () => {
        const [nr, unit] = makeFractionUnitTuple(F(100000), 'eur');
        const { asString } = formatNumber('fr-FR', unit, nr);
        expect((asString || '').replace(/\s/g, ' ')).toEqual(
          '100 k €'.replace(/\s/g, ' ')
        );
      });

      it('[de] 100,000 eur = 100.000 €', () => {
        const [nr, unit] = makeFractionUnitTuple(F(100000), 'eur');
        const { asString } = formatNumber('de-DE', unit, nr);
        expect((asString || '').replace(/\s/g, ' ')).toEqual(
          '100.000 €'.replace(/\s/g, ' ')
        );
      });

      it('[uk] 100,000 gbp = £100K', () => {
        const [nr, unit] = makeFractionUnitTuple(F(100000), 'gbp');
        const { partsOf, asString } = formatNumber('en-UK', unit, nr);
        expect(partsOf).toEqual([
          { type: 'currency', value: '£' },
          { type: 'integer', value: '100' },
          { type: 'compact', value: 'K' },
        ]);
        expect(asString).toEqual('£100K');
      });
    });

    describe('percentages', () => {
      it('formats percentages', () => {
        expect(
          formatNumber('en-US', null, F(1, 10), 'percentage').asString
        ).toEqual('10%');
      });
    });

    it.todo('scientific notation formatting rules');
  });
});

describe('detects if the number can be displayed precisely', () => {
  it('when abbreviated', () => {
    // Precision determined by fractional number length
    expect(getIsPrecise(new Fraction(123.34))).toEqual(true);
    expect(getIsPrecise(new Fraction(123.345))).toEqual(false);
    expect(getIsPrecise(new Fraction(1.256))).toEqual(false);
    expect(getIsPrecise(new Fraction(10, 4), 2)).toEqual(true);

    // Larger-than-1000 numbers have 3 digits available for precision,
    // the rest must be zero.
    expect(getIsPrecise(new Fraction(678n))).toEqual(true);
    expect(getIsPrecise(new Fraction(6780n))).toEqual(true);
    expect(getIsPrecise(new Fraction(67800n))).toEqual(true);
    expect(getIsPrecise(new Fraction(6700n))).toEqual(true);
    expect(getIsPrecise(new Fraction(67000n))).toEqual(true);
    expect(getIsPrecise(new Fraction(670000n))).toEqual(true);
    expect(getIsPrecise(new Fraction(678000n))).toEqual(true);
    expect(getIsPrecise(new Fraction(678900n))).toEqual(false);

    // Repeating fractions
    expect(getIsPrecise(new Fraction(1, 3))).toEqual(false);
    expect(getIsPrecise(new Fraction(1_000, 3))).toEqual(false);
    expect(getIsPrecise(new Fraction(10_000_000, 3))).toEqual(false);

    // Edge cases
    expect(getIsPrecise(new Fraction(1230))).toEqual(true);
    expect(getIsPrecise(new Fraction(1234))).toEqual(false);

    // Too many integers
    expect(getIsPrecise(new Fraction(123.34))).toEqual(true);
    expect(getIsPrecise(new Fraction(1230.34))).toEqual(false);
    expect(getIsPrecise(new Fraction(1234.34))).toEqual(false);
  });
});
