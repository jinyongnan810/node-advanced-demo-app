import express, { Request, Response } from "express";
import { body } from "express-validator";
import { UnAuthorizedError } from "../errors/unauthorized-error";
import { currentUser } from "../middlewares/current-user";
import { requireAuth } from "../middlewares/require-auth";
import { validateRequest } from "../middlewares/validate-request";
import { Post } from "../models/post";
import { User } from "../models/user";
const router = express.Router();
router.post(
  "/api/posts",

  currentUser,
  requireAuth,
  [
    body("title").notEmpty().withMessage("Title must be provided."),
    body("content").notEmpty().withMessage("Content must be provided."),
  ],
  validateRequest,
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
