import express from "express";
import {
  registerUser,
  login,
  registerProducer,
  loginProducer,
  onboardProducer,
} from "../controllers/authControllers.js";
import { uploadProducerImages } from "../middleware/uploadMiddleware.js";

const userAuthRouter = express.Router();

userAuthRouter.post("/register", registerUser); // User Registration routes

userAuthRouter.post("/login", login); // User Login route

userAuthRouter.post("/producer/register", registerProducer); // producer Registration routes

userAuthRouter.post("/producer/login", loginProducer); // producer Login route

userAuthRouter.post(
  "/producer/onboarding",
  uploadProducerImages,
  onboardProducer,
); // producer onboarding route

export default userAuthRouter;
