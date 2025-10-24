import React, { useEffect, useRef } from "react";

const LoaderPage = () => {
  return (
    <div className="showbox">
      <div className="loader">
        <svg className="circular" viewBox="25 25 50 50">
          <circle
            className="path"
            cx="50"
            cy="50"
            r="20"
            fill="none"
            strokeWidth="2"
            strokeMiterlimit="10"
          />
        </svg>
      </div>
    </div>
  );
}

const Loader = () => {
  const loaderRef = useRef(null); // Dùng ref để tham chiếu đến loader
  const wrapperRef = useRef(null); // Dùng ref để tham chiếu đến wrapper

  useEffect(() => {
    function adjustLoaderSize() {
      const { offsetWidth: w, offsetHeight: h } = wrapperRef.current;
      if (w > h) {
        loaderRef.current.style.height = "40%";
        loaderRef.current.style.width = "auto";
      } else {
        loaderRef.current.style.width = "80%";
        loaderRef.current.style.height = "auto";
      }
    }

    adjustLoaderSize();
  }, []);

  return (
    <div ref={wrapperRef} style={{ position: 'relative', width: "100%", height: "100%" }}>
      <div ref={loaderRef} id="LoaderForm"></div>
    </div>
  );
}


export { LoaderPage, Loader };
