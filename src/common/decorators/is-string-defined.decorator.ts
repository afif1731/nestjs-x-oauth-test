import { applyDecorators } from '@nestjs/common';

import { type TransformFnParams, Transform } from 'class-transformer';
import { IsDefined, IsNotEmpty, IsString } from 'class-validator';
import sanitizeHtml from 'sanitize-html';

export function IsStringDefined() {
  return applyDecorators(
    Transform((parameters: TransformFnParams) =>
      sanitizeHtml(parameters.value),
    ),
    IsString(),
    IsDefined(),
    IsNotEmpty(),
  );
}
