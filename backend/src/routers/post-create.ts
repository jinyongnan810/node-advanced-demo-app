import express, { Request, Response } from "express";
import { UnAuthorizedError } from "../errors/unauthorized-error";
import { currentUser } from "../middlewares/current-user";
import { requireAuth } from "../middlewares/require-auth";
import { Post } from "../models/post";
import { User } from "../models/user";
const router = express.Router();
router.post(
  "/api/posts",
  currentUser,
  requireAuth,
  async (req: Request, res: Response) => {
    const { title, content } = req.body;
    const user = await User.findById(req.currentUser!.id);
    if (!user) {
      throw new UnAuthorizedError();
    }
    const post = Post.build({ title, content, user: user });
    await post.save();
    res.status(201).send(post);
  }
);
export default router;
