import { Schema, model, InferSchemaType, HydratedDocument } from "mongoose";
import validator from "validator";

const refereeSchema = new Schema({
  fullName: {
    type: String,
  },
  phone: {
    type: String,
    minlength: 11,
    maxlength: 11,
    sparse: true,
  },
  producerID: {
    type: String,
    unique: true,
    required: true,
  },
  guarantorPhoto: {
    publicId: { type: String },
    url: { type: String },
  },
  nin: {
    type: String,
    unique: true,
    minlength: 11,
    maxlength: 11,
  },
  verified: {
    type: Boolean,
    default: false,
  },
});

const producerSchema = new Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      sparse: true,
      trim: true,
      validator: function (value: string) {
        // Allow empty phone numbers (since sparse: true)
        if (!value) return true;
        return validator.isMobilePhone(value, "any");
      },
    },
    password: {
      type: String,
      minlength: 8,
    },
    profilePhoto: {
      publicId: { type: String },
      url: { type: String },
    },
    status: {
      type: String,
      enum: ["active", "pending", "suspended"],
      default: "pending",
    },
    referees: [refereeSchema],
    isVerified: {
      type: Boolean,
      default: false,
    },
    suspendReason: {
      type: String,
    },
    farmName: {
      type: String,
    },
    nin: {
      type: String,
    },
    address: {
      type: String,
    },
    gender: {
      type: String,
      enum: ["male", "female"],
    },
    level: {
      type: Number,
      default: 1,
      enum: [1, 2, 3, 4, 5],
    },
    listedProduce: {
      type: Number,
      default: 0,
    },
    farmImage1: {
      publicId: String,
      url: String,
    },
    farmImage2: {
      publicId: String,
      url: String,
    },
    farmImage3: {
      publicId: String,
      url: String,
    },
  },
  { timestamps: true },
);

producerSchema.index({ status: 1, createdAt: -1 });
producerSchema.index({ isVerified: 1, createdAt: -1 });
producerSchema.index({ level: 1, createdAt: -1 });

export type Producer = InferSchemaType<typeof producerSchema>;
export type ProducerDocument = HydratedDocument<Producer>;

const Producer = model("Producer", producerSchema);

export default Producer;
