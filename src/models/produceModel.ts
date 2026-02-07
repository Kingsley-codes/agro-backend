import { Schema, model, InferSchemaType, HydratedDocument } from "mongoose";

const produceSchema = new Schema(
  {
    produceName: {
      type: String,
      required: true,
    },
    producer: {
      type: Schema.Types.ObjectId,
      ref: "Producer",
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    produceID: {
      type: String,
      required: true,
      unique: true,
    },
    description: {
      type: String,
      required: true,
    },
    totalUnit: {
      type: Number,
      required: true,
    },
    minimumUnit: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "rejected", "active", "suspended", "sold out"],
      default: "pending",
    },
    remainingUnit: {
      type: Number,
      required: true,
      default: function () {
        return this.totalUnit;
      },
    },
    image1: {
      publicId: {
        type: String,
        required: true,
      },
      url: {
        type: String,
        required: true,
      },
    },
    image2: {
      publicId: {
        type: String,
        required: true,
      },
      url: {
        type: String,
        required: true,
      },
    },
    image3: {
      publicId: {
        type: String,
        required: true,
      },
      url: {
        type: String,
        required: true,
      },
    },
    price: {
      type: Number,
      required: true,
    },
    category: {
      type: String,
      enum: ["crops", "livestock", "aquaculture"],
      required: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    duration: {
      type: Number,
      required: true,
    },
    ROI: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true },
);

export type Produce = InferSchemaType<typeof produceSchema>;
export type ProduceDocument = HydratedDocument<Produce>;

const Produce = model("Produce", produceSchema);
export default Produce;
