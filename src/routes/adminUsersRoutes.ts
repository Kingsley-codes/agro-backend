import express from "express";
import {
  getAllFarmers,
  suspendFarmer,
  activateFarmer,
} from "../controllers/adminUsersController.js";
import { adminAuthenticate } from "../middleware/authenticationMiddleware.js";

const adminUsersRouter = express.Router();

adminUsersRouter.get("/farmers", adminAuthenticate, getAllFarmers);
adminUsersRouter.post("/farmers/suspend", adminAuthenticate, suspendFarmer);
adminUsersRouter.post("/farmers/activate", adminAuthenticate, activateFarmer);

export default adminUsersRouter;
