import express, { Request, Response } from "express";
import { UnAuthorizedError } from "../errors/unauthorized-error";
import { currentUser } from "../middlewares/current-user";
import { requireAuth } from "../middlewares/require-auth";
import { Post } from "../models/post";
import { User } from "../models/user";
const router = express.Router();
router.get(
  "/api/posts",
  currentUser,
  requireAuth,
  async (req: Request, res: Response) => {
    const user = await User.findById(req.currentUser!.id);
    if (!user) {
      throw new UnAuthorizedError();
    }

    // @ts-ignore
    const posts = await Post.find({ user: user._id ?? user.id }).cache();
    res.send(posts);
  }
);
export default router;
