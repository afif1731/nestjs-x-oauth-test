import { applyDecorators } from '@nestjs/common';

import { Expose, Transform } from 'class-transformer';
import { IsDefined } from 'class-validator';
import { FileField } from 'nestjs-file-upload';

export function IsFileDefined(allowedMimeTypes: string[], maxSize: number) {
  return applyDecorators(
    Transform(({ value }) => (value === '' ? undefined : value)),
    IsDefined(),
    Expose(),
    FileField({
      allowedMimeTypes,
      maxSize: maxSize * 1000 * 1000,
    }),
  );
}
