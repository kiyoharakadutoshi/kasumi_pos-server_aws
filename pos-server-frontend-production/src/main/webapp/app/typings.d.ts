declare const VERSION: string;
declare const SERVER_API_URL: string;
declare const SERVER_BATCH_API_URL: string;
declare const DEVELOPMENT: string;
declare const I18N_HASH: string;
declare const STAGING_ENV: boolean;

declare module '*.json' {
  const value: any;
  export default value;
}
