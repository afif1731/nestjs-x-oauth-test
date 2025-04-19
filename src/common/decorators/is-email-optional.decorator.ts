import { applyDecorators } from '@nestjs/common';

import { type TransformFnParams, Transform } from 'class-transformer';
import { IsEmail, IsOptional } from 'class-validator';
import sanitizeHtml from 'sanitize-html';

export function IsEmailDefined() {
  return applyDecorators(
    Transform((parameters: TransformFnParams) =>
      sanitizeHtml(parameters.value),
    ),
    IsEmail(),
    IsOptional(),
  );
}
