/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-explicit-any */
export class SuccessResponse {
  constructor(statusCode: number, message: string, data?: any) {
    this.statusCode = statusCode;
    this.message = message;

    if (data !== undefined) {
      this.data = data;
    }
  }

  statusCode: number;
  message: string;
  data?: any;
}
