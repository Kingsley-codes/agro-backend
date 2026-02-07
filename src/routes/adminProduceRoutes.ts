import express from "express";
import {
  adminGetAllProduce,
  approveProduce,
  rejectProduce,
} from "../controllers/adminProduceControllers.js";
import { adminAuthenticate } from "../middleware/authenticationMiddleware.js";

const adminProduceRouter = express.Router();

adminProduceRouter.get("/", adminAuthenticate, adminGetAllProduce);
adminProduceRouter.post(
  "/approve/:produceId",
  adminAuthenticate,
  approveProduce,
);
adminProduceRouter.post("/reject/:produceId", adminAuthenticate, rejectProduce);

export default adminProduceRouter;

