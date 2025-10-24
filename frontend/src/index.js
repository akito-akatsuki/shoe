import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { BrowserRouter as Router } from "react-router-dom";
import { StoreProvider } from "./store";

import MainContent from "./main.jsx";

// ------------ CSS ---------------
import "./components/base/js/toast.js";
import "./components/base/js/loader.js";
import "./access/css/base.css";
import "./components/base/css/style.css";
import "./access/fonts/fonts_css/fonts.css";
// --------------------------------

// Component chính
function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <StoreProvider>
      <Router>
        <MainContent loading={loading} />
      </Router>
    </StoreProvider>
  );
}

// Render ứng dụng React vào phần tử có id 'root'
ReactDOM.render(<App />, document.getElementById("root"));
