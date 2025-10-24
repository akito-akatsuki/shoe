import React from "react";
import "./style.scss";

export default function Banner({ bannerUrl, width, height }) {
  return (
    <div className="home-page-banner" style={{ width, height }}>
      <img id="banner-img" src={bannerUrl} alt="banner" />
    </div>
  );
}
