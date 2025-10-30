import React from "react";
import { Route, Switch, useLocation } from "react-router-dom";
import { LoaderPage } from "./components/base/LoaderForm.jsx";
import { useStore } from "./store";

// ------------ Components ---------------
import Header from "./components/headerPage";
import HomePage from "./components/homePage";
import AuthPage from "./components/loginPage";
import BillPage from "./components/billPage";
import ProductManager from "./components/uploadProductPage"
import ProductUpdateForm from "./components/updateProductPage"

function MainContent({ loading }) {
  const location = useLocation();
  // const hideHeader = location.pathname === "/auth";
  const [state, dispatch] = useStore();

  return (
    <>
      {loading && <LoaderPage />}
      {!loading && (
        <>
          {state.isLogin && <AuthPage />}
          <Header />
          <div className="page-container">
            <Switch>
              <Route exact path="/" component={HomePage} />
              <Route exact path="/auth" component={HomePage} />
              <Route exact path="/bill" component={BillPage} />
              <Route exact path="/product-manager" component={ProductManager} />
              <Route exact path="/product-update" component={ProductUpdateForm} />
            </Switch>
          </div>
        </>
      )}
    </>
  );
}

export default MainContent;
