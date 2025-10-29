console.log("CRACO config loaded");
module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      // Suppress source map warnings for react-datepicker
      webpackConfig.module.rules.forEach((rule) => {
        if (rule.use && Array.isArray(rule.use)) {
          rule.use.forEach((use) => {
            if (use.loader && use.loader.includes('source-map-loader')) {
              use.options = {
                ...use.options,
                filterSourceMappingUrl: (url, resourcePath) => {
                  // Ignore source map warnings for react-datepicker
                  if (resourcePath.includes('react-datepicker')) {
                    return false;
                  }
                  return true;
                },
              };
            }
          });
        }
      });
      return webpackConfig;
    },
  },
  devServer: {
    proxy: {
      '/nw': {
        target: 'https://callcenter.skillmissionassam.org',
        changeOrigin: true,
        secure: true,
        logLevel: 'debug'
      }
    }
  }
}; 