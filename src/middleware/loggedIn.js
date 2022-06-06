const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

module.exports = {
  loggedInMiddleware: (req, res, next) => {
    const { authorization } = req.headers;
    const { JWT_SECRET } = process.env;
    if (!authorization) {
      return res.sendStatus(403);
    }

    const [, token] = authorization.split(" ");

    try {
      const parsed = jwt.verify(token, JWT_SECRET);
      req.token = parsed;
      next();
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        return res.status(403).send({
          error: error.message,
        });
      }
    }
  }
};
