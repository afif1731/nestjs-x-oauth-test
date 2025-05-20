/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { applyDecorators, BadRequestException } from '@nestjs/common';

import { plainToInstance, Transform, Type } from 'class-transformer';
import { IsArray, ValidateNested } from 'class-validator';

export function TransformToDtoArray(
  dtoClass: any,
  options?: { each?: boolean; strict?: boolean },
) {
  return applyDecorators(
    Transform(({ value }) => (value === '' ? undefined : value)),
    Transform(({ value }) => {
      if (typeof value === 'string') {
        try {
          let parsed = value;

          if (!parsed.startsWith('[') && !parsed.endsWith(']')) {
            parsed = `[${parsed}]`;
          }

          let parsedValue = JSON.parse(parsed);

          if (!Array.isArray(parsedValue)) {
            parsedValue = [parsedValue];
          }

          return plainToInstance(dtoClass, parsedValue);
        } catch (error) {
          console.error('JSON parsing error:', error);

          throw new BadRequestException('Invalid JSON format');
        }
      }

      return value;
    }),
    ValidateNested({ each: options?.each !== false }),
    Type(() => dtoClass),
    IsArray(),
  );
}
