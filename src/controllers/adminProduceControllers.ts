import { Request, Response } from "express";
import Produce from "../models/produceModel.js";
import Producer from "../models/producerModel.js";

export const adminGetAllProduce = async (req: Request, res: Response) => {
  try {
    const admin = req.admin;
    if (!admin) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized access. Admin credentials required.",
      });
    }

    const status = req.query.status as string | undefined;
    const page = req.query.page as string | undefined;

    const filter: any = {};

    // status filter
    if (
      status &&
      ["pending", "active", "suspended", "approved", "sold out"].includes(
        status,
      )
    ) {
      filter.status = status;
    }

    const limit = 10;
    const pageNumber = Math.max(parseInt(page as string, 10) || 1, 1);
    const skip = (pageNumber - 1) * limit;

    const produceList = await Produce.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Produce.countDocuments(filter);

    return res.status(200).json({
      produce: produceList,
      page: pageNumber,
      pages: Math.ceil(total / limit),
    });
  } catch (error: any) {
    console.error("Error fetching produce:", error);
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

export const approveProduce = async (
  req: Request<{ produceId: string }>,
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
    const { produceId } = req.params;
    const produce = await Produce.findById(produceId);

    if (!produce) {
      return res.status(404).json({
        success: false,
        message: "Produce not found",
      });
    }

    if (produce.status === "active") {
      return res.status(400).json({
        success: false,
        message: "Produce is already active",
      });
    }

    produce.status = "active";
    await produce.save();

    const producerRecord = await Producer.findById(produce.producer);

    if (!producerRecord) {
      return res.status(404).json({
        success: false,
        message: "Producer record not found",
      });
    }

    if (producerRecord && producerRecord.listedProduce >= 7) {
      return res.status(400).json({
        success: false,
        message: "Produce listing limit reached for this producer.",
      });
    }

    producerRecord.listedProduce += 1;
    await producerRecord.save();

    return res.status(200).json({
      success: true,
      message: "Produce approved successfully",
    });
  } catch (error: any) {
    console.error("Error approving produce:", error);
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

export const rejectProduce = async (
  req: Request<{ produceId: string }>,
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
    const { produceId } = req.params;
    const produce = await Produce.findById(produceId);

    if (!produce) {
      return res.status(404).json({
        success: false,
        message: "Produce not found",
      });
    }

    if (produce.status === "rejected") {
      return res.status(400).json({
        success: false,
        message: "Produce is already rejected",
      });
    }

    produce.status = "rejected";
    await produce.save();

    return res.status(200).json({
      success: true,
      message: "Produce rejected successfully",
    });
  } catch (error: any) {
    console.error("Error rejecting produce:", error);
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};
