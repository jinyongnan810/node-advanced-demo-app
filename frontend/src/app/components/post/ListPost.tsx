import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { showPostList } from "../../../app/actions/post";

const ListPost = () => {
  const dispatch = useAppDispatch();
  const { loading, list } = useAppSelector((state) => state.post);
  useEffect(() => {
    dispatch(showPostList());
  }, []);
  if (loading) {
    return <h1>Loading...</h1>;
  }
  return (
    <div>
      <ul className="list-group">
        {list.length === 0 ? (
          <h1>No Posts...</h1>
        ) : (
          list.map((i) => (
            <li
              key={i.id}
              className="list-group-item d-flex justify-content-between align-items-start"
            >
              <div className="ms-2 me-auto">
                <div className="fw-bold">{i.title}</div>
                {i.content}
              </div>
              <span className="badge bg-primary rounded-pill">
                {new Date(i.updatedAt).toLocaleDateString()}
              </span>
            </li>
          ))
        )}
      </ul>
      <Link to="/post/create" className="btn btn-outline-primary mt-5">
        Add Post
      </Link>
    </div>
  );
};

export default ListPost;
