// here the central place that holds all apps state 

import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";

const store = configureStore({
    reducer:{
        auth:authReducer,
    }
});

export default store;