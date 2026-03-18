module.exports = {
  // APP_VERSION is passed as an environment variable from the Gradle / Maven build tasks.
  VERSION: '2.0',
  // The root URL for API calls, ending with a '/' - for example: `"https://www.jhipster.tech:8081/myservice/"`.
  // If this URL is left empty (""), then it will be relative to the current context.
  // If you use an API server, in `prod` mode, you will need to enable CORS
  // (see the `jhipster.cors` common JHipster property in the `application-*.yml` configurations)
  SERVER_API_URL: 'https://api-spk.ignicapos.com/api/v1',
  SERVER_API_URL_STAGING: 'https://api-stg.ignicapos.com/api/v1',
  SERVER_BATCH_API_URL: 'https://api-spk.ignicapos.com/pos-batch/api/v1',
  SERVER_BATCH_API_STAGING_URL: 'https://api-stg.ignicapos.com/pos-batch/api/v1',


  // STAGING
  STAGING_ENV: false,

  //INAGEYA
  DOMAIN_INAGEYA: '192.168.180.3',
};
