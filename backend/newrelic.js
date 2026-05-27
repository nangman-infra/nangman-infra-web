'use strict';

exports.config = {
  app_name: [process.env.NEW_RELIC_APP_NAME || 'Nangman Infra Backend'],
  license_key: process.env.NEW_RELIC_LICENSE_KEY,
  distributed_tracing: {
    enabled: true,
  },
  logging: {
    enabled: true,
    level: process.env.NEW_RELIC_LOG_LEVEL || 'info',
  },
  allow_all_headers: true,
};
