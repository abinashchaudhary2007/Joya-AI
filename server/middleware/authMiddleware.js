const authMiddleware = (req, res, next) => {
  const apiKey = process.env.API_KEY;
  const requestKey = req.headers["x-api-key"] || req.headers["X-API-KEY"];

  if (apiKey && apiKey.length > 0 && requestKey !== apiKey) {
    return res.status(401).json({
      success: false,
      error: "Unauthorized request",
    });
  }

  next();
};

export default authMiddleware;
