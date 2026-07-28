// Wraps an async express handler so thrown errors are forwarded to next()
module.exports = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
