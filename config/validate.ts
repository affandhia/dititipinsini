import { z } from 'zod';

import { calculatorSchema } from '@/schemas/calculatorSchema';

import appConfig from './app.json';

export const validatedCalculatorConfig: z.infer<typeof calculatorSchema> =
  calculatorSchema.parse(appConfig);
