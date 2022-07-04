import { inferBlock } from '..';
import { build as t, InferError } from '../type';
import { assign, block, c, funcDef, l, r, U } from '../utils';
import { makeContext } from './context';
import { inferFunction } from './functions';
import { inferProgram } from '.';

it('Accepts arguments types and returns a return type', async () => {
  const ctx = makeContext();
  const functionWithSpecificTypes = funcDef('Fn', ['A'], r('A'));

  expect(
    await inferFunction(ctx, functionWithSpecificTypes, [t.boolean()])
  ).toEqual(t.boolean());
});

it('cannot infinitely recurse', async () => {
  const selfReferringProgram = [
    block(funcDef('Fn', ['A'], c('Fn', l(true)))),
    block(assign('Error', c('Fn', l(true)))),
  ];
  const context = await inferProgram(selfReferringProgram);

  expect(context.stack.get('Error')?.errorCause?.spec.errType).toEqual(
    'formula-cannot-call-itself'
  );
});

it('cannot indirectly infinitely recurse', async () => {
  const selfReferringProgram = [
    block(funcDef('Fn', ['A'], c('Fn2', l(true)))),
    block(funcDef('Fn2', ['A'], c('Fn', l(true)))),
    block(assign('Error', c('Fn', l(true)))),
  ];
  const context = await inferProgram(selfReferringProgram);

  expect(context.stack.get('Error')?.errorCause?.spec).toEqual({
    errType: 'formula-cannot-call-itself',
    fname: 'Fn',
  });
});

it('disallows wrong argument count', async () => {
  const unaryFn = funcDef('Fn', ['A'], r('A'));

  let errorCtx = makeContext();
  expect((await inferFunction(errorCtx, unaryFn, [])).errorCause).toEqual(
    InferError.expectedArgCount('Fn', 1, 0)
  );

  errorCtx = makeContext();
  const badArgumentCountError2 = InferError.expectedArgCount('Fn', 1, 2);
  expect(
    (await inferFunction(errorCtx, unaryFn, [t.boolean(), t.string()]))
      .errorCause
  ).toEqual(badArgumentCountError2);
});

it("gets a separate stack so as to not see another function's arg", async () => {
  const funcs = block(
    funcDef('ShouldFail', [], r('OtherFunctionsArgument')),
    funcDef('Func', ['OtherFunctionsArgument'], c('ShouldFail')),
    c('Func', l('string'))
  );

  const ctx = makeContext();
  expect(await inferBlock(funcs, ctx)).toMatchObject({
    type: 'number',
    unit: U('OtherFunctionsArgument', { known: false }),
  });
});
