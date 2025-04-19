import { applyDecorators } from '@nestjs/common';

import { type TransformFnParams, Transform } from 'class-transformer';
import { IsBoolean, IsDefined } from 'class-validator';

export function IsBooleanDefined() {
  return applyDecorators(
    Transform((parameters: TransformFnParams) => {
      const value = parameters.value;

      if (typeof value === 'string') {
        return value.toLowerCase() === 'true';
      }

      return value;
    }),
    IsBoolean(),
    IsDefined(),
  );
}
