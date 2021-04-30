import { useAppDispatch, useAppSelector } from "../hooks";
import React, { useEffect } from "react";
import { Redirect, useHistory } from "react-router";
import Messages from "./Messages";
import * as types from "../actions/types";
import { showMessages } from "../actions/messages";
const Dashboard = () => {
  const { isAuthenticated, loading, user } = useAppSelector(
    (state) => state.auth
  );
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (isAuthenticated) {
      return function cleanUp() {};
    }
  }, [loading]);
  return (
    <div>
      <Messages />
      <h1>Dashboard</h1>
    </div>
  );
};

export default Dashboard;
