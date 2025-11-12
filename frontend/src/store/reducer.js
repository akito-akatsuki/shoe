import * as constants from "./constants.js";

const initState = {
  todos: [],
  userInfo: [],
  accessToken: "",
  domain: "http://localhost:5000",
  // domain: "",
  clientId:
    "382574203305-ud2irfgr6bl243mmq6le9l67e29ire7d.apps.googleusercontent.com",
  isLogin: false,

  allProducts: [],
};

function reducer(state, action) {
  switch (action.type) {
    case constants.SET_IS_LOGIN:
      return {
        ...state,
        isLogin: action.payload,
      };
    case constants.SET_USER_INFO:
      return {
        ...state,
        userInfo: action.payload,
      };
    case constants.SET_ACCESS_TOKEN:
      return {
        ...state,
        accessToken: action.payload,
      };
    case constants.SET_ALL_PRODUCTS:
      return {
        ...state,
        allProducts: action.payload,
      };
    default:
      throw new Error("Invalid action.");
  }
}

export { initState };
export default reducer;
