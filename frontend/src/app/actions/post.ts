import { Action, AnyAction, Dispatch } from "redux";
import { ThunkAction } from "redux-thunk";
import axios from "axios";
import * as types from "./types";
import { showMessages } from "./messages";
const jsonConfig = {
  headers: {
    "Content-Type": "application/json",
  },
};
export const showPostList = (): ThunkAction<
  void,
  Object,
  unknown,
  AnyAction
> => async (dispatch) => {
  try {
    dispatch({ type: types.LOAD_POST });
    const res = await axios.get("/api/posts");
    dispatch({ type: types.POST_LIST, payload: res.data });
  } catch (error) {
    console.error(error);
    dispatch(showMessages("warning", error.response.data.errors));
    dispatch({ type: types.LOAD_POST_FAIL });
  }
};

export const showPost = (
  id: string
): ThunkAction<void, Object, unknown, AnyAction> => async (dispatch) => {
  try {
    dispatch({ type: types.LOAD_POST });
    const res = await axios.get(`/api/posts/${id}`);
    dispatch({ type: types.SHOW_POST, payload: res.data });
  } catch (error) {
    console.error(error);
    dispatch(showMessages("warning", error.response.data.errors));
    dispatch({ type: types.LOAD_POST_FAIL });
  }
};

export const createPost = (
  title: string,
  content: string
): ThunkAction<void, Object, unknown, AnyAction> => async (dispatch) => {
  try {
    dispatch({ type: types.LOAD_POST });
    const res = await axios.post(`/api/posts`, { title, content }, jsonConfig);
    dispatch({ type: types.ADD_POST, payload: res.data });
  } catch (error) {
    console.error(error);
    dispatch(showMessages("warning", error.response.data.errors));
    dispatch({ type: types.LOAD_POST_FAIL });
  }
};

export const deletePost = (
  id: string
): ThunkAction<void, Object, unknown, AnyAction> => async (dispatch) => {
  try {
    const res = await axios.delete(`/api/posts/${id}`);
    dispatch({ type: types.DELETE_POST, payload: id });
  } catch (error) {
    console.error(error);
    dispatch(showMessages("warning", error.response.data.errors));
  }
};
