import { RunSubmitToolOutputsParams } from 'openai/resources/beta/threads/runs/runs';

export type RequestPayload = {
  result: RunSubmitToolOutputsParams.ToolOutput[];
};
