import rateLimit from "../../config/upstash.js";

const rateLimiter = async (req, res, next) => {
  try {
    const { success } = await rateLimit.limit("my-limit-key"); //User ID
    if (!success) {
      return res.status(429).json({ message: "Rate limit exceeded" });
    }
    next();
  } catch (error) {
    console.error("Rate Limiter Error:", error);
    next(error);
  }
};

export default rateLimiter;
