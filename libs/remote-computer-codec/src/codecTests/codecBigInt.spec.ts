// eslint-disable-next-line no-restricted-imports
import { Value } from '@decipad/language-types';
import { encodeBigInt } from '../encode/encodeBigInt';
import { decodeBigInt } from '../decode/decodeBigInt';
// eslint-disable-next-line no-restricted-imports
import { createResizableArrayBuffer } from '@decipad/language-utils';

describe('encodes and decodes bigints', () => {
  let buffer: ArrayBuffer;
  let view: Value.GrowableDataView<ArrayBuffer>;

  beforeEach(() => {
    buffer = createResizableArrayBuffer(2);
    view = new Value.GrowableDataView(buffer);
  });

  it('encodes and decodes 0', () => {
    const bigInt = 0n;
    encodeBigInt(view, 0, bigInt);
    const [decoded] = decodeBigInt(view, 0);
    expect(decoded).toEqual(bigInt);
  });

  it('encodes and decodes a small bigint', () => {
    const bigInt = 11n;
    encodeBigInt(view, 0, bigInt);
    const [decoded] = decodeBigInt(view, 0);
    expect(decoded).toEqual(bigInt);
  });

  it('encodes and decodes a big bigint', () => {
    const bigInt = 1234567890123456789012345678901234567890n;
    encodeBigInt(view, 0, bigInt);
    const [decoded] = decodeBigInt(view, 0);
    expect(decoded).toEqual(bigInt);
  });

  it('encodes and decodes a bigint with a negative sign', () => {
    const bigInt = -1234567890123456789012345678901234567890n;
    encodeBigInt(view, 0, bigInt);
    const [decoded] = decodeBigInt(view, 0);
    expect(decoded).toEqual(bigInt);
  });

  it('encodes and decodes many bigints', () => {
    const bigInts = [
      0n,
      11n,
      1234567890123456789012345678901234567890n,
      -1234567890123456789012345678901234567890n,
      1189242266311298097986843979979816113623218530233116691614040514185247022195204198844876946793466766585567122298245572035602893621548531436948744330144832666119212097765405084496547968754459777242608939559827078370950263955706569157083419454002858062607403313379631011615034719463198885425053041533214276391294462878131935095911843534875187464576281961384589513841015342209735295593913297743190460395256449946622801655683395632954250335746706067480413944004242291424530217131889736651046664964054688638890098197338088365806846439851589037623048762666183525318766710116134286078596383357206224471031968005664344925563908503787189022850264597092446163614487870622937450201279974025663717864690129860114283018454698869499915778776199002005n,
    ];

    let offset = 0;
    for (const bigInt of bigInts) {
      offset = encodeBigInt(view, offset, bigInt);
    }

    offset = 0;
    for (const bigInt of bigInts) {
      const [decoded, newOffset] = decodeBigInt(view, offset);
      expect(decoded).toEqual(bigInt);
      offset = newOffset;
    }
  });
});
