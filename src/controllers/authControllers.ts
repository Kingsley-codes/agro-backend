import { Request, Response } from "express";
import bcrypt from "bcrypt";
import User from "../models/userModel.js";
import jwt, { SignOptions } from "jsonwebtoken";
import validator from "validator";
import {
  LoginRequestBody,
  OnboardProducerData,
  producerOnboardRequestBody,
  RefereeInput,
  RegisterRequestBody,
} from "../interface/admin.interface.js";
import Producer from "../models/producerModel.js";
import { uploadToCloudinary } from "../middleware/uploadMiddleware.js";

// Helper function to sign JWT tokens for User
const signToken = (id: string): string => {
  const secret = process.env.JWT_SECRET;
  const expiresIn = process.env.JWT_EXPIRES_IN;

  if (!secret) throw new Error("JWT_SECRET is not defined");
  if (!expiresIn) throw new Error("JWT_EXPIRES_IN is not defined");

  return jwt.sign({ id }, secret, {
    expiresIn: expiresIn as NonNullable<SignOptions["expiresIn"]>,
  });
};

// Helper function to generate unique donor IDs
export const generateFarmerID = () =>
  "AGF-" + Math.random().toString(36).substring(2, 10).toUpperCase();

// Helper function to generate unique donor IDs
export const generateProducerID = () =>
  "AFP-" + Math.random().toString(36).substring(2, 10).toUpperCase();

// User Registration
export const registerUser = async (
  req: Request<{}, {}, RegisterRequestBody>,
  res: Response,
) => {
  try {
    const { firstName, lastName, email, password, confirmPassword } = req.body;

    // Validate user input
    if (!email || !password || !confirmPassword || !firstName || !lastName) {
      return res.status(400).json({
        status: "fail",
        message: "All fields are required",
      });
    }

    // Check if passwords match
    if (password !== confirmPassword) {
      return res.status(400).json({
        status: "fail",
        message: "Passwords do not match",
      });
    }

    // Validate password strength
    if (
      !validator.isStrongPassword(password, {
        minLength: 8,
        minUppercase: 1,
        minSymbols: 1,
        minNumbers: 1,
      })
    ) {
      return res.status(400).json({
        status: "fail",
        message:
          "Password must be at least 8 characters and include an uppercase letter, number, and symbol",
      });
    }

    // Validate email format
    if (!validator.isEmail(email)) {
      return res.status(400).json({
        status: "fail",
        message: "Invalid email format",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser && existingUser.isVerified) {
      return res.status(400).json({
        status: "fail",
        message: "User is already registered and verified",
      });
    } else {
      // Create new user
      await User.create({
        email,
        password: hashedPassword,
        firstName,
        lastName,
        farmerID: generateFarmerID(),
      });
    }

    // Respond with success
    return res.status(201).json({
      status: "success",
      message: "User registered successfully",
    });
  } catch (err: any) {
    console.error("Error registering user:", err);
    return res.status(500).json({
      status: "error",
      message: "Registration failed",
      error: err.message,
    });
  }
};

// User Login
export const login = async (
  req: Request<{}, {}, LoginRequestBody>,
  res: Response,
) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        status: "fail",
        message: "Email and password required",
      });
    }

    const user = await User.findOne({ email }).select("+password");

    // Check if user exists and has a password
    if (!user || !user.password) {
      return res.status(401).json({
        status: "fail",
        message: "Invalid credentials",
      });
    }

    // Verify both password and user.password are defined before comparing
    if (!password || !user.password) {
      return res.status(401).json({
        status: "fail",
        message: "Invalid credentials",
      });
    }

    // Compare passwords
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        status: "fail",
        message: "Invalid credentials",
      });
    }

    // if (!user.isVerified) {
    //   return res.status(401).json({
    //     status: "fail",
    //     message: "Account not verified"
    //   });
    // }

    const token = signToken(user._id.toString());
    user.password = null;

    res.cookie("user_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return res.status(200).json({
      status: "success",
      data: { user },
    });
  } catch (err: any) {
    console.error("Login error:", err);

    return res.status(500).json({
      status: "error",
      message: "Login failed due to server error",
      details: err.message,
      stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
    });
  }
};

