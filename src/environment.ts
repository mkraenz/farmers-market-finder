// FMF = Farmers Market Finder
export type Environment = {
  POSTGRES_HOST: string;
  POSTGRES_PORT: number;
  POSTGRES_USER: string;
  POSTGRES_PASSWORD: string;
  POSTGRES_DB: string;
  POSTGRES_CREDENTIALS_JSON: string;
  AWS_ACCESS_KEY_ID: string;
  AWS_SECRET_ACCESS_KEY: string;
  AWS_REGION: string;
  AWS_S3_BUCKET: string;
  FMF_PORT: number;
  NO_COLOR?: string; // if empty string or undefined, print logs with colors. any other value disables colors. Necessary for cloudwatch
};
