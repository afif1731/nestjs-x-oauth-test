import { applyDecorators } from '@nestjs/common';

import { type TransformFnParams, Transform } from 'class-transformer';
import { IsNumber, IsOptional } from 'class-validator';
import sanitizeHtml from 'sanitize-html';

export function IsNumberOptional() {
  return applyDecorators(
    Transform(({ value }) => Number.parseInt(value)),
    Transform((parameters: TransformFnParams) =>
      sanitizeHtml(parameters.value),
    ),
    IsOptional(),
    IsNumber(),
  );
}