// Producer Registration
export const registerProducer = async (
  req: Request<{}, {}, RegisterRequestBody>,
  res: Response,
) => {
  try {
    const { firstName, lastName, email, password, confirmPassword } = req.body;

    // Validate user input
    if (!email || !password || !confirmPassword || !firstName || !lastName) {
      return res.status(400).json({
        status: "fail",
        message: "All fields are required",
      });
    }

    // Check if passwords match
    if (password !== confirmPassword) {
      return res.status(400).json({
        status: "fail",
        message: "Passwords do not match",
      });
    }

    // Validate password strength
    if (
      !validator.isStrongPassword(password, {
        minLength: 8,
        minUppercase: 1,
        minSymbols: 1,
        minNumbers: 1,
      })
    ) {
      return res.status(400).json({
        status: "fail",
        message:
          "Password must be at least 8 characters and include an uppercase letter, number, and symbol",
      });
    }

    // Validate email format
    if (!validator.isEmail(email)) {
      return res.status(400).json({
        status: "fail",
        message: "Invalid email format",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Check if user already exists
    const existingUser = await Producer.findOne({ email });
    if (existingUser && existingUser.isVerified) {
      return res.status(400).json({
        status: "fail",
        message: "User is already registered and verified",
      });
    } else {
      // Create new user
      await Producer.create({
        email,
        password: hashedPassword,
        firstName,
        lastName,
        producerID: generateProducerID(),
      });
    }

    // Respond with success
    return res.status(201).json({
      status: "success",
      message: "User registered successfully",
    });
  } catch (err: any) {
    console.error("Error registering user:", err);
    return res.status(500).json({
      status: "error",
      message: "Registration failed",
      error: err.message,
    });
  }
};

// Producer Login
export const loginProducer = async (
  req: Request<{}, {}, LoginRequestBody>,
  res: Response,
) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        status: "fail",
        message: "Email and password required",
      });
    }

    const producer = await Producer.findOne({ email }).select("+password");

    // Check if user exists and has a password
    if (!producer || !producer.password) {
      return res.status(401).json({
        status: "fail",
        message: "Invalid credentials",
      });
    }

    // Verify both password and user.password are defined before comparing
    if (!password || !producer.password) {
      return res.status(401).json({
        status: "fail",
        message: "Invalid credentials",
      });
    }

    // Compare passwords
    const isPasswordValid = await bcrypt.compare(password, producer.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        status: "fail",
        message: "Invalid credentials",
      });
    }

    const token = signToken(producer._id.toString());
    producer.password = null;

    res.cookie("producer_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return res.status(200).json({
      status: "success",
      data: { producer },
    });
  } catch (err: any) {
    console.error("Login error:", err);

    return res.status(500).json({
      status: "error",
      message: "Login failed due to server error",
      details: err.message,
      stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
    });
  }
};

export const onboardProducer = async (
  req: Request<{ producerId: string }, {}, producerOnboardRequestBody>,
  res: Response,
) => {
  try {
    const { producerId } = req.params;
    const { farmName, nin, address, referees } = req.body;

    const producer = await Producer.findById(producerId);

    if (!producer) {
      return res.status(404).json({
        status: "fail",
        message: "Producer not found",
      });
    }

    if (!farmName || !nin || !address || !referees) {
      return res.status(400).json({
        status: "fail",
        message: "All fields (farmName, nin, address, referees) are required",
      });
    }

    let refereesArray: RefereeInput[] = [];

    if (Array.isArray(referees)) {
      refereesArray = referees as RefereeInput[];
    } else if (typeof referees === "string") {
      try {
        const parsed = JSON.parse(referees); // only inside try
        if (!Array.isArray(parsed)) {
          return res.status(400).json({
            status: "fail",
            message: "Referees must be an array",
          });
        }
        refereesArray = parsed as RefereeInput[];
      } catch (err) {
        return res.status(400).json({
          status: "fail",
          message: "Invalid referees data format. Must be valid JSON.",
        });
      }
    } else {
      return res.status(400).json({
        status: "fail",
        message: "Referees must be provided as an array or JSON string",
      });
    }

    if (refereesArray.length !== 2) {
      return res.status(400).json({
        status: "fail",
        message: "Exactly two referees must be provided.",
      });
    }

    if (
      !req.files ||
      Array.isArray(req.files) ||
      !req.files?.image1?.[0] ||
      !req.files?.image2?.[0] ||
      !req.files?.image3?.[0] ||
      !req.files?.profilePhoto?.[0] ||
      !req.files?.guarantorPhoto1?.[0] ||
      !req.files?.guarantorPhoto2?.[0]
    ) {
      return res.status(400).json({
        error: "All images are required",
      });
    }

    const uploadResult1 = await uploadToCloudinary(
      req.files.image1[0].buffer,
      "AgroFund Hub/farm_images",
    );

    const uploadResult2 = await uploadToCloudinary(
      req.files.image2[0].buffer,
      "AgroFund Hub/farm_images",
    );

    const uploadResult3 = await uploadToCloudinary(
      req.files.image3[0].buffer,
      "AgroFund Hub/farm_images",
    );

    const profilePhotoResult4 = await uploadToCloudinary(
      req.files.profilePhoto[0].buffer,
      "AgroFund Hub/profile_images",
    );

    // Upload guarantor photos
    const guarantorPhoto1Result = await uploadToCloudinary(
      req.files.guarantorPhoto1[0].buffer,
      "AgroFund Hub/guarantor_photos",
    );
    const guarantorPhoto2Result = await uploadToCloudinary(
      req.files.guarantorPhoto2[0].buffer,
      "AgroFund Hub/guarantor_photos",
    );

    // Update referees array with uploaded photos
    refereesArray[0]!.guarantorPhoto = {
      publicId: guarantorPhoto1Result.public_id,
      url: guarantorPhoto1Result.secure_url,
    };

    refereesArray[1]!.guarantorPhoto = {
      publicId: guarantorPhoto2Result.public_id,
      url: guarantorPhoto2Result.secure_url,
    };

    producer.farmName = farmName;
    producer.nin = nin;
    producer.address = address;
    producer.set("referees", refereesArray);
    producer.farmImage1 = {
      publicId: uploadResult1.public_id,
      url: uploadResult1.secure_url,
    };
    producer.farmImage2 = {
      publicId: uploadResult2.public_id,
      url: uploadResult2.secure_url,
    };
    producer.farmImage3 = {
      publicId: uploadResult3.public_id,
      url: uploadResult3.secure_url,
    };
    producer.profilePhoto = {
      publicId: profilePhotoResult4.public_id,
      url: profilePhotoResult4.secure_url,
    };

    await producer.save();

    return res.status(200).json({
      status: "success",
      data: { producer },
    });
  } catch (err: any) {
    console.error("Onboarding error:", err);

    return res.status(500).json({
      status: "error",
      message: "Onboarding failed due to server error",
      details: err.message,
    });
  }
};
