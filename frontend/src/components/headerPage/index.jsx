import React, { useEffect, useState, useRef } from "react";
import { Link, useHistory } from "react-router-dom";
import { useStore, actions } from "../../store";

import logoImg from "./assets/logo/logo.png";
import "./style.scss";

export default function Header() {
  const [state, dispath] = useStore();
  const [showInfo, setShowInfo] = useState(false);
  const boxInfoRef = useRef(null);
  const history = useHistory();

  useEffect(() => {
    function handleClickOutside(event) {
      if (boxInfoRef.current && !boxInfoRef.current.contains(event.target)) {
        setShowInfo(false);
      }
    }

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  useEffect(() => {
    if (state.isLogin) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  }, [state.isLogin]);

  // Logout function

  useEffect(() => {
    const refreshAccessToken = async () => {
      try {
        const res = await fetch(`${state.domain}/auth/refresh`, {
          method: "POST",
          credentials: "include", // gửi cookie refreshToken
        });
        if (!res.ok) return;
        const data = await res.json();

        // Lấy thông tin user
        const userRes = await fetch(`${state.domain}/auth/me`, {
          headers: { Authorization: `Bearer ${data.accessToken}` },
        });
        if (!userRes.ok) return;
        const user = await userRes.json();

        dispath(actions.set_user_info(user));
      } catch (err) {
        console.error("Auto login failed:", err);
      }
    };

    refreshAccessToken();
  }, []);

  const handleLogout = async () => {
    try {
      await fetch(`${state.domain}/auth/logout`, {
        method: "POST",
        credentials: "include", // để clear cookie
      });

      dispath(actions.set_user_info({})); // clear user info
      dispath(actions.set_is_login(false));
      history.push("/");
      showInfo && setShowInfo(false);
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  return (
    <div className="header">
      <div className="header-left">
        <Link to="/"><img
            src={logoImg}
            alt="Logo"
            className="logo-img"
            style={{ width: "3rem", height: "3rem" }}
          /></Link>
      </div>
      <div className="header-center">
        <input type="text" className="search-input" placeholder="Search..." />
        <button className="btn-search">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
            height="16"
            width="16"
            viewBox="0 0 24 24"
            focusable="false"
            aria-hidden="true"
            style={{
              pointerEvents: "none",
              display: "inherit",
              width: "100%",
              height: "100%",
              fill: "light-dark(var(--dark-100), var(--light-100))",
            }}
          >
            <path
              clipRule="evenodd"
              d="M16.296 16.996a8 8 0 11.707-.708l3.909 3.91-.707.707-3.909-3.909zM18 11a7 7 0 00-14 0 7 7 0 1014 0z"
              fillRule="evenodd"
            ></path>
          </svg>
        </button>
      </div>
      <div className="header-right">
        {state.userInfo.id ? (
          <>
            <div
              className="user-info"
              style={{
                background: `url(${state.userInfo.picture}) no-repeat center center / cover`,
              }}
              onClick={(e) => {
                e.stopPropagation();
                setShowInfo((prev) => !prev);
              }}
            ></div>
            {showInfo && (
              <div className="more-user-info" ref={boxInfoRef}>
                <div className="detail-info">
                  <div
                    className="avatar"
                    style={{
                      background: `url(${state.userInfo.picture}) no-repeat center center / cover`,
                    }}
                  ></div>
                  <div className="info">
                    <div className="user-name">{state.userInfo.name}</div>
                    <div className="user-mention">{state.userInfo.mention}</div>
                  </div>
                </div>
                <hr />
                <div className="btn-actions">
                  <button className="btn logout" onClick={() => handleLogout()}>
                    log out</button>
                </div>
              </div>
            )}
          </>
        ) : (
          <button
            className="icon-btn"
            onClick={() => {
              dispath(actions.set_is_login(true));
              history.push("/auth");
            }}
          >
            Login
          </button>
        )}
      </div>
    </div>
  );
}
