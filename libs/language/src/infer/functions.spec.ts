import { inferBlock } from '..';
import { buildType as t, getErrSpec, InferError } from '../type';
import { assign, block, c, funcDef, l, r, U } from '../utils';
import { makeContext } from './context';
import { inferFunction } from './functions';
import { inferProgram } from '.';

it('Accepts arguments types and returns a return type', () => {
  const ctx = makeContext();
  const functionWithSpecificTypes = funcDef('Fn', ['A'], r('A'));

  expect(inferFunction(ctx, functionWithSpecificTypes, [t.boolean()])).toEqual(
    t.boolean()
  );
});

it('cannot infinitely recurse', () => {
  const selfReferringProgram = [
    block(funcDef('Fn', ['A'], c('Fn', l(true)))),
    block(assign('Error', c('Fn', l(true)))),
  ];
  const context = inferProgram(selfReferringProgram);

  expect(getErrSpec(context.stack.get('Error'))?.errType).toEqual(
    'formula-cannot-call-itself'
  );
});

it('cannot indirectly infinitely recurse', () => {
  const selfReferringProgram = [
    block(funcDef('Fn', ['A'], c('Fn2', l(true)))),
    block(funcDef('Fn2', ['A'], c('Fn', l(true)))),
    block(assign('Error', c('Fn', l(true)))),
  ];
  const context = inferProgram(selfReferringProgram);

  expect(getErrSpec(context.stack.get('Error'))).toEqual({
    errType: 'formula-cannot-call-itself',
    fname: 'Fn',
  });
});

it('disallows wrong argument count', () => {
  const unaryFn = funcDef('Fn', ['A'], r('A'));

  let errorCtx = makeContext();
  expect(inferFunction(errorCtx, unaryFn, []).errorCause).toEqual(
    InferError.expectedArgCount('Fn', 1, 0)
  );

  errorCtx = makeContext();
  const badArgumentCountError2 = InferError.expectedArgCount('Fn', 1, 2);
  expect(
    inferFunction(errorCtx, unaryFn, [t.boolean(), t.string()]).errorCause
  ).toEqual(badArgumentCountError2);
});

it("gets a separate stack so as to not see another function's arg", () => {
  const funcs = block(
    funcDef('ShouldFail', [], r('OtherFunctionsArgument')),
    funcDef('Func', ['OtherFunctionsArgument'], c('ShouldFail')),
    c('Func', l('string'))
  );

  const ctx = makeContext();
  expect(inferBlock(funcs, ctx)).toMatchObject({
    type: 'number',
    unit: U('OtherFunctionsArgument', { known: false }),
  });
});
