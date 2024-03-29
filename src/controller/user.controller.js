import { User } from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/ApiError.js";
import { uploadonCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken"

const generateAccessAndRefreshTokens = async (userId) => {
   try {
      const user = await User.findById(userId);
      const accessToken = await user.generateAccessToken();
      const refreshToken = await user.generateRefreshToken();
      user.refreshToken = refreshToken;
      await user.save({ validateBeforeSave: false });

      return { accessToken, refreshToken };

   } catch (error) {
      throw new apiError(500, "Something went wrong while generating access&Refresh Token")
   }
}
const registerUser = asyncHandler(async (req, res) => {

   const { fullname, email, username, password } = req.body;

   if ([fullname, email, username, password].some((ele) => ele?.trim() === "")) {
      throw new apiError(400, "All fields are required")
   }

   const existedUser = await User.findOne({
      $or: [{ username }, { email }]
   })

   if (existedUser) {
      throw new apiError(409, "User already exists")
   }

   const avatarLocalPath = req.files?.avatar[0]?.path;
   // console.log(req.files.avatar)
   // console.log(req.files);

   // const coverImageLocalPath = req.files?.coverImage[0]?.path;

   let coverImageLocalPath;
   if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
      coverImageLocalPath = req.files.coverImage[0].path
   }


   if (!avatarLocalPath) {
      throw new apiError(400, "Avatar is required");
   }
   const avatar = await uploadonCloudinary(avatarLocalPath);
   // console.log(avatar);
   const coverImage = await uploadonCloudinary(coverImageLocalPath);

   if (!avatar) {
      throw new apiError(400, "Avatar is required...");
   }
   const user = await User.create({
      fullname,
      avatar: avatar?.url,
      coverImage: coverImage?.url || "",
      email,
      password,
      username: username.toLowerCase()
   });
   //if user is not created 
   const createdUser = await User.findById(user._id).select("-password -refreshToken")
   if (!createdUser) {
      throw new apiError(500, "Something went wrong while registering the user...");
   }

   return res.status(201).json(
      new ApiResponse(201, createdUser, "User registered successfully...")
   )
})


const LoginUser = asyncHandler(asyncHandler(async (req, res) => {

   const { username, email, password } = req.body
   if (!username && !email) {
      throw new apiError(401, "Username or email is required");
   }

   const user = await User.findOne({
      $or: [{ email }, { username }]
   })
   if (!user) {
      throw new apiError(404, "User not exists")
   }

   const isPasswordMatch = await user.isPasswordCorrect(password)
   if (!isPasswordMatch) {
      throw new apiError(401, "Oops... incorrect passwod");

   }
   const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);

   const loggedInUser = await User.findById(user._id).select('-password -refreshToken');

   const options = {
      httpOnly: true,
      secure: true
   }//By Default cookies can be modified at the frontend but when we add httpOnly,secure then this can be modifyble by the server only.


   return res.status(200).cookie("accessToken", accessToken, options).cookie("refreshToken", refreshToken, options).json(
      new ApiResponse(200, {
         User: { loggedInUser, "accessToken is": accessToken, "refreshToken is": refreshToken }
      }, "User loggedIn Successfully")
   )




}))


const logoutUser = asyncHandler(async (req, res) => {
   // req.user.id ??

   const user = await User.findByIdAndUpdate(req.user._id, {
      $set: {
         refreshToken: undefined
      }

   }, {
      new: true// The update value will return
   }
   )
   const options = {
      httpOnly: true,
      secure: true
   }
   res.status(200).clearCookie("accessToken", options).clearCookie("refreshToken", options).json(
      new ApiResponse(200, {}, "User logged out successfully")
   )
})


const refreshAccessToken = asyncHandler(async (req, res) => {
   try {
      const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;
      if (!incomingRefreshToken) {
         throw new apiError(404, "unauthorized request")
      }

      const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
      if (!decodedToken) {
         throw new apiError(402, "Token is expired")
      }

      const user = await User.findById(decodedToken?._id);
      if (!user) {
         throw new apiError(401, "Invalid Access Token")
      }

      if (user?.refreshToken !== incomingRefreshToken) {
         throw new apiError(401, "Token is used or expired")
      }

      const options = {
         httpOnly: true,
         secure: true,
      }
      const { accessToken, newrefreshToken } = await generateAccessAndRefreshTokens(user?._id)

      res.status(200).cookie("accessToken", accessToken, options).cookie("refreshToken", newrefreshToken, options).json(
         new ApiResponse(200, { accessToken, refreshToken: newrefreshToken }, "Access Token refreshed successfully :)")
      );


   } catch (error) {
      throw new apiError(401, error?.message || "Invalid refresh Token")
   }

})

const changeCurrentPassword = asyncHandler(async (req, res) => {
   const { oldpassword, newpassword } = req.body;
   // if(newpassword !== confirmPassword){
   //    throw new apiError(400,"Password not matched");

   // }
   const user = await User.findById(req.user?._id);
   const isPasswordCorrect = await user.isPasswordCorrect(oldpassword);
   if (!isPasswordCorrect) {
      throw new apiError(400, "Invalid old Password")
   }
   user.password = newpassword;

   await user.save({ validateBeforeSave: false });

   res.status(200).json(
      new ApiResponse(200, {}, "Password Changed Successfully")
   )
})

const updateAccountDetails = asyncHandler(async (req, res) => {
   const { fullname, email } = req.body;
   if (!fullname || !email) {
      throw new apiError(400, "fullname or email is required")
   }

   const user = await User.findByIdAndUpdate(req.user?._id, {
      $set: {
         fullname: fullname, email: email
      }
   }, {
      new: true
   }).select('-password')


   return res.status(200).json(
      new ApiResponse(200, user, "Account Updated Successfully")
   )
})
const getCurrentsUser = asyncHandler(async (req, res) => {
   return res.status(200).json(
      new ApiResponse(200, req.user, "User Details")
   )
})
const updateUserAvatar = asyncHandler(async (req, res) => {
   const avatarLocalPath = req.file?.path;
   if (!avatarLocalPath) {
      throw new apiError(404, "Avatar file missing")
   }
   const avatar = await uploadonCloudinary(avatarLocalPath);
   if (!avatar.url) {
      throw new apiError(400, "Error while uploading avatar")
   }
   const user = await User.findByIdAndUpdate(req.user._id, {
      $set: {
         avatar: avatar.url
      }
   }, { new: true }).select('-password')
   return res.status(200).json(
      new ApiResponse(200, { user }, "Avatar Updated Successfully")
   )
})

const updateCoverImage = asyncHandler(async (req, res) => {
   const coverImageLocalPath = req.file?.path;
   if (!coverImageLocalPath) {
      throw new apiError(404, "CoverImage file missing")
   }
   const coverImage = await uploadonCloudinary(coverImageLocalPath);
   if (!coverImage.url) {
      throw new apiError(400, "Error while uploading coverImage")
   }
   const user = await User.findByIdAndUpdate(req.user._id, {
      $set: {
         coverImage: coverImage.url
      }
   }, { new: true }).select('-password')
   return res.status(200).json(
      new ApiResponse(200, { user }, "CoverImage Updated Successfully")
   )

})
export { registerUser, LoginUser, logoutUser, refreshAccessToken, updateAccountDetails, changeCurrentPassword, getCurrentsUser, updateUserAvatar, updateCoverImage }