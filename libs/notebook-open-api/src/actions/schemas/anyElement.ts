import { z } from 'zod';

export const anyElement = () =>
  z.object({
    id: z.string(),
    type: z.string(),
    children: z.array(z.unknown()),
  });
