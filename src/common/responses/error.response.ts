export class ErrorResponse {
  constructor(statusCode: number, message: string) {
    this.statusCode = statusCode;
    this.message = message;
  }

  statusCode: number;
  error: string;
  message: string | Array<string>;
}
