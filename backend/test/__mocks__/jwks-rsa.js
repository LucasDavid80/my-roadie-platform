module.exports = {
  passportJwtSecret: () => (req, header, payload, cb) => cb(null, 'secret'),
};
