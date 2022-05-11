import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import authAPI from "../../api/AuthApi";
import postAPI from "../../api/PostApi";

export const LoginUser = createAsyncThunk(
  "auth/LoginUser",
  async (params, thunkAPI) => {
    const currentUser = await authAPI.getAccount(params);
    return currentUser;
  }
);

export const Logout = createAsyncThunk("auth/logout", async () => {
  console.log("dô trong create async logout");
  await authAPI.logout();
  return 0;
});

export const getPosts = createAsyncThunk("post/getPosts", async () => {
  console.log("Lấy post của thái");
  const listPosts = await postAPI.getPosts();
  return listPosts;
});

const AuthSlice = createSlice({
  name: "auth",
  initialState: {
    current: {},
    loading: false,
    error: "",
    isLogin: false,
  },
  reducers: {},
  extraReducers: {
    [LoginUser.pending]: (state) => {
      state.loading = true;
      console.log("Đang load");
    },

    [LoginUser.rejected]: (state, action) => {
      state.loading = false;
      console.log("Đăng nhập thất bại");
      state.error = "Đăng nhập thất bại !";
    },

    [LoginUser.fulfilled]: (state, action) => {
      state.loading = false;
      localStorage.setItem("authTokens", JSON.stringify(action.payload.tokens));
      state.current = action.payload.currentUser;
      state.isLogin = true;
      localStorage.setItem(
        "LoginUser",
        JSON.stringify(action.payload.currentUser)
      );
    },

    [Logout.fulfilled]: (state, action) => {
      state.isLogin = false;
      localStorage.removeItem("authTokens");
      localStorage.removeItem("LoginUser");
    },
    [getPosts.fulfilled]: (state, action) => {
      console.log(action.payload);
    },
  },
});

export const { reducer: AuthReducer, actions } = AuthSlice;
// export const { Logout } = actions;
export default AuthReducer;
