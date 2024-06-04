import { serializeResult } from '@decipad/computer-utils';
import type { Result, SerializedTypeKind } from '@decipad/language-interfaces';
import { type RunAstOptions, runCode as run } from '@decipad/remote-computer';

export async function runCode<T extends SerializedTypeKind>(
  code: string,
  options: RunAstOptions = {}
): Promise<Result.Result<T>> {
  const result = await run(code, options);
  return serializeResult<T>(result.type, result.value);
}
