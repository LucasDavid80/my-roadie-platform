module.exports = {
  passportJwtSecret: () => (...args) => {
    const cb = args[args.length - 1];
    if (typeof cb === 'function') {
      cb(null, 'secret');
    }
  },
};
