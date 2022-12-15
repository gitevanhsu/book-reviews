import React from "react";

import { ComponentStory, ComponentMeta } from "@storybook/react";
import { ThemeProvider } from "styled-components";

import { ResImg2 } from "../components/header/commentNotice";
import { theme } from "../pages/_app";
import { rejectImg } from "../utils/imgs";

export default {
  title: "ResImg2",
  component: ResImg2,
  argTypes: { onClick: { action: "removeNotice" } },
} as ComponentMeta<typeof ResImg2>;

const Template: ComponentStory<typeof ResImg2> = (args) => (
  <ThemeProvider theme={theme}>
    <ResImg2 {...args} />
  </ThemeProvider>
);

export const Normal = Template.bind({});

Normal.args = {
  src: rejectImg,
  alt: "delete",
  width: 25,
  height: 25,
};
