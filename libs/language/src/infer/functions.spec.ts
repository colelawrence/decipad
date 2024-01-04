// eslint-disable-next-line no-restricted-imports
import { InferError, buildType as t } from '@decipad/language-types';
import { Realm, inferBlock } from '..';
import { getErrSpec } from '../type';
import { assign, block, c, funcDef, l, r, U } from '../utils';
import { makeContext } from './context';
import { inferFunction } from './functions';
import { inferProgram } from '.';

describe('function inference', () => {
  it('Accepts arguments types and returns a return type', async () => {
    const ctx = makeContext();
    const functionWithSpecificTypes = funcDef('Fn', ['A'], r('A'));

    expect(
      await inferFunction(new Realm(ctx), functionWithSpecificTypes, [
        t.boolean(),
      ])
    ).toEqual(t.boolean());
  });

  it('cannot infinitely recurse', async () => {
    const selfReferringProgram = [
      block(funcDef('Fn', ['A'], c('Fn', l(true)))),
      block(assign('Error', c('Fn', l(true)))),
    ];
    const context = await inferProgram(selfReferringProgram);

    expect(getErrSpec(context.stack.get('Error'))?.errType).toEqual(
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

    expect(getErrSpec(context.stack.get('Error'))).toEqual({
      errType: 'formula-cannot-call-itself',
      fname: 'Fn',
    });
  });

  it('disallows wrong argument count', async () => {
    const unaryFn = funcDef('Fn', ['A'], r('A'));

    let errorCtx = makeContext();
    expect(
      (await inferFunction(new Realm(errorCtx), unaryFn, [])).errorCause
    ).toEqual(InferError.expectedArgCount('Fn', 1, 0));

    errorCtx = makeContext();
    const badArgumentCountError2 = InferError.expectedArgCount('Fn', 1, 2);
    expect(
      (
        await inferFunction(new Realm(errorCtx), unaryFn, [
          t.boolean(),
          t.string(),
        ])
      ).errorCause
    ).toEqual(badArgumentCountError2);
  });

  it("gets a separate stack so as to not see another function's arg", async () => {
    const funcs = block(
      funcDef('ShouldFail', [], r('OtherFunctionsArgument')),
      funcDef('Func', ['OtherFunctionsArgument'], c('ShouldFail')),
      c('Func', l('string'))
    );

    const ctx = makeContext();
    expect(await inferBlock(funcs, new Realm(ctx))).toMatchObject({
      type: 'number',
      unit: U('OtherFunctionsArgument', { known: false }),
    });
  });

  it('can access parent scope', async () => {
    const funcs = block(
      funcDef(
        'Function',
        ['FuncArg'],
        funcDef('Func2', [], r('FuncArg')),
        funcDef('Func', [], c('Func2')),
        c('Func')
      ),
      c('Function', l(true))
    );

    const ctx = makeContext();
    expect(await inferBlock(funcs, new Realm(ctx))).toMatchObject({
      errorCause: null,
      type: 'boolean',
    });
  });
});
