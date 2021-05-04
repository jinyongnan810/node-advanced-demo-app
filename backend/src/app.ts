import express from "express";
require("express-async-errors");
import { json } from "body-parser";
import morgan from "morgan";
import cors from "cors";

import cookieSesion from "cookie-session";
//auth
import CurrentUserRouter from "./routers/current-user";
import SignInRouter from "./routers/signin";
import SignOutRouter from "./routers/signout";
import SignUpRouter from "./routers/signup";
//posts
import PostCreateRouter from "./routers/post-create";
import PostUpdateRouter from "./routers/post-update";
import PostListRouter from "./routers/post-list";
import PostSingleRouter from "./routers/post-single";
import PostDeleteRouter from "./routers/post-delete";

import { NotFoundError } from "./errors/not-found-error";
import { handleError } from "./middlewares/error-handler";

const app = express();
var corsOptions = {
  origin: ["http://localhost:4000", "https://localhost:4000"],
  credentials: true,
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));
app.set("trust proxy", true); //trust ingress nginx
app.use(
  cookieSesion({
    signed: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : undefined,
  })
);
app.use(json());
app.use(
  morgan(":method :url :status :res[content-length] - :response-time ms")
);
// auth
app.use(CurrentUserRouter);
app.use(SignInRouter);
app.use(SignOutRouter);
app.use(SignUpRouter);
// posts
app.use(PostCreateRouter);
app.use(PostUpdateRouter);
app.use(PostDeleteRouter);
app.use(PostListRouter);
app.use(PostSingleRouter);

app.all("*", async (req, res) => {
  throw new NotFoundError();
});

app.use(handleError);

export { app };
