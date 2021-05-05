import { combineReducers } from "redux";
import auth from "./auth";
import post from "./post";
import messages from "./messages";
export default combineReducers({ auth, post, messages });
