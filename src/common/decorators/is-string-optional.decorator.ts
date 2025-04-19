import { applyDecorators } from '@nestjs/common';

import { type TransformFnParams, Transform } from 'class-transformer';
import { IsOptional, IsString } from 'class-validator';
import sanitizeHtml from 'sanitize-html';

export function IsStringOptional() {
  return applyDecorators(
    Transform((parameters: TransformFnParams) =>
      sanitizeHtml(parameters.value),
    ),
    IsString(),
    IsOptional(),
  );
}
