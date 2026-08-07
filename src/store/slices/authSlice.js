// slice ---a peice of store -- each slice has its own state and actions 
import {createSlice} from '@reduxjs/toolkit';


const authSlice = createSlice({
    name:"auth" , 

    initialState:{
        user: JSON.parse(localStorage.getItem("user")) || null ,
        token: localStorage.getItem("authToken") || null ,
        isAuthenticated : !!localStorage.getItem("authToken")
    } ,

    reducers:{
        setCredentials: (state,action) => {
            state.user = action.payload.user;
            state.token = action.payload.token;
            state.isAuthenticated = true;
            localStorage.setItem("authToken", action.payload.token);
            localStorage.setItem("user", JSON.stringify(action.payload.user));
        },

        logout: (state) => {
            state.user = null;
            state.token = null;
            state.isAuthenticated = false;
            localStorage.removeItem("authToken");
            localStorage.removeItem("user");
        }
    }

});

export const {setCredentials , logout} = authSlice.actions;

export default authSlice.reducer;