import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { MemberInfo } from "../utils/firebaseFuncs";

const initialState: MemberInfo = {
  uid: "",
  name: "",
  email: "",
  intro: "",
  isSignIn: false,
  img: "",
  friends: [],
  books: [],
  reading: [],
  finish: [],
};

export const userInfoSlice = createSlice({
  name: "userInfo",
  initialState,
  reducers: {
    userSignIn: (state, action: PayloadAction<MemberInfo>) => {
      state.uid = action.payload.uid;
      state.name = action.payload.name;
      state.email = action.payload.email;
      state.intro = action.payload.intro;
      state.img = action.payload.img;
      state.friends = action.payload.friends;
      state.books = action.payload.books;
      state.reading = action.payload.reading;
      state.finish = action.payload.finish;
      state.isSignIn = true;
    },
    userSignOut: (state, action: PayloadAction<MemberInfo>) => {
      state.uid = action.payload.uid;
      state.name = action.payload.name;
      state.email = action.payload.email;
      state.intro = action.payload.intro;
      state.img = action.payload.img;
      state.friends = action.payload.friends;
      state.books = action.payload.books;
      state.reading = action.payload.reading;
      state.finish = action.payload.finish;
      state.isSignIn = false;
    },
  },
});

export const { userSignIn, userSignOut } = userInfoSlice.actions;

export default userInfoSlice.reducer;
