import { serializeResult } from '@decipad/computer-utils';
import type { Result, SerializedTypeKind } from '@decipad/language-interfaces';
import { type RunAstOptions, runCode as run } from '@decipad/remote-computer';

export async function runCode<T extends SerializedTypeKind>(
  code: string,
  options: RunAstOptions = {}
): Promise<Result.Result<T>> {
  const result = await run(code, options);
  const meta = (result.meta != null ? () => result.meta : undefined) as
    | (() => Result.ResultMetadata<T>)
    | undefined;
  return serializeResult<T>(result.type, result.value, meta);
}
