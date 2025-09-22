import { verifySignup } from "../middleware/verifySignUp.js";
import * as authController from "../controllers/authController.js";

export default function setupAuthRoutes(app) {
  app.use((req, res, next) => {
    res.header("Access-Control-Allow-Headers", "Origin, Content-Type, Accept");
    next();
  });

  app.post(
    "/auth/signup",
    [
      verifySignup.checkDuplicateUsernameOrEmail,
      verifySignup.checkRolesExisted,
    ],
    authController.signup
  );

  app.post("/auth/signin", authController.signin);

  app.post("/auth/signout", authController.signout);
}
