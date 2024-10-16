import mongoose, { Schema } from "mongoose";
const suscriptionSchema = new Schema(
    {
        suscriber: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        channel: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
    },
    { timestamps: true }
);

export const Suscription = mongoose.model("Suscription", suscriptionSchema);
