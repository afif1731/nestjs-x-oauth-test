/* eslint-disable @typescript-eslint/naming-convention */
export interface PredictAPIResponse {
  result: PredictResult[];
}

export interface PredictResult {
  confidence: number;
  prediction: 'bukan' | 'yes' | 'unknown';
  tweet_id: string;
  tweet_text: string;
  user_id: string;
}
