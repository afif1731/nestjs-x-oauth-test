/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/no-explicit-any */
export interface PythonBESuccessResponse<T = any> {
  code: number;
  message: string;
  status: boolean;
  data: T;
}
