import {
  type Result,
  runCode as run,
  type RunAstOptions,
  type SerializedTypeKind,
  serializeResult,
} from '@decipad/remote-computer';

export async function runCode<T extends SerializedTypeKind>(
  code: string,
  options: RunAstOptions = {}
): Promise<Result.Result<T>> {
  const result = await run(code, options);
  return serializeResult<T>(result.type, result.value);
}
