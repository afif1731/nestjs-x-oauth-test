import { applyDecorators } from '@nestjs/common';

import { Transform } from 'class-transformer';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export function IsEnumOptional<T extends object>(data: T) {
  return applyDecorators(
    IsOptional(),
    Transform(parameters =>
      parameters.value === '' ? undefined : parameters.value,
    ),
    IsString(),
    IsEnum(data),
  );
}
