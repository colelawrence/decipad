import { test, expect, describe, it } from 'vitest';
import { N, fromNumber, setupDeciNumberSnapshotSerializer } from '.';

setupDeciNumberSnapshotSerializer();

describe('Deci number', () => {
  it('can be constructed from a fraction-like number', () => {
    expect(fromNumber({ n: 1, d: 2, s: -1 })).toMatchInlineSnapshot(`
      DeciNumber {
        "d": 2n,
        "infinite": false,
        "n": 1n,
        "s": -1n,
      }
    `);
    expect(fromNumber({ n: 1n, d: '2', s: -1n })).toMatchInlineSnapshot(`
      DeciNumber {
        "d": 2n,
        "infinite": false,
        "n": 1n,
        "s": -1n,
      }
    `);

    expect(fromNumber({ n: '1', d: '2', s: '-1' })).toMatchInlineSnapshot(`
      DeciNumber {
        "d": 2n,
        "infinite": false,
        "n": 1n,
        "s": -1n,
      }
    `);

    expect(fromNumber(3)).toMatchInlineSnapshot(`
      DeciNumber {
        "d": 1n,
        "infinite": false,
        "n": 3n,
        "s": 1n,
      }
    `);

    expect(fromNumber(3, 2)).toMatchInlineSnapshot(`
      DeciNumber {
        "d": 2n,
        "infinite": false,
        "n": 3n,
        "s": 1n,
      }
    `);

    expect(fromNumber(Infinity)).toMatchInlineSnapshot(`
      DeciNumber {
        "d": undefined,
        "infinite": true,
        "n": undefined,
        "s": 1n,
      }
    `);

    expect(fromNumber(Infinity, Infinity)).toMatchInlineSnapshot(`
      DeciNumber {
        "d": undefined,
        "infinite": false,
        "n": undefined,
        "s": undefined,
      }
    `);

    expect(fromNumber(Infinity, 0)).toMatchInlineSnapshot(`
      DeciNumber {
        "d": undefined,
        "infinite": true,
        "n": undefined,
        "s": 1n,
      }
    `);

    expect(fromNumber(-Infinity)).toMatchInlineSnapshot(`
      DeciNumber {
        "d": undefined,
        "infinite": true,
        "n": undefined,
        "s": -1n,
      }
    `);

    expect(fromNumber({ n: Infinity })).toMatchInlineSnapshot(`
      DeciNumber {
        "d": undefined,
        "infinite": false,
        "n": undefined,
        "s": undefined,
      }
    `);

    expect(fromNumber({ n: 1, d: Infinity })).toMatchInlineSnapshot(`
      DeciNumber {
        "d": 1n,
        "infinite": false,
        "n": 0n,
        "s": 1n,
      }
    `);

    expect(fromNumber({ n: 1, d: -Infinity })).toMatchInlineSnapshot(`
      DeciNumber {
        "d": 1n,
        "infinite": false,
        "n": 0n,
        "s": -1n,
      }
    `);

    expect(fromNumber({ n: -1, d: -Infinity })).toMatchInlineSnapshot(`
      DeciNumber {
        "d": 1n,
        "infinite": false,
        "n": 0n,
        "s": 1n,
      }
    `);

    expect(fromNumber({ n: Infinity, d: Infinity })).toMatchInlineSnapshot(`
      DeciNumber {
        "d": undefined,
        "infinite": false,
        "n": undefined,
        "s": undefined,
      }
    `);

    expect(fromNumber(0, 0)).toMatchInlineSnapshot(`
      DeciNumber {
        "d": undefined,
        "infinite": false,
        "n": undefined,
        "s": undefined,
      }
    `);

    expect(fromNumber({ n: 0, d: 0 })).toMatchInlineSnapshot(`
      DeciNumber {
        "d": undefined,
        "infinite": false,
        "n": undefined,
        "s": undefined,
      }
    `);

    expect(fromNumber({ n: 0, d: 0, s: 1 })).toMatchInlineSnapshot(`
      DeciNumber {
        "d": undefined,
        "infinite": false,
        "n": undefined,
        "s": undefined,
      }
    `);

    expect(fromNumber(undefined)).toMatchInlineSnapshot(`
      DeciNumber {
        "d": undefined,
        "infinite": false,
        "n": undefined,
        "s": undefined,
      }
    `);

    expect(fromNumber(NaN)).toMatchInlineSnapshot(`
      DeciNumber {
        "d": undefined,
        "infinite": false,
        "n": undefined,
        "s": undefined,
      }
    `);
  });

  test('abs', () => {
    expect(fromNumber(-10).abs()).toMatchInlineSnapshot(`
      DeciNumber {
        "d": 1n,
        "infinite": false,
        "n": 10n,
        "s": 1n,
      }
    `);
    expect(fromNumber(undefined).abs()).toMatchInlineSnapshot(`
      DeciNumber {
        "d": undefined,
        "infinite": false,
        "n": undefined,
        "s": undefined,
      }
    `);
    expect(fromNumber(-Infinity).abs()).toMatchInlineSnapshot(`
      DeciNumber {
        "d": undefined,
        "infinite": true,
        "n": undefined,
        "s": -1n,
      }
    `);
  });

  test('neg', () => {
    expect(fromNumber(10).neg()).toMatchInlineSnapshot(`
      DeciNumber {
        "d": 1n,
        "infinite": false,
        "n": 10n,
        "s": -1n,
      }
    `);

    expect(fromNumber(-10).neg()).toMatchInlineSnapshot(`
      DeciNumber {
        "d": 1n,
        "infinite": false,
        "n": 10n,
        "s": 1n,
      }
    `);

    expect(fromNumber(undefined).neg()).toMatchInlineSnapshot(`
      DeciNumber {
        "d": undefined,
        "infinite": false,
        "n": undefined,
        "s": undefined,
      }
    `);

    expect(fromNumber(-Infinity).neg()).toMatchInlineSnapshot(`
      DeciNumber {
        "d": undefined,
        "infinite": true,
        "n": undefined,
        "s": 1n,
      }
    `);

    expect(fromNumber(Infinity).neg()).toMatchInlineSnapshot(`
      DeciNumber {
        "d": undefined,
        "infinite": true,
        "n": undefined,
        "s": -1n,
      }
    `);
  });

  test('add', () => {
    expect(fromNumber(10).add(fromNumber(5))).toMatchInlineSnapshot(`
      DeciNumber {
        "d": 1n,
        "infinite": false,
        "n": 15n,
        "s": 1n,
      }
    `);

    expect(fromNumber(undefined).add(fromNumber(5))).toMatchInlineSnapshot(`
      DeciNumber {
        "d": undefined,
        "infinite": false,
        "n": undefined,
        "s": undefined,
      }
    `);

    expect(fromNumber(undefined).add(fromNumber(Infinity)))
      .toMatchInlineSnapshot(`
      DeciNumber {
        "d": undefined,
        "infinite": false,
        "n": undefined,
        "s": undefined,
      }
    `);

    expect(fromNumber(-Infinity).add(fromNumber(Infinity)))
      .toMatchInlineSnapshot(`
      DeciNumber {
        "d": undefined,
        "infinite": true,
        "n": undefined,
        "s": -1n,
      }
    `);

    expect(fromNumber(undefined).add(fromNumber(undefined)))
      .toMatchInlineSnapshot(`
      DeciNumber {
        "d": undefined,
        "infinite": false,
        "n": undefined,
        "s": undefined,
      }
    `);

    expect(fromNumber(Infinity).add(fromNumber(undefined)))
      .toMatchInlineSnapshot(`
      DeciNumber {
        "d": undefined,
        "infinite": true,
        "n": undefined,
        "s": 1n,
      }
    `);
  });

  test('sub', () => {
    expect(fromNumber(10).sub(fromNumber(5))).toMatchInlineSnapshot(`
      DeciNumber {
        "d": 1n,
        "infinite": false,
        "n": 5n,
        "s": 1n,
      }
    `);

    expect(fromNumber(undefined).sub(fromNumber(5))).toMatchInlineSnapshot(`
      DeciNumber {
        "d": undefined,
        "infinite": false,
        "n": undefined,
        "s": undefined,
      }
    `);

    expect(fromNumber(undefined).sub(fromNumber(Infinity)))
      .toMatchInlineSnapshot(`
      DeciNumber {
        "d": undefined,
        "infinite": false,
        "n": undefined,
        "s": undefined,
      }
    `);

    expect(fromNumber(-Infinity).sub(fromNumber(Infinity)))
      .toMatchInlineSnapshot(`
      DeciNumber {
        "d": undefined,
        "infinite": true,
        "n": undefined,
        "s": -1n,
      }
    `);

    expect(fromNumber(undefined).sub(fromNumber(undefined)))
      .toMatchInlineSnapshot(`
      DeciNumber {
        "d": undefined,
        "infinite": false,
        "n": undefined,
        "s": undefined,
      }
    `);

    expect(fromNumber(Infinity).sub(fromNumber(undefined)))
      .toMatchInlineSnapshot(`
      DeciNumber {
        "d": undefined,
        "infinite": true,
        "n": undefined,
        "s": 1n,
      }
    `);
  });

  test('mul', () => {
    expect(fromNumber(10).mul(fromNumber(5))).toMatchInlineSnapshot(`
      DeciNumber {
        "d": 1n,
        "infinite": false,
        "n": 50n,
        "s": 1n,
      }
    `);

    expect(fromNumber(-10).mul(fromNumber(-5))).toMatchInlineSnapshot(`
      DeciNumber {
        "d": 1n,
        "infinite": false,
        "n": 50n,
        "s": 1n,
      }
    `);

    expect(fromNumber(10).mul(fromNumber(-5))).toMatchInlineSnapshot(`
      DeciNumber {
        "d": 1n,
        "infinite": false,
        "n": 50n,
        "s": -1n,
      }
    `);

    expect(fromNumber(undefined).mul(fromNumber(5))).toMatchInlineSnapshot(`
      DeciNumber {
        "d": undefined,
        "infinite": false,
        "n": undefined,
        "s": undefined,
      }
    `);

    expect(fromNumber(undefined).mul(fromNumber(Infinity)))
      .toMatchInlineSnapshot(`
      DeciNumber {
        "d": undefined,
        "infinite": false,
        "n": undefined,
        "s": undefined,
      }
    `);

    expect(fromNumber(-Infinity).mul(fromNumber(Infinity)))
      .toMatchInlineSnapshot(`
      DeciNumber {
        "d": undefined,
        "infinite": true,
        "n": undefined,
        "s": -1n,
      }
    `);

    expect(fromNumber(undefined).mul(fromNumber(undefined)))
      .toMatchInlineSnapshot(`
      DeciNumber {
        "d": undefined,
        "infinite": false,
        "n": undefined,
        "s": undefined,
      }
    `);

    expect(fromNumber(Infinity).mul(fromNumber(undefined)))
      .toMatchInlineSnapshot(`
      DeciNumber {
        "d": undefined,
        "infinite": true,
        "n": undefined,
        "s": 1n,
      }
    `);
  });

  test('div', () => {
    expect(fromNumber(5).div(fromNumber(10))).toMatchInlineSnapshot(`
      DeciNumber {
        "d": 2n,
        "infinite": false,
        "n": 1n,
        "s": 1n,
      }
    `);

    expect(fromNumber(-5).div(fromNumber(-10))).toMatchInlineSnapshot(`
      DeciNumber {
        "d": 2n,
        "infinite": false,
        "n": 1n,
        "s": 1n,
      }
    `);

    expect(fromNumber(5).div(fromNumber(-10))).toMatchInlineSnapshot(`
      DeciNumber {
        "d": 2n,
        "infinite": false,
        "n": 1n,
        "s": -1n,
      }
    `);

    expect(fromNumber(undefined).div(fromNumber(5))).toMatchInlineSnapshot(`
      DeciNumber {
        "d": undefined,
        "infinite": false,
        "n": undefined,
        "s": undefined,
      }
    `);

    expect(fromNumber(undefined).div(fromNumber(Infinity)))
      .toMatchInlineSnapshot(`
      DeciNumber {
        "d": undefined,
        "infinite": false,
        "n": undefined,
        "s": undefined,
      }
    `);

    expect(fromNumber(-Infinity).div(fromNumber(Infinity)))
      .toMatchInlineSnapshot(`
      DeciNumber {
        "d": undefined,
        "infinite": false,
        "n": undefined,
        "s": undefined,
      }
    `);

    expect(fromNumber(undefined).div(fromNumber(undefined)))
      .toMatchInlineSnapshot(`
      DeciNumber {
        "d": undefined,
        "infinite": false,
        "n": undefined,
        "s": undefined,
      }
    `);

    expect(fromNumber(Infinity).div(fromNumber(undefined)))
      .toMatchInlineSnapshot(`
      DeciNumber {
        "d": undefined,
        "infinite": true,
        "n": undefined,
        "s": 1n,
      }
    `);
  });

  test('pow', () => {
    expect(fromNumber(5).pow(fromNumber(10))).toMatchInlineSnapshot(`
      DeciNumber {
        "d": 1n,
        "infinite": false,
        "n": 9765625n,
        "s": 1n,
      }
    `);

    expect(
      N(10000001, 10000000).pow(fromNumber(200)).toString(1000)
    ).toMatchInlineSnapshot(
      `"1.0000200001990013134064685203565828088546901724511372197468851088081799866169239695812404431746116502406353205197309067579044392791172871965284500042648748144583084225669777972069454040713749738413292642768386034333544386312421193522009420169933423349592572776067120682634812470912945912898747446661111153797193273533369996104989396671420264312853395155948113712348274783631701312477780789954927822391838507809897884165054781057783045261244314791727773826180088018481336538133917669795282515005400181587373082218993807372276745644299348318897625141498121559977642426013223990136995408463312746143311829263506687036378769328064949555835984008697395967239661372878392510771429328432251932969108541508731251527013187030045591623753590324121170095057182494522751038850859231373661242253060021853965597559131330222131833479796476755544721525958819558738001481920145312448730823420033143775618730484063316977929646301312710409402652756962673642155248668891582098883061613911135269548313940284221507168147461"`
    );

    expect(fromNumber(-5).pow(fromNumber(-10))).toMatchInlineSnapshot(`
        DeciNumber {
          "d": 9765625n,
          "infinite": false,
          "n": 1n,
          "s": 1n,
        }
      `);

    expect(fromNumber(5).pow(fromNumber(-10))).toMatchInlineSnapshot(`
        DeciNumber {
          "d": 9765625n,
          "infinite": false,
          "n": 1n,
          "s": 1n,
        }
      `);

    expect(fromNumber(undefined).pow(fromNumber(5))).toMatchInlineSnapshot(`
        DeciNumber {
          "d": undefined,
          "infinite": false,
          "n": undefined,
          "s": undefined,
        }
      `);

    expect(fromNumber(undefined).pow(fromNumber(Infinity)))
      .toMatchInlineSnapshot(`
        DeciNumber {
          "d": undefined,
          "infinite": false,
          "n": undefined,
          "s": undefined,
        }
      `);

    expect(fromNumber(-Infinity).pow(fromNumber(Infinity)))
      .toMatchInlineSnapshot(`
        DeciNumber {
          "d": undefined,
          "infinite": true,
          "n": undefined,
          "s": -1n,
        }
      `);

    expect(fromNumber(undefined).pow(fromNumber(undefined)))
      .toMatchInlineSnapshot(`
        DeciNumber {
          "d": undefined,
          "infinite": false,
          "n": undefined,
          "s": undefined,
        }
      `);

    expect(fromNumber(Infinity).pow(fromNumber(undefined)))
      .toMatchInlineSnapshot(`
        DeciNumber {
          "d": undefined,
          "infinite": true,
          "n": undefined,
          "s": 1n,
        }
      `);
  });

  test('gcd', () => {
    expect(fromNumber(5).gcd(fromNumber(10))).toMatchInlineSnapshot(`
        DeciNumber {
          "d": 1n,
          "infinite": false,
          "n": 5n,
          "s": 1n,
        }
      `);

    expect(fromNumber(-5).gcd(fromNumber(-10))).toMatchInlineSnapshot(`
        DeciNumber {
          "d": 1n,
          "infinite": false,
          "n": 5n,
          "s": 1n,
        }
      `);

    expect(fromNumber(5).gcd(fromNumber(-10))).toMatchInlineSnapshot(`
        DeciNumber {
          "d": 1n,
          "infinite": false,
          "n": 5n,
          "s": 1n,
        }
      `);

    expect(fromNumber(undefined).gcd(fromNumber(5))).toMatchInlineSnapshot(`
        DeciNumber {
          "d": undefined,
          "infinite": false,
          "n": undefined,
          "s": undefined,
        }
      `);

    expect(fromNumber(undefined).gcd(fromNumber(Infinity)))
      .toMatchInlineSnapshot(`
        DeciNumber {
          "d": undefined,
          "infinite": false,
          "n": undefined,
          "s": undefined,
        }
      `);

    expect(fromNumber(-Infinity).gcd(fromNumber(Infinity)))
      .toMatchInlineSnapshot(`
        DeciNumber {
          "d": undefined,
          "infinite": true,
          "n": undefined,
          "s": -1n,
        }
      `);

    expect(fromNumber(undefined).gcd(fromNumber(undefined)))
      .toMatchInlineSnapshot(`
        DeciNumber {
          "d": undefined,
          "infinite": false,
          "n": undefined,
          "s": undefined,
        }
      `);

    expect(fromNumber(Infinity).gcd(fromNumber(undefined)))
      .toMatchInlineSnapshot(`
        DeciNumber {
          "d": undefined,
          "infinite": true,
          "n": undefined,
          "s": 1n,
        }
      `);
  });

  test('lcm', () => {
    expect(fromNumber(7).lcm(fromNumber(10))).toMatchInlineSnapshot(`
        DeciNumber {
          "d": 1n,
          "infinite": false,
          "n": 70n,
          "s": 1n,
        }
      `);

    expect(fromNumber(-7).lcm(fromNumber(-10))).toMatchInlineSnapshot(`
        DeciNumber {
          "d": 1n,
          "infinite": false,
          "n": 70n,
          "s": 1n,
        }
      `);

    expect(fromNumber(7).lcm(fromNumber(-10))).toMatchInlineSnapshot(`
        DeciNumber {
          "d": 1n,
          "infinite": false,
          "n": 70n,
          "s": 1n,
        }
      `);

    expect(fromNumber(undefined).lcm(fromNumber(5))).toMatchInlineSnapshot(`
        DeciNumber {
          "d": undefined,
          "infinite": false,
          "n": undefined,
          "s": undefined,
        }
      `);

    expect(fromNumber(undefined).lcm(fromNumber(Infinity)))
      .toMatchInlineSnapshot(`
        DeciNumber {
          "d": undefined,
          "infinite": false,
          "n": undefined,
          "s": undefined,
        }
      `);

    expect(fromNumber(-Infinity).lcm(fromNumber(Infinity)))
      .toMatchInlineSnapshot(`
        DeciNumber {
          "d": undefined,
          "infinite": true,
          "n": undefined,
          "s": -1n,
        }
      `);

    expect(fromNumber(undefined).lcm(fromNumber(undefined)))
      .toMatchInlineSnapshot(`
        DeciNumber {
          "d": undefined,
          "infinite": false,
          "n": undefined,
          "s": undefined,
        }
      `);

    expect(fromNumber(Infinity).lcm(fromNumber(undefined)))
      .toMatchInlineSnapshot(`
        DeciNumber {
          "d": undefined,
          "infinite": true,
          "n": undefined,
          "s": 1n,
        }
      `);
  });

  test('mod', () => {
    expect(fromNumber(17).mod(fromNumber(10))).toMatchInlineSnapshot(`
        DeciNumber {
          "d": 1n,
          "infinite": false,
          "n": 7n,
          "s": 1n,
        }
      `);

    expect(fromNumber(-17).mod(fromNumber(-10))).toMatchInlineSnapshot(`
        DeciNumber {
          "d": 1n,
          "infinite": false,
          "n": 7n,
          "s": -1n,
        }
      `);

    expect(fromNumber(17).mod(fromNumber(-10))).toMatchInlineSnapshot(`
        DeciNumber {
          "d": 1n,
          "infinite": false,
          "n": 7n,
          "s": 1n,
        }
      `);

    expect(fromNumber(undefined).mod(fromNumber(5))).toMatchInlineSnapshot(`
        DeciNumber {
          "d": undefined,
          "infinite": false,
          "n": undefined,
          "s": undefined,
        }
      `);

    expect(fromNumber(undefined).mod(fromNumber(Infinity)))
      .toMatchInlineSnapshot(`
        DeciNumber {
          "d": undefined,
          "infinite": false,
          "n": undefined,
          "s": undefined,
        }
      `);

    expect(fromNumber(-Infinity).mod(fromNumber(Infinity)))
      .toMatchInlineSnapshot(`
        DeciNumber {
          "d": undefined,
          "infinite": true,
          "n": undefined,
          "s": -1n,
        }
      `);

    expect(fromNumber(undefined).mod(fromNumber(undefined)))
      .toMatchInlineSnapshot(`
        DeciNumber {
          "d": undefined,
          "infinite": false,
          "n": undefined,
          "s": undefined,
        }
      `);

    expect(fromNumber(Infinity).mod(fromNumber(undefined)))
      .toMatchInlineSnapshot(`
        DeciNumber {
          "d": undefined,
          "infinite": true,
          "n": undefined,
          "s": 1n,
        }
      `);
  });

  test('ceil', () => {
    expect(fromNumber(17).ceil()).toMatchInlineSnapshot(`
        DeciNumber {
          "d": 1n,
          "infinite": false,
          "n": 17n,
          "s": 1n,
        }
      `);

    expect(fromNumber(17, 10).ceil(0)).toMatchInlineSnapshot(`
        DeciNumber {
          "d": 1n,
          "infinite": false,
          "n": 2n,
          "s": 1n,
        }
      `);

    expect(fromNumber(-17).ceil(0)).toMatchInlineSnapshot(`
        DeciNumber {
          "d": 1n,
          "infinite": false,
          "n": 17n,
          "s": -1n,
        }
      `);

    expect(fromNumber(undefined).ceil(0)).toMatchInlineSnapshot(`
        DeciNumber {
          "d": undefined,
          "infinite": false,
          "n": undefined,
          "s": undefined,
        }
      `);

    expect(fromNumber(-Infinity).ceil(0)).toMatchInlineSnapshot(`
        DeciNumber {
          "d": undefined,
          "infinite": true,
          "n": undefined,
          "s": -1n,
        }
      `);

    expect(fromNumber(undefined).ceil(0)).toMatchInlineSnapshot(`
        DeciNumber {
          "d": undefined,
          "infinite": false,
          "n": undefined,
          "s": undefined,
        }
      `);

    expect(fromNumber(Infinity).ceil(0)).toMatchInlineSnapshot(`
        DeciNumber {
          "d": undefined,
          "infinite": true,
          "n": undefined,
          "s": 1n,
        }
      `);
  });

  test('floor', () => {
    expect(fromNumber(17).floor()).toMatchInlineSnapshot(`
        DeciNumber {
          "d": 1n,
          "infinite": false,
          "n": 17n,
          "s": 1n,
        }
      `);

    expect(fromNumber(17, 10).floor(0)).toMatchInlineSnapshot(`
        DeciNumber {
          "d": 1n,
          "infinite": false,
          "n": 1n,
          "s": 1n,
        }
      `);

    expect(fromNumber(-17).floor(0)).toMatchInlineSnapshot(`
        DeciNumber {
          "d": 1n,
          "infinite": false,
          "n": 17n,
          "s": -1n,
        }
      `);

    expect(fromNumber(undefined).floor(0)).toMatchInlineSnapshot(`
        DeciNumber {
          "d": undefined,
          "infinite": false,
          "n": undefined,
          "s": undefined,
        }
      `);

    expect(fromNumber(-Infinity).floor(0)).toMatchInlineSnapshot(`
        DeciNumber {
          "d": undefined,
          "infinite": true,
          "n": undefined,
          "s": -1n,
        }
      `);

    expect(fromNumber(undefined).floor(0)).toMatchInlineSnapshot(`
        DeciNumber {
          "d": undefined,
          "infinite": false,
          "n": undefined,
          "s": undefined,
        }
      `);

    expect(fromNumber(Infinity).floor(0)).toMatchInlineSnapshot(`
        DeciNumber {
          "d": undefined,
          "infinite": true,
          "n": undefined,
          "s": 1n,
        }
      `);
  });

  test('round', () => {
    expect(fromNumber(17).round()).toMatchInlineSnapshot(`
        DeciNumber {
          "d": 1n,
          "infinite": false,
          "n": 17n,
          "s": 1n,
        }
      `);

    expect(fromNumber(17, 10).round(0)).toMatchInlineSnapshot(`
        DeciNumber {
          "d": 1n,
          "infinite": false,
          "n": 2n,
          "s": 1n,
        }
      `);

    expect(fromNumber(-17).round(0)).toMatchInlineSnapshot(`
        DeciNumber {
          "d": 1n,
          "infinite": false,
          "n": 17n,
          "s": -1n,
        }
      `);

    expect(fromNumber(undefined).round(0)).toMatchInlineSnapshot(`
        DeciNumber {
          "d": undefined,
          "infinite": false,
          "n": undefined,
          "s": undefined,
        }
      `);

    expect(fromNumber(-Infinity).round(0)).toMatchInlineSnapshot(`
        DeciNumber {
          "d": undefined,
          "infinite": true,
          "n": undefined,
          "s": -1n,
        }
      `);

    expect(fromNumber(undefined).round(0)).toMatchInlineSnapshot(`
        DeciNumber {
          "d": undefined,
          "infinite": false,
          "n": undefined,
          "s": undefined,
        }
      `);

    expect(fromNumber(Infinity).round(0)).toMatchInlineSnapshot(`
        DeciNumber {
          "d": undefined,
          "infinite": true,
          "n": undefined,
          "s": 1n,
        }
      `);
  });

  test('inverse', () => {
    expect(fromNumber(-10, 15).inverse()).toMatchInlineSnapshot(`
        DeciNumber {
          "d": 2n,
          "infinite": false,
          "n": 3n,
          "s": -1n,
        }
      `);
    expect(fromNumber(undefined).inverse()).toMatchInlineSnapshot(`
        DeciNumber {
          "d": undefined,
          "infinite": false,
          "n": undefined,
          "s": undefined,
        }
      `);
    expect(fromNumber(-Infinity).inverse()).toMatchInlineSnapshot(`
        DeciNumber {
          "d": undefined,
          "infinite": true,
          "n": undefined,
          "s": -1n,
        }
      `);
  });

  test('simplify', () => {
    expect(fromNumber(-10, 15).simplify()).toMatchInlineSnapshot(`
        DeciNumber {
          "d": 3n,
          "infinite": false,
          "n": 2n,
          "s": -1n,
        }
      `);
    expect(fromNumber(-20, 15).simplify(1)).toMatchInlineSnapshot(`
        DeciNumber {
          "d": 1n,
          "infinite": false,
          "n": 1n,
          "s": -1n,
        }
      `);
    expect(fromNumber(undefined).simplify(0)).toMatchInlineSnapshot(`
        DeciNumber {
          "d": undefined,
          "infinite": false,
          "n": undefined,
          "s": undefined,
        }
      `);
    expect(fromNumber(-Infinity).inverse()).toMatchInlineSnapshot(`
        DeciNumber {
          "d": undefined,
          "infinite": true,
          "n": undefined,
          "s": -1n,
        }
      `);
  });

  test('equals', () => {
    expect(fromNumber(-10, 15).equals(fromNumber(-2, 3))).toMatchInlineSnapshot(
      `true`
    );
    expect(
      fromNumber(-10, 15).equals(fromNumber(undefined))
    ).toMatchInlineSnapshot(`false`);
    expect(fromNumber(NaN).equals(fromNumber(undefined))).toMatchInlineSnapshot(
      `true`
    );
    expect(
      fromNumber(Infinity).equals(fromNumber(Infinity))
    ).toMatchInlineSnapshot(`true`);
    expect(
      fromNumber(Infinity).equals(fromNumber(-Infinity))
    ).toMatchInlineSnapshot(`false`);

    expect(
      fromNumber(Infinity).equals(fromNumber(undefined))
    ).toMatchInlineSnapshot(`false`);
  });

  test('compare', () => {
    expect(
      fromNumber(-10, 15).compare(fromNumber(-2, 3))
    ).toMatchInlineSnapshot(`0`);
    expect(
      fromNumber(-10, 15).compare(fromNumber(undefined))
    ).toMatchInlineSnapshot(`-1`);
    expect(
      fromNumber(NaN).compare(fromNumber(undefined))
    ).toMatchInlineSnapshot(`0`);
    expect(
      fromNumber(Infinity).compare(fromNumber(Infinity))
    ).toMatchInlineSnapshot(`0`);
    expect(
      fromNumber(Infinity).compare(fromNumber(-Infinity))
    ).toMatchInlineSnapshot(`0`);

    expect(
      fromNumber(Infinity).compare(fromNumber(undefined))
    ).toMatchInlineSnapshot(`0`);
  });

  test('divisible', () => {
    expect(
      fromNumber(-10, 15).divisible(fromNumber(-2, 3))
    ).toMatchInlineSnapshot(`true`);
    expect(
      fromNumber(-10, 15).divisible(fromNumber(undefined))
    ).toMatchInlineSnapshot(`false`);
    expect(
      fromNumber(NaN).divisible(fromNumber(undefined))
    ).toMatchInlineSnapshot(`false`);
    expect(
      fromNumber(Infinity).divisible(fromNumber(Infinity))
    ).toMatchInlineSnapshot(`false`);
    expect(
      fromNumber(Infinity).divisible(fromNumber(-Infinity))
    ).toMatchInlineSnapshot(`false`);
    expect(
      fromNumber(Infinity).divisible(fromNumber(undefined))
    ).toMatchInlineSnapshot(`false`);
    expect(
      fromNumber(undefined).divisible(fromNumber(undefined))
    ).toMatchInlineSnapshot(`false`);
  });

  test('valueOf', () => {
    expect(fromNumber(-10, 15).valueOf()).toMatchInlineSnapshot(
      `-0.6666666666666666`
    );
    expect(fromNumber(undefined).valueOf()).toMatchInlineSnapshot(`NaN`);
    expect(fromNumber(Infinity).valueOf()).toMatchInlineSnapshot(`Infinity`);
    expect(fromNumber(-Infinity).valueOf()).toMatchInlineSnapshot(`-Infinity`);
  });

  test('toString', () => {
    expect(fromNumber(-10, 15).toString()).toMatchInlineSnapshot(`"-0.(6)"`);
    expect(fromNumber(undefined).toString()).toMatchInlineSnapshot(`"—"`);
    expect(fromNumber(Infinity).toString()).toMatchInlineSnapshot(`"∞"`);
    expect(fromNumber(-Infinity).toString()).toMatchInlineSnapshot(`"-∞"`);
  });

  test('toLatex', () => {
    expect(fromNumber(-10, 15).toLatex()).toMatchInlineSnapshot(
      `"-\\frac{2}{3}"`
    );
    expect(fromNumber(undefined).toLatex()).toMatchInlineSnapshot(`"—"`);
    expect(fromNumber(Infinity).toLatex()).toMatchInlineSnapshot(`"∞"`);
    expect(fromNumber(-Infinity).toLatex()).toMatchInlineSnapshot(`"-∞"`);
  });

  test('toFraction', () => {
    expect(fromNumber(-10, 15).toFraction()).toMatchInlineSnapshot(`"-2/3"`);
    expect(fromNumber(undefined).toFraction()).toMatchInlineSnapshot(`"—"`);
    expect(fromNumber(Infinity).toFraction()).toMatchInlineSnapshot(`"∞"`);
    expect(fromNumber(-Infinity).toFraction()).toMatchInlineSnapshot(`"-∞"`);
  });

  test('toContinued', () => {
    expect(fromNumber(-10, 15).toContinued()).toMatchInlineSnapshot(`
        [
          0n,
          1n,
          2n,
        ]
      `);
    expect(fromNumber(undefined).toContinued()).toMatchInlineSnapshot(`[]`);
    expect(fromNumber(Infinity).toContinued()).toMatchInlineSnapshot(`
        [
          Infinity,
          1,
        ]
      `);
    expect(fromNumber(-Infinity).toContinued()).toMatchInlineSnapshot(`
        [
          -Infinity,
          1,
        ]
      `);
  });

  test('clone', () => {
    expect(fromNumber(-10, 15).clone()).toMatchInlineSnapshot(`
        DeciNumber {
          "d": 3n,
          "infinite": false,
          "n": 2n,
          "s": -1n,
        }
      `);
    expect(fromNumber(undefined).clone()).toMatchInlineSnapshot(`
        DeciNumber {
          "d": undefined,
          "infinite": false,
          "n": undefined,
          "s": undefined,
        }
      `);
    expect(fromNumber(Infinity).clone()).toMatchInlineSnapshot(`
        DeciNumber {
          "d": undefined,
          "infinite": true,
          "n": undefined,
          "s": 1n,
        }
      `);
    expect(fromNumber(-Infinity).clone()).toMatchInlineSnapshot(`
        DeciNumber {
          "d": undefined,
          "infinite": true,
          "n": undefined,
          "s": -1n,
        }
      `);
  });
});
