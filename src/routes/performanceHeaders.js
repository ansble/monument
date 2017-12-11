

const start = (timersIn) => {
        const timers = timersIn;

        return (key) => {
          timers[key] = {
            start: process.hrtime(),
          };

          return timers[key].start;
        };
      }
      , end = (timersIn) => {
        const timers = timersIn;

        return (key) => {
          if (!timers[key] || !timers[key].start) {
            return;
          }

          timers[key].end = process.hrtime(timers[key].start);
          timers[key].delta = (timers[key].end[1] / 1000000).toFixed(2);

          return timers[key].delta;
        };
      };

module.exports = (timers) => {
  return {
    start: start(timers)
    , end: end(timers)
  };
};
