import { Request, Response } from "express";
import Producer from "../models/producerModel.js";
import User from "../models/userModel.js";

type UserQuery = {
  status?: "active" | "suspended" | "pending";
  isVerified?: "true" | "false";
  page?: string;
};

export const getAllProducers = async (
  req: Request<{}, {}, {}, UserQuery>,
  res: Response,
) => {
  try {
    const admin = req.admin;
    if (!admin) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized access. Admin credentials required.",
      });
    }

    const { status, isVerified, page = "1" } = req.query;

    const filter: any = {};

    // optional status filter
    if (status && ["active", "suspended", "pending"].includes(status)) {
      filter.status = status;
    }

    // optional isVerified filter
    if (isVerified && ["true", "false"].includes(isVerified)) {
      filter.isVerified = isVerified === "true";
    }

    const limit = 10;
    const pageNumber = Math.max(parseInt(page as string, 10) || 1, 1);
    const skip = (pageNumber - 1) * limit;

    const producers = await Producer.find(filter)
      .sort({ createdAt: -1 })
      .select("-password")
      .skip(skip)
      .limit(limit);

    const total = await Producer.countDocuments(filter);

    return res.status(200).json({
      success: true,
      data: producers,
      page: pageNumber,
      pages: Math.ceil(total / limit),
    });
  } catch (error: any) {
    console.error("Error fetching producers:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

export const getAllFarmers = async (
  req: Request<{}, {}, {}, UserQuery>,
  res: Response,
) => {
  try {
    const admin = req.admin;
    if (!admin) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized access. Admin credentials required.",
      });
    }

    const { status, isVerified, page = "1" } = req.query;

    const filter: any = {};

    // optional status filter
    if (status && ["active", "suspended"].includes(status)) {
      filter.status = status;
    }

    // optional isVerified filter
    if (isVerified && ["true", "false"].includes(isVerified)) {
      filter.isVerified = isVerified === "true";
    }

    const limit = 10;
    const pageNumber = Math.max(parseInt(page as string, 10) || 1, 1);
    const skip = (pageNumber - 1) * limit;

    const farmers = await User.find(filter)
      .sort({ createdAt: -1 })
      .select("-password")
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments(filter);

    return res.status(200).json({
      success: true,
      data: farmers,
      page: pageNumber,
      pages: Math.ceil(total / limit),
    });
  } catch (error: any) {
    console.error("Error fetching farmers:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

export const verifyProducer = async (
  req: Request<{ producerId: string }>,
  res: Response,
) => {
  try {
    const admin = req.admin;

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized access. Admin credentials required.",
      });
    }

    const { producerId } = req.params;
    const producer = await Producer.findById(producerId);

    if (!producer) {
      return res.status(404).json({
        success: false,
        message: "Producer not found",
      });
    }

    if (producer.isVerified) {
      return res.status(400).json({
        success: false,
        message: "Producer is already verified",
      });
    }

    producer.isVerified = true;
    producer.status = "active";
    await producer.save();

    return res.status(200).json({
      success: true,
      message: "Producer verified successfully",
    });
  } catch (error: any) {
    console.error("Error verifying producer:", error);
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

export const suspendFarmer = async (
  req: Request<{ farmerId: string }>,
  res: Response,
) => {
  try {
    const admin = req.admin;
    if (!admin) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized access. Admin credentials required.",
      });
    }

    const { farmerId } = req.params;
    const farmer = await User.findById(farmerId);

    if (!farmer) {
      return res.status(404).json({
        success: false,
        message: "Farmer not found",
      });
    }

    if (farmer.status === "suspended") {
      return res.status(400).json({
        success: false,
        message: "Farmer is already suspended",
      });
    }

    farmer.status = "suspended";
    await farmer.save();
    return res.status(200).json({
      success: true,
      message: "Farmer suspended successfully",
    });
  } catch (error: any) {
    console.error("Error suspending farmer:", error);
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

export const activateFarmer = async (
  req: Request<{ farmerId: string }>,
  res: Response,
) => {
  try {
    const admin = req.admin;
    if (!admin) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized access. Admin credentials required.",
      });
    }
    const { farmerId } = req.params;
    const farmer = await User.findById(farmerId);
    if (!farmer) {
      return res.status(404).json({
        success: false,
        message: "Farmer not found",
      });
    }
    if (farmer.status === "active") {
      return res.status(400).json({
        success: false,
        message: "Farmer is already active",
      });
    }
    farmer.status = "active";
    await farmer.save();
    return res.status(200).json({
      success: true,
      message: "Farmer activated successfully",
    });
  } catch (error: any) {
    console.error("Error activating farmer:", error);
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

export const suspendProducer = async (
  req: Request<{ producerId: string }>,
  res: Response,
) => {
  try {
    const admin = req.admin;
    if (!admin) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized access. Admin credentials required.",
      });
    }
    const { producerId } = req.params;
    const producer = await Producer.findById(producerId);

    if (!producer) {
      return res.status(404).json({
        success: false,
        message: "Producer not found",
      });
    }
    if (producer.status === "suspended") {
      return res.status(400).json({
        success: false,
        message: "Producer is already suspended",
      });
    }
    producer.status = "suspended";
    await producer.save();
    return res.status(200).json({
      success: true,
      message: "Producer suspended successfully",
    });
  } catch (error: any) {
    console.error("Error suspending producer:", error);
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

export const activateProducer = async (
  req: Request<{ producerId: string }>,
  res: Response,
) => {
  try {
    const admin = req.admin;
    if (!admin) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized access. Admin credentials required.",
      });
    }
    const { producerId } = req.params;
    const producer = await Producer.findById(producerId);
    if (!producer) {
      return res.status(404).json({
        success: false,
        message: "Producer not found",
      });
    }
    if (producer.status === "active") {
      return res.status(400).json({
        success: false,
        message: "Producer is already active",
      });
    }
    producer.status = "active";
    await producer.save();
    return res.status(200).json({
      success: true,
      message: "Producer activated successfully",
    });
  } catch (error: any) {
    console.error("Error activating producer:", error);
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};
