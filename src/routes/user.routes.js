import { Router } from "express";

import { registerUser, logoutUser,LoginUser, refreshAccessToken, updateAccountDetails } from "../controller/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";




const userRouter=Router();
userRouter.route('/register').post(upload.fields([
    {
        name:"avatar",
        maxCount:1
    },{
        name:"coverImage",
        maxCount:1
    }
]),registerUser)

userRouter.route('/login').post(LoginUser);
//Secured Routes
userRouter.route('/logout').post(verifyJWT,logoutUser);
userRouter.route('/refresh-token').post(refreshAccessToken);
userRouter.route('/updateaccount').put(verifyJWT,updateAccountDetails);


export default userRouter;