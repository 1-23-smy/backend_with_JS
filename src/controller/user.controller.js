import { User } from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/ApiError.js";
import { uploadonCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
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


    
})


export {registerUser}