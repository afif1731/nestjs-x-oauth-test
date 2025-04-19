/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/naming-convention */
export interface IPaginatedResult<T> {
  data: T[];
  meta: {
    total: number;
    lastPage: number;
    currentPage: number;
    perPage: number;
    prev: number | null;
    next: number | null;
  };
}

interface Args {
  where?: any;
}

export async function paginate<T, K extends Args>(
  model: any,
  page: number,
  perPage: number,
  args: K,
): Promise<IPaginatedResult<T>> {
  const skip = page > 0 ? perPage * (page - 1) : 0;

  const [total, data] = await Promise.all([
    model.count({
      where: args.where,
    }),
    model.findMany({
      skip,
      take: perPage,
      ...args,
    }),
  ]);

  const lastPage = Math.ceil(total / perPage);

  return {
    data,
    meta: {
      total,
      lastPage,
      currentPage: page,
      perPage,
      prev: page > 1 ? page - 1 : null,
      next: page < lastPage ? page + 1 : null,
    },
  };
}
