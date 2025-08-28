import { z } from 'zod';

import { calculatorSchema, userConfigSchema } from '@/schemas/calculatorSchema';

import appConfig from './app.json';
import userConfig from './user-config.json';

export const validatedCalculatorConfig: z.infer<typeof calculatorSchema> =
  calculatorSchema.parse(appConfig);

export const validatedUserConfig: z.infer<typeof userConfigSchema> =
  userConfigSchema.parse(userConfig);
