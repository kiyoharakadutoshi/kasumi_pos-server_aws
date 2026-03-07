module.exports = {
  // APP_VERSION is passed as an environment variable from the Gradle / Maven build tasks.
  VERSION: '2.0',
  // The root URL for API calls, ending with a '/' - for example: `"https://www.jhipster.tech:8081/myservice/"`.
  // If this URL is left empty (""), then it will be relative to the current context.
  // If you use an API server, in `prod` mode, you will need to enable CORS
  // (see the `jhipster.cors` common JHipster property in the `application-*.yml` configurations)
  // SERVER_API_URL: 'http://172.172.1.104:8080/api/v1/',
  SERVER_API_URL: 'http://172.172.1.105:8080/pos-server/api/v1',
  // SERVER_API_URL: 'https://pos1908.luvina.net/pos-server/api/v1/',
  SERVER_BATCH_API_URL: 'http://172.172.1.105:8080/pos-batch/api/v1',

  // STAGING
  STAGING_ENV: false,
};
