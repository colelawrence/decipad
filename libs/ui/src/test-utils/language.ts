import {
  Result,
  runCode as run,
  SerializedTypeKind,
  serializeResult,
} from '@decipad/computer';

export async function runCode<T extends SerializedTypeKind>(
  code: string
): Promise<Result.Result<T>> {
  const result = await run(code);
  return serializeResult<T>(result.type, result.value);
}
