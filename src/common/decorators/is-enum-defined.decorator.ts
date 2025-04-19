import { applyDecorators } from '@nestjs/common';

import { type TransformFnParams, Transform } from 'class-transformer';
import { IsDefined, IsEnum, IsNotEmpty } from 'class-validator';
import sanitizeHtml from 'sanitize-html';

export function IsEnumDefined<T extends object>(data: T) {
  return applyDecorators(
    Transform((parameters: TransformFnParams) =>
      sanitizeHtml(parameters.value),
    ),
    IsDefined(),
    IsNotEmpty(),
    IsEnum(data),
  );
}
