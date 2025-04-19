import { applyDecorators } from '@nestjs/common';

import { Expose, Transform } from 'class-transformer';
import { IsOptional } from 'class-validator';
import { FileField } from 'nestjs-file-upload';

export function IsFileOptional(allowedMimeTypes: string[], maxSize: number) {
  return applyDecorators(
    Transform(({ value }) => (value === '' ? undefined : value)),
    IsOptional(),
    Expose(),
    FileField({
      allowedMimeTypes,
      maxSize: maxSize * 1000 * 1000,
    }),
  );
}
