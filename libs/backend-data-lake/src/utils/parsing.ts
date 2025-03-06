import { badRequest } from '@hapi/boom';
import { ZodError, ZodSchema, infer as zInfer } from 'zod';

export const parsing =
  <TSchema extends ZodSchema, TReturn = zInfer<TSchema>>(z: TSchema) =>
  (o: unknown): TReturn => {
    try {
      return z.parse(o);
    } catch (err) {
      if (err instanceof ZodError) {
        throw badRequest(err.message);
      }
      throw err;
    }
  };
