/* eslint-disable @typescript-eslint/naming-convention */
export interface PredictAPIResponse {
  result: PredictResult[];
}

export interface PredictResult {
  hs_confidence: number;
  hs_prediction: number;
  sh_confidence: number;
  sh_prediction: number;
  tweet_id: string;
  tweet_text: string;
  user_id: string;
  username: string;
}
