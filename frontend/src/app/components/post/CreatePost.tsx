import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import React, { useEffect, useState } from "react";
import Messages from "../Messages";
import { createPost } from "../../../app/actions/post";
import { useHistory } from "react-router";

const CreatePost = () => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const history = useHistory();
  const dispatch = useAppDispatch();
  const { loading, redirect } = useAppSelector((state) => state.post);
  useEffect(() => {
    if (redirect) {
      history.push("/post/list");
    }
  }, [redirect]);
  const onSubmit = (e: any) => {
    e.preventDefault();
    // if (loading) return;
    dispatch(createPost(title, content));
  };
  return (
    <div>
      <form onSubmit={onSubmit}>
        <div className="mb-3">
          <label htmlFor="title" className="form-lable">
            Title
          </label>
          <input
            className="form-control"
            id="title"
            type="text"
            placeholder="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div className="mb-3">
          <label htmlFor="content" className="form-lable">
            Content
          </label>
          <textarea
            className="form-control"
            id="content"
            placeholder="content"
            rows={3}
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </div>
        <Messages />
        <button className="btn btn-large btn-outline-success" type="submit">
          Create
        </button>
      </form>
    </div>
  );
};

export default CreatePost;
