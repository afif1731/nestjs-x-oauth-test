import { SetMetadata } from '@nestjs/common';

import { type Role } from '@prisma/client';

export const ROLES = (...roles: Role[]) => SetMetadata('roles', roles);
