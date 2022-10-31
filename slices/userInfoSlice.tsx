import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

export interface UserState {
  uid?: string;
  name?: string;
  email?: string;
  intro?: string;
  isSignIn?: boolean;
}

const initialState: UserState = {
  uid: "",
  name: "",
  email: "",
  intro: "",
  isSignIn: false,
};

export const userInfoSlice = createSlice({
  name: "userInfo",
  initialState,
  reducers: {
    userSignIn: (state, action: PayloadAction<UserState>) => {
      state.uid = action.payload.uid;
      state.name = action.payload.name;
      state.email = action.payload.email;
      state.intro = action.payload.intro;
      state.isSignIn = true;
    },
    userSignOut: (state, action: PayloadAction<UserState>) => {
      state.uid = action.payload.uid;
      state.name = action.payload.name;
      state.email = action.payload.email;
      state.intro = action.payload.intro;
      state.isSignIn = false;
    },
  },
});

export const { userSignIn, userSignOut } = userInfoSlice.actions;

export default userInfoSlice.reducer;
