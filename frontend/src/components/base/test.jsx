import React, { useState } from "react";
import { ButtonForm } from "./formContainer";

export default function Test() {
  const [loading, setLoading] = useState(false);

  const handleClick = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 2000); // 3 giây
  };

  return (
    <div className="showbox">
      <ButtonForm
        onLoad={loading}
        onClick={handleClick}
        disabled={loading}
        style={{ 
            "--text-color-light": "red",
            "--bg-color-light": "#3332",
            "--text-color-dark": "#EEEE",
            "--bg-color-dark": "#EEE2",
         }}
      >
        <svg width="24" height="24" viewBox="0 0 24 24">
          <path d="m10 15.586-3.293-3.293-1.414 1.414L10 18.414l9.707-9.707-1.414-1.414z"></path>
        </svg>
      </ButtonForm>
    </div>
  );
}
