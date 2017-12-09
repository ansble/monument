

module.exports = {
  isDataEvent: (event, setEvent) => {
    return event !== setEvent;
  }

  , getMessage: (dataIn) => {
    try {
      return JSON.parse(dataIn);
    } catch (err) {
      return {};
    }
  }

  , getSetEventString: (message) => {
    const shouldReplace = message && message.event && message.event.replace;

    return shouldReplace ? message.event.replace(':get:', ':set:') : '';
  }
};
