import React from "react";
import { Route, Switch, useLocation } from "react-router-dom";

import { useStore } from "./store";

// ------------ Components ---------------
import Header from "./components/headerPage";
import HomePage from "./components/homePage";
import AuthPage from "./components/loginPage";
import BillPage from "./components/billPage";
import ProductManager from "./components/uploadProductPage";
import ProductUpdateForm from "./components/updateProductPage";
import ProductDetails from "./components/productDetailsPage";
import ShopingCartPage from "./components/shopingCartPage";
// ---------------------------------------

function MainContent() {
  const [state, dispatch] = useStore();

  return (
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
          <Route exact path="/shoping-cart" component={ShopingCartPage} />
          <Route
            exact
            path="/product-details/:productId"
            component={ProductDetails}
          />
        </Switch>
      </div>
    </>
  );
}

export default MainContent;
