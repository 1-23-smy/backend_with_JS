import { User } from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/ApiError.js";
import { uploadonCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
<<<<<<< HEAD

const generateAccessAndRefreshTokens = async (userId) => {
   try {
      const user = await User.findById(userId);
      const AccessToken = await user.generateAccessToken();
      const RefreshToken = await user.generateRefreshToken();
      user.refreshToken = RefreshToken;
      await user.save({ validateBeforeSave: false });

      return { AccessToken, RefreshToken };

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
=======
const registerUser=asyncHandler(async (req,res)=>{
   const {fullname,email,username,password}=req.body;
   if([fullname,email,username,password].some((ele)=>ele?.trim() ==="")){
        throw new apiError(400,"All fields are required")
   }
   const existedUser=User.findOne({
    $or:[{ username },{ email }]
   })
   if(existedUser){
    throw new apiError(409,"User already exists")
   }
   const avatarLocalPath=req.files?.avatar[0]?.path;
   const coverImageLocalPath=req.files?.coverImage[0]?.path;
   if(!avatarLocalPath){
      throw new apiError(400,"Avatar is required")}
   const avatar = await uploadonCloudinary(avatarLocalPath);
   const coverImage= await uploadonCloudinary(coverImageLocalPath);
   if(!avatar){
      throw new apiError(400,"Avatar is required...");
   }
   const user=await User.create({
      fullname,
      avatar:avatar.url,
      coverImage:coverImage?.url || "" ,
      email,
      password,
      username:username.toLowerCase()
   });
//if user is not created 
const createdUser=await User.findById(user._id).select("-password -refreshToken")
if(!createdUser){
   throw new apiError(500, "Something went wrong while registering the user...");
}

return res.status(201).json(
   new ApiResponse(201,createdUser,"User registered successfully..")
)


    
>>>>>>> origin/main
})


const LoginUser = asyncHandler(asyncHandler(async (req, res) => {
   console.log("Hello");
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

   const loggedInUser = await User.findById(user._id).select('-password refreshToken');

   const options = {
      httpOnly: true,
      secure: true
   }//By Default cookies can be modified at the frontend but when we add httpOnly,secure then this can be modifyble by the server only.


   return res.status(200).cookie("accesstoken", accessToken,options).cookie("refreshToken", refreshToken,options).json(
      new ApiResponse(200, {
         User: loggedInUser, accessToken, refreshToken
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



export { registerUser, LoginUser, logoutUser }