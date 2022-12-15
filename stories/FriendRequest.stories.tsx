import React from "react";

import { ComponentStory, ComponentMeta } from "@storybook/react";
import { ThemeProvider } from "styled-components";
import { Provider } from "react-redux";
import store from "../store";

import FriendRequestComponent from "../components/header/friendRequest";
import { theme } from "../pages/_app";

const data = {
  uid: "Dl3XLiFOgZg0vgPpQjiTLbGzzY13",
  books: [],
  friends: [],
  finish: [],
  name: "Ming",
  isSignIn: true,
  intro: "",
  reading: [],
  email: "ming@gmail.com",
  img: "https://firebasestorage.googleapis.com/v0/b/book-reviews-87d66.appspot.com/o/book-stack.png?alt=media&token=16d3a52f-862d-4908-977f-68f7f8af783a",
};

export default {
  title: "FriendRequest",
  component: FriendRequestComponent,
  parameters: { actions: { argTypesRegex: "^on.*" } },
} as ComponentMeta<typeof FriendRequestComponent>;

const Template: ComponentStory<typeof FriendRequestComponent> = (args) => (
  <ThemeProvider theme={theme}>
    <Provider store={store}>
      <FriendRequestComponent {...args} />
    </Provider>
  </ThemeProvider>
);
export const Normal = Template.bind({});

Normal.args = {
  data,
};
