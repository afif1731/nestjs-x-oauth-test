// eslint-disable-next-line @typescript-eslint/naming-convention
export const JwtConfig = {
  JWT_ACCESS_SECRET:
    process.env.JWT_ACCESS_SECRET ||
    'X6cS9cXQyDNqPwuvuGjLCnCUWXwj0oUsBRP17jTvVsWTH6hsdqnYUL9ZiWqxoHQc',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '12h',
  JWT_FORGOT_PASSWORD_SECRET:
    process.env.JWT_FORGOT_PASSWORD_SECRET ||
    'sfphTmZiTKkueu8hr2ZrY0BbXkcpjBpryUKq1kIxYHO5yN5B3fF9OMdh74JJHMZCfJA9MmvukOhU00VPPKAIa2i39F9nsVrhSgNX77dKhyVw1HEqDSJvVTzL0EDFVUw6',
  JWT_ACCOUNT_ACTIVATE_SECRET:
    process.env.JWT_ACCOUNT_ACTIVATE_SECRET ||
    'xBlyRwcxI0N92GjWHItcp1y9GcDXcLpvV6FwdBk9fd1s3r4Px2gve41EgKCGheQY',
};
