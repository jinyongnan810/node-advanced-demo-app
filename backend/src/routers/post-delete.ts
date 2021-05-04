import express, { Request, Response } from "express";
import mongoose from "mongoose";
import { BadRequestError } from "../errors/bad-request-error";
import { UnAuthorizedError } from "../errors/unauthorized-error";
import { currentUser } from "../middlewares/current-user";
import { requireAuth } from "../middlewares/require-auth";
import { Post } from "../models/post";
import { User } from "../models/user";
const router = express.Router();
router.delete(
  "/api/posts/:id",
  currentUser,
  requireAuth,
  async (req: Request, res: Response) => {
    const { title, content } = req.body;
    const id = req.params["id"];
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestError("Id format error!");
    }
    const post = await Post.findById(id);
    if (!post) {
      throw new BadRequestError("Post not found!");
    }
    if (post.user._id.toString() !== req.currentUser!.id) {
      throw new UnAuthorizedError();
    }
    await post.delete();
    res.send({});
  }
);
export default router;
