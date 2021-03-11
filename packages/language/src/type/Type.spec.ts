import { produce } from "immer";
import { c, l } from "../utils";
import { Type, inverseExponent } from "./index";
import { InferError } from "./InferError";

const testNode = c("node 1", l(1));
const nilPos = {
  line: 2,
  column: 0,
  char: 0,
};

const meter: AST.Unit = {
  unit: "meter",
  exp: 1,
  multiplier: 1,
  known: true,
  start: nilPos,
  end: nilPos,
};
const second: AST.Unit = {
  unit: "second",
  exp: 1,
  multiplier: 1,
  known: true,
  start: nilPos,
  end: nilPos,
};
const dollar: AST.Unit = {
  unit: "USD",
  exp: 1,
  multiplier: 1,
  known: false,
  start: nilPos,
  end: nilPos,
};

it("Can assert type equivalence and pass on this information", () => {
  const type = new Type("string");

  expect(type.hasType("string")).toEqual(type);
  expect(type.sameAs(type)).toEqual(type);
});

it('Can be made to represent any ol\' type', () => {
  const anyType = new Type()

  expect(anyType.hasType('string')).toEqual(Type.String)
  expect(anyType.hasType('number')).toEqual(Type.Number)
})

describe('Impossible types', () => {
  it("returns an impossible type and remembers causality", () => {
    const type = new Type("string");

    expect(type.hasType("boolean")).toEqual(
      Type.Impossible.withErrorCause(
        new InferError("Mismatched types: string and boolean")
      )
    );

    const differentType = new Type("number");
    expect(type.sameAs(differentType)).toEqual(
      Type.Impossible.withErrorCause(
        new InferError("Mismatched types: string and number")
      )
    );
  });

  it('propagates impossibility', () => {
    const imp = Type.Impossible.withErrorCause(new InferError('imp 1'))
    const imp2 = Type.Impossible.withErrorCause(new InferError('imp 2'))

    expect(imp.sameAs(imp2)).toEqual(imp)
    expect(Type.Number.sameAs(imp2)).toEqual(imp2)

    expect(imp.hasType("string")).toEqual(imp)

    expect(imp.withUnit([meter])).toEqual(imp)
    expect(imp.multiplyUnit([meter])).toEqual(imp)
    expect(imp.divideUnit([meter])).toEqual(imp)

    expect(imp.withErrorCause(new InferError('ignored different error'))).toEqual(imp)
  })
})

describe("Type.runFunctor", () => {
  it("replicates types in arguments which are already impossible, and does not call the function", () => {
    const impossible = Type.Impossible.withErrorCause(
      new InferError("")
    );
    const functor = jest.fn();

    expect(Type.runFunctor(testNode, functor, impossible)).toEqual(impossible);
    expect(functor).not.toHaveBeenCalled();
  });

  it("calls the functor and assigns an error cause and source node to it if there is an error", () => {
    const type = Type.String;
    const functor = (a: Type) => a.withErrorCause(new InferError(""));

    expect(Type.runFunctor(testNode, functor, type)).toEqual(
      type.withErrorCause(new InferError("")).inNode(testNode)
    );
  });

  it('returns what the functor returns, when all is normal', () => {
    expect(Type.runFunctor(testNode, () => Type.Boolean)).toEqual(Type.Boolean)
  })
});

describe('Type.combine', () => {
  it('returns the last type', () => {
    expect(Type.combine(Type.Number, Type.String)).toEqual(Type.String)
  })

  it('returns any error in the args', () => {
    const badType = Type.Impossible.withErrorCause(new InferError(''))
    expect(Type.combine(Type.Number, badType)).toEqual(badType)
  })

  it('panics when called with zero arguments', () => {
    expect(() => Type.combine()).toThrow()
  })
})

const setExponent = (u: AST.Unit, exp: number) =>
  produce(u, (u) => {
    u.exp = exp;
  });

const invMeter: AST.Unit = inverseExponent(meter);
const invSecond: AST.Unit = inverseExponent(second);

const numberInMeter = produce(Type.Number, (type) => {
  type.unit = [meter];
});
const numberInMeterBySecond = produce(Type.Number, (type) => {
  type.unit = [meter, second];
});
const numberInMeterPerSecond = produce(Type.Number, (type) => {
  type.unit = [meter, invSecond];
});

it("has a withUnit method", () => {
  expect(Type.Number.withUnit([meter])).toEqual(numberInMeter);
  expect(Type.Number.withUnit([meter, second])).toEqual(numberInMeterBySecond);
  expect(Type.Number.withUnit([meter]).withUnit(null)).toEqual(Type.Number);

  expect(Type.Number.withUnit([meter]).withUnit([meter])).toEqual(Type.Number.withUnit([meter]))

  // Mismatched units
  expect(
    Type.Number.withUnit([meter]).withUnit([second]).errorCause
  ).toEqual(new InferError("Mismatched units: meter and second"));
  expect(
    Type.Number.withUnit([meter, second]).withUnit([second]).errorCause
  ).toEqual(new InferError("Mismatched units: meter.second and second"));
});

it("can be stringified", () => {
  expect(Type.Number.toString()).toEqual("<number>");
  expect(Type.Number.withUnit([meter]).toString()).toEqual("meter");
  expect(Type.Number.withUnit([meter, second]).toString()).toEqual(
    "meter.second"
  );
  expect(
    Type.Number.withUnit([meter, inverseExponent(second)]).toString()
  ).toEqual("meter.second^-1");
});

describe("divideUnit", () => {
  it("divides units", () => {
    expect(Type.Number.withUnit([meter]).divideUnit([second])).toEqual(
      numberInMeterPerSecond
    );
  });

  it("exponentiates units", () => {
    expect(Type.Number.withUnit([invSecond]).divideUnit([second])).toEqual(
      Type.Number.withUnit([setExponent(second, -2)])
    );

    expect(
      Type.Number.withUnit([setExponent(second, -2)]).divideUnit([second])
    ).toEqual(Type.Number.withUnit([setExponent(second, -3)]));
  });

  it("exponentiation that results in 0-exponent eliminates the unit", () => {
    expect(Type.Number.withUnit([meter]).divideUnit([meter])).toEqual(
      Type.Number
    );
  });

  it("divides units even further", () => {
    expect(
      Type.Number.withUnit([meter, invSecond]).divideUnit([dollar]).unit
    ).toEqual([
      setExponent(dollar, -1), // first because of sort
      meter,
      invSecond,
    ]);
  });

  it("maintains units when one of the operands is unitless", () => {
    expect(Type.Number.withUnit([meter]).divideUnit(null)).toEqual(
      Type.Number.withUnit([meter])
    );
    expect(Type.Number.withUnit(null).divideUnit([invMeter])).toEqual(
      Type.Number.withUnit([meter])
    );
  });
});

describe("multiplyUnit", () => {
  it("multiplies units", () => {
    expect(numberInMeterPerSecond.multiplyUnit([second])).toEqual(
      Type.Number.withUnit([meter])
    );
  });

  it("when one of the numbers has no unit, the other unit prevails", () => {
    expect(Type.Number.withUnit([meter, second]).multiplyUnit(null)).toEqual(
      Type.Number.withUnit([meter, second])
    );
    expect(Type.Number.withUnit(null).multiplyUnit([meter, second])).toEqual(
      Type.Number.withUnit([meter, second])
    );
  });

  it("eliminates units that are opposite on both sides", () => {
    expect(
      Type.Number.withUnit([invMeter, invSecond]).multiplyUnit([meter, second])
    ).toEqual(Type.Number.withUnit(null));
  });
});
