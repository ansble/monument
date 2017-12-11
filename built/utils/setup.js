

const glob = require('glob'),
      fs = require('fs'),
      events = require('harken'),
      dot = require('dot'),
      deleteCompressed = config => {
  const complete = events.required(['cleanup:compressed:start'], () => {
    events.emit('setup:compressed');
  }),
        compressedFileGlobs = [`${config.publicPath}/**/*.tgz`, `${config.publicPath}/**/*.def`, `${config.publicPath}/**/*.brot`],
        logger = config.log;

  compressedFileGlobs.forEach(fileGlob => {
    glob(fileGlob, (er, files) => {
      files.forEach(file => {
        const fileEvent = `setup:delete:${file}`;

        complete.add(fileEvent);

        fs.unlink(file, () => {
          events.emit(fileEvent);
        });
      });
    });
  });

  logger.info('Cleaned up old compressed files...');
  events.emit('cleanup:compressed:start');
},
      compileTemplates = config => {
  if (config.dotjs) {
    Object.keys(config.dotjs).forEach(opt => {
      dot.templateSettings[opt] = config.dotjs[opt];
    });
  }

  dot.process({ path: config.templatePath });

  events.emit('setup:templates');
},
      etagSetup = () => {
  require('./staticFileEtags');

  events.emit('setup:etags');
  console.log('etags setup...');
};

module.exports = {
  compressed: deleteCompressed,
  templates: compileTemplates,
  etags: etagSetup
};