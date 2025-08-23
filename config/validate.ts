import { z } from 'zod';

import { calculatorSchema } from '@/schemas/calculatorSchema';

import appConfig from './app.json';

export const validatedConfig: z.infer<typeof calculatorSchema> =
  calculatorSchema.parse(appConfig);
