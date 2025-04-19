import fsPromises from 'node:fs/promises';
import path from 'node:path';

import { type Role, PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();
const salt = bcrypt.genSaltSync(12);

interface IAccounts {
  id: string;
  email: string;
  username: string;
  password: string;
  is_active: boolean;
  role: Role;
}

export const accounts = async () => {
  try {
    console.log('Seed accounts');
    const pathFile = path.join(__dirname, '..', 'data', 'accounts.json');

    const jsonData = await fsPromises.readFile(pathFile, 'utf8');

    const datas: IAccounts[] = JSON.parse(jsonData);

    for (const data of datas) {
      const password = await bcrypt.hash(data.password, salt);

      await prisma.accounts.upsert({
        where: { id: data.id },
        create: {
          id: data.id,
          email: data.email,
          username: data.username,
          password,
          is_active: data.is_active,
          role: data.role,
        },
        update: {
          email: data.email,
          username: data.username,
          password,
          is_active: data.is_active,
          role: data.role,
        },
      });
    }
  } catch (error) {
    console.error(`Error in accounts: ${error}`);
  }
};