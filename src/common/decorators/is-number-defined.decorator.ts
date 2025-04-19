import { applyDecorators } from '@nestjs/common';

import { type TransformFnParams, Transform } from 'class-transformer';
import { IsDefined, IsNotEmpty, IsNumber } from 'class-validator';
import sanitizeHtml from 'sanitize-html';

export function IsNumberDefined() {
  return applyDecorators(
    Transform(({ value }) => Number.parseInt(value)),
    Transform((parameters: TransformFnParams) =>
      sanitizeHtml(parameters.value),
    ),
    IsNumber(),
    IsDefined(),
    IsNotEmpty(),
  );
}
