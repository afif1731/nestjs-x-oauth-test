import { applyDecorators } from '@nestjs/common';

import { Transform } from 'class-transformer';
import { IsBoolean, IsOptional } from 'class-validator';

export function IsBooleanOptional() {
  return applyDecorators(
    IsOptional(),
    Transform(({ value }) => {
      if (value === '' || value === null || value === undefined) {
        return;
      }

      if (value === 'true' || value === true) {
        return true;
      }

      if (value === 'false' || value === false) {
        return false;
      }

      return value;
    }),
    IsBoolean(),
  );
}
