export const requestLogger = (req, res, next) => {
  const timestamp = new Date().toISOString();
  console.info(`[${timestamp}] ${req.method} ${req.originalUrl}`);
  next();
};

export const logError = (error) => {
  console.error(error);
};
