import { Router } from "express";
<<<<<<< HEAD
import { registerUser, logoutUser,LoginUser } from "../controller/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";


=======
import { registerUser } from "../controller/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
<<<<<<< HEAD
>>>>>>> 5527532a4e1a93a7b1b0bf752007cd4c632c80f1
=======
>>>>>>> origin/main
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
<<<<<<< HEAD
<<<<<<< HEAD
userRouter.route('/login').post(LoginUser);
userRouter.route('/logout').post(verifyJWT,logoutUser)
=======
=======
>>>>>>> origin/main
// userRouter.route('/login').post()
>>>>>>> 5527532a4e1a93a7b1b0bf752007cd4c632c80f1

export default userRouter;