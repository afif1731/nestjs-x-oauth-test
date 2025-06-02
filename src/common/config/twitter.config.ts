// eslint-disable-next-line @typescript-eslint/naming-convention
export const TwitterConfig = {
  TWITTER_APP_CLIENT_ID: process.env.TWITTER_APP_CLIENT_ID || 'fake-app-id',
  TWITTER_APP_CLIENT_SECRET:
    process.env.TWITTER_APP_CLIENT_SECRET || 'fake-app-secret',
  TWITTER_OAUTH_CALLBACK_URL:
    process.env.TWITTER_OAUTH_CALLBACK_URL || 'http://127.0.0.1:4000',
  TWITTER_API_REQUEST_DELAY:
    Number.parseInt(process.env.TWITTER_API_REQUEST_DELAY) ||
    15 * 60 * 1000 + 1000,
};
