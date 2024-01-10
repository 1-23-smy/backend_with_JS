import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
const userSchema = new Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            index: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        fullname: {
            type: String,
            required: true,
            trim: true,
            index: true,
        },
        avatar: {
            type: String, //cloudinary URL
            required: true,
        },
        coverImage: {
            type: String,
        },
        watchHistory: [
            {
                type: Schema.Types.ObjectId,
                ref: "Video",
            },
        ],
        password: {
            type: String,
            required: [true, "Password is required"],
        },
        refreshToken: {
            type: String,
        },
    },
    { timestamps: true }
);

userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();

    this.password = await bcrypt.hash(this.password, 10);
    next();
}); //The pre hooks is used because before storing into db if i have to do some tasks then we need to use the pre hook. the logic is if the password is not modified then simply next pe chale jao and agar password modified hai toh usko hash kardo 10 rounds ka.isme arrow function use nahi kiya hai kyunki arrow functions main this ka referrence nahi hota so that we have to use normal functions.

userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password); //it will return the value in form of true & false.
}; //this method is checked for comparision user ne jo bhi password diya hai wo string ke format me hai usko encrypted password ke sath compare karna hoga.

userSchema.methods.generateAccessToken = function () {
   return jwt.sign({
        _id: this._id,
        email: this.email,
        username: this.username,
        fullname: this.fullname
    },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
    );
}
userSchema.methods.generateRefreshToken = function () {
   return jwt.sign({
        _id: this._id,
    },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: process.env.REFRESH_TOKEN_EXPIRY }
    );
}
export const User = mongoose.model("User", userSchema);
