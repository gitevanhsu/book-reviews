import { configureStore } from "@reduxjs/toolkit";
import userInfoReducer from "../slices/userInfoSlice";

const store = configureStore({
  reducer: {
    userInfo: userInfoReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;

export default store;
