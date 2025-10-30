import React, { useState, useEffect } from "react";
import { Link, useHistory } from "react-router-dom";
import { GoogleLogin, GoogleOAuthProvider } from "@react-oauth/google";
import { useStore, actions } from "../../store";
import "./style.scss";

const LoginButton = ({ onLogin }) => {
  const history = useHistory();
  const [state, dispath] = useStore();

  const handleSuccess = async (response) => {
    try {
      const res = await fetch(`${state.domain}/auth/google`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          credential: response.credential,
        }),
        credentials: "include",
      });

      if (!res.ok) throw new Error("Login failed");
      const data = await res.json();

      onLogin(data);
      console.log("Google login successful:", data);
      dispath(actions.set_is_login(false));
      history.push("/");
    } catch (err) {
      console.error("Google login error:", err);
    }
  };

  const handleError = () => {
    console.error("Login Failed");
  };

  return (
    <>
      <GoogleLogin onSuccess={handleSuccess} onError={handleError} />
    </>
  );
};

const AuthPage = () => {
  const [state, dispath] = useStore();

  const handleLogin = (data) => {
    dispath(actions.set_user_info(data.user));
  };

  useEffect(() => {
    if (state.isLogin) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    // Dọn dẹp khi unmount
    return () => {
      document.body.style.overflow = "";
    };
  }, [state.isLogin]);

  return (
    <GoogleOAuthProvider clientId={state.clientId}>
      <div className="login-container">
        <div
          className="login-overlay"
          onClick={() => dispath(actions.set_is_login(false))}
        >
          <div className="login-box" onClick={(e) => e.stopPropagation()}>
            <div className="title">LOGIN</div>
            <hr />
            <LoginButton onLogin={handleLogin} />
          </div>
        </div>
      </div>
    </GoogleOAuthProvider>
  );
};

export default AuthPage;
