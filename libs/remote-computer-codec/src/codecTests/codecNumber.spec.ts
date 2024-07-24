// eslint-disable-next-line no-restricted-imports
import { Value } from '@decipad/language-types';
import DeciNumber, { N } from '@decipad/number';
// eslint-disable-next-line no-restricted-imports
import { createResizableArrayBuffer } from '@decipad/language-utils';
import { encodeNumber } from '../encode/encodeNumber';
import { decodeNumber } from '../decode/decodeNumber';

describe('encodes and decodes DeciNumber', () => {
  let buffer: ArrayBuffer;
  let view: Value.GrowableDataView<ArrayBuffer>;

  beforeEach(() => {
    buffer = createResizableArrayBuffer(2);
    view = new Value.GrowableDataView(buffer);
  });

  it('encodes and decodes 0', () => {
    const n = N(0);
    encodeNumber(view, 0, n);
    const [decoded] = decodeNumber(view, 0);
    expect(decoded).toMatchObject(n);
  });

  it('encodes and decodes infinity', () => {
    const n = DeciNumber.infinite(1);
    encodeNumber(view, 0, n);
    const [decoded] = decodeNumber(view, 0);
    expect(decoded).toMatchObject(n);
  });

  it('encodes and decodes - infinity', () => {
    const n = DeciNumber.infinite(-1);
    encodeNumber(view, 0, n);
    const [decoded] = decodeNumber(view, 0);
    expect(decoded).toMatchObject(n);
  });

  it('encodes and decodes undefined', () => {
    const n = DeciNumber.undefined();
    encodeNumber(view, 0, n);
    const [decoded] = decodeNumber(view, 0);
    expect(decoded).toMatchObject(n);
  });

  it('encodes and decodes a small integer number', () => {
    const n = N(11);
    encodeNumber(view, 0, n);
    const [decoded] = decodeNumber(view, 0);
    expect(decoded).toMatchObject(n);
  });

  it('encodes and decodes a big integer', () => {
    const n = N(1234567890123456789012345678901234567890n);
    encodeNumber(view, 0, n);
    const [decoded] = decodeNumber(view, 0);
    expect(decoded).toEqual(n);
  });

  it('encodes and decodes a negative big integer', () => {
    const n = N(-1234567890123456789012345678901234567890n);
    encodeNumber(view, 0, n);
    const [decoded] = decodeNumber(view, 0);
    expect(decoded).toEqual(n);
  });

  it('encodes and decodes many numbers', () => {
    const numbers = [
      N(0),
      N(1),
      N(11),
      N(1234567890123456789012345678901234567890n),
      N(-1234567890123456789012345678901234567890n),
      DeciNumber.infinite(1),
      DeciNumber.infinite(-1),
      DeciNumber.undefined(),
    ];
    let offset = 0;
    numbers.forEach((n) => {
      offset = encodeNumber(view, offset, n);
    });

    offset = 0;
    const decoded = numbers.map(() => {
      let n: DeciNumber;
      [n, offset] = decodeNumber(view, offset);
      return n;
    });
    expect(decoded).toMatchObject(numbers);
  });

  it('encodes and decodes huge number', () => {
    const n = N(
      1189242266311298097986843979979816113623218530233116691614040514185247022195204198844876946793466766585567122298245572035602893621548531436948744330144832666119212097765405084496547968754459777242608939559827078370950263955706569157083419454002858062607403313379631011615034719463198885425053041533214276391294462878131935095911843534875187464576281961384589513841015342209735295593913297743190460395256449946622801655683395632954250335746706067480413944004242291424530217131889736651046664964054688638890098197338088365806846439851589037623048762666183525318766710116134286078596383357206224471031968005664344925563908503787189022850264597092446163614487870622937450201279974025663717864690129860114283018454698869499915778776199002005n,
      18613486589608214202768969919732058639279087212922280928883173407822290039808167958699901019864167383642783040917937594433656848307425262909560214027603433288561420723961009496193813647846260275533196182725920739217911407728835946763163333937022614480467577687134590207265350702938876974213876307360901666818597655460964321847063802202643418815344123876921442979432547929035913405931366173254134340753038943997229578253688145239215810678739330577710354358162671037338750555698299156908210418782401387719374622989774002050958722516942465534087290273653696335922108007334797015490297896244603650802019031936695468982983694976032990916858816658470284017757128670922365275870314148989287444085692412217744190639244139126310470238496779074n
    );
    encodeNumber(view, 0, n);
    const decoded = decodeNumber(view, 0);
    expect(decoded[0]).toMatchObject(n);
  });
});
