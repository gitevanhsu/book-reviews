import React from "react";

import { ComponentStory, ComponentMeta } from "@storybook/react";
import { ThemeProvider } from "styled-components";

import CommentNoticeComponent from "../components/header/commentNotice";
import { theme } from "../pages/_app";

const data = {
  reciver: "C9ouvOtgypduKcv5paCPneSOqFn1",
  content: "<p>test</p><p><br></p>",
  poster: "5neclwgAltVrCYHW3NmFf1uKzuX2",
  noticeid: "1670715876773",
  time: { seconds: 1670715876, nanoseconds: 773000000 } as unknown as Date,
  postUrl: "/book/id:9780147517487",
  posterInfo: {
    books: ["9789861372273", "9789864893645"],
    isSignIn: true,
    uid: "5neclwgAltVrCYHW3NmFf1uKzuX2",
    friends: ["C9ouvOtgypduKcv5paCPneSOqFn1", "dF9PufKtHEVLheuckGoFKoZH4MK2"],
    name: "Evan",
    finish: ["9781473537804", "9789571039817", "9786267079065"],
    img: "https://firebasestorage.googleapis.com/v0/b/book-reviews-87d66.appspot.com/o/book-stack.png?alt=media&token=16d3a52f-862d-4908-977f-68f7f8af783a",
    reading: ["9787020036646"],
    intro: "我是 Evan。\n平常喜歡閱讀，運動。\n很高興認識大家。",
    email: "evan@gmail.com",
  },
};

export default {
  title: "CommentNotice",
  component: CommentNoticeComponent,
  parameters: { actions: { argTypesRegex: "^on.*" } },
} as ComponentMeta<typeof CommentNoticeComponent>;

const Template: ComponentStory<typeof CommentNoticeComponent> = (args) => (
  <ThemeProvider theme={theme}>
    <CommentNoticeComponent {...args} />
  </ThemeProvider>
);
export const Normal = Template.bind({});

Normal.args = {
  data,
};
