

const events = require('harken'),
      pkg = require('./package.json'),
      parser = require('./utils/parser'),
      webSockets = require('./web-sockets'),
      uuid = require('uuid'),
      config = require('./utils/config'),
      setup = require('./utils').setup,
      routeStore = require('./routes/routeStore'),
      wrapper = configIn => {
  const configObj = config.set(configIn),
        logger = configObj.log,
        routes = require(configObj.routeJSONPath);

  events.once('setup:complete', () => {
    const server = require('./routes/index').server(configObj.server, routes, configObj);

    server.listen(configObj.port);

    if (configIn.webSockets !== false) {
      webSockets(server, configIn.webSockets);
    }

    logger.info(`monument v${pkg.version} up and running on port: ${configObj.port}`);
    events.emit('server:started', {
      version: pkg.version,
      port: configObj.port,
      server: server
    });
  });

  setup(configObj);
};

module.exports = {
  server: wrapper,
  events: events,
  parser: parser,
  routes: routeStore,
  createUUID: () => {
    return uuid.v4();
  }
};