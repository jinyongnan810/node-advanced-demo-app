import { AnyAction, Reducer } from "redux";
import * as types from "../actions/types";
interface PostInfo {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}
interface PostBaseState {
  list: PostInfo[];
  single: PostInfo | null;
  loading: boolean;
  redirect: boolean;
}
interface PostBaseAction {
  type: string;
  payload?: PostInfo | PostInfo[] | string | null;
}
const initialState: PostBaseState = {
  list: [],
  single: null,
  loading: true,
  redirect: false,
};
const postReducer: Reducer<PostBaseState, PostBaseAction> = (
  state: PostBaseState = initialState,
  action: PostBaseAction
) => {
  const { type, payload } = action;
  switch (type) {
    case types.LOAD_POST:
      return { ...state, loading: true, redirect: false };
    case types.LOAD_POST_FAIL:
      return { ...state, loading: false };
    case types.POST_LIST:
      return { ...state, list: payload as PostInfo[], loading: false };
    case types.SHOW_POST:
      return { ...state, single: payload as PostInfo, loading: false };
    case types.ADD_POST:
      return {
        ...state,
        list: [payload as PostInfo, ...state.list],
        loading: false,
        redirect: true,
      };
    case types.DELETE_POST:
      return {
        ...state,
        list: state.list.filter((i) => i.id !== payload),
        loading: false,
      };
    default:
      return state;
  }
};
export default postReducer;
export { PostInfo };
