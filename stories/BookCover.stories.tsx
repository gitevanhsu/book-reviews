import React from "react";

import { ComponentStory, ComponentMeta } from "@storybook/react";
import { ThemeProvider } from "styled-components";

import { BookLink, BookImg, NoImgTitle, Book } from "../pages/books";
import { theme } from "../pages/_app";
import { bookCover } from "../utils/imgs";

const data = {
  authors: ["James Clear"],
  title: "Atomic Habits",
  textSnippet:
    "He calls them atomic habits. In this ground-breaking book, Clears reveals exactly how these minuscule changes can grow into such life-altering outcomes.",
  ratingCount: 42,
  description:
    "THE PHENOMENAL INTERNATIONAL BESTSELLER: 1 MILLION COPIES SOLD Transform your life with tiny changes in behaviour, starting now. People think that when you want to change your life, you need to think big. But world-renowned habits expert James Clear has discovered another way. He knows that real change comes from the compound effect of hundreds of small decisions: doing two push-ups a day, waking up five minutes early, or holding a single short phone call. He calls them atomic habits. In this ground-breaking book, Clears reveals exactly how these minuscule changes can grow into such life-altering outcomes. He uncovers a handful of simple life hacks (the forgotten art of Habit Stacking, the unexpected power of the Two Minute Rule, or the trick to entering the Goldilocks Zone), and delves into cutting-edge psychology and neuroscience to explain why they matter. Along the way, he tells inspiring stories of Olympic gold medalists, leading CEOs, and distinguished scientists who have used the science of tiny habits to stay productive, motivated, and happy. These small changes will have a revolutionary effect on your career, your relationships, and your life. ________________________________ A NEW YORK TIMES AND SUNDAY TIMES BESTSELLER 'A supremely practical and useful book.' Mark Manson, author of The Subtle Art of Not Giving A F*ck 'James Clear has spent years honing the art and studying the science of habits. This engaging, hands-on book is the guide you need to break bad routines and make good ones.' Adam Grant, author of Originals 'Atomic Habits is a step-by-step manual for changing routines.' Books of the Month, Financial Times 'A special book that will change how you approach your day and live your life.' Ryan Holiday, author of The Obstacle is the Way",
  publishedDate: "2018-10-18",
  reviewCount: 10,
  categories: ["Self-Help"],
  subtitle: "the life-changing million-copy #1 bestseller",
  publisher: "Random House",
  smallThumbnail:
    "http://books.google.com/books/content?id=fFCjDQAAQBAJ&printsec=frontcover&img=1&zoom=5&edge=curl&source=gbs_api",
  isbn: "9781473537804",
  ratingMember: [
    "C9ouvOtgypduKcv5paCPneSOqFn1",
    "uHw1McHYgMOpsUOJ3AVoEgUCsYJ3",
    "dF9PufKtHEVLheuckGoFKoZH4MK2",
    "WSflD7kAiZOcV0U1KQsVLo0tPzM2",
    "hkFzu1B8d1XljUznrWMQYwtHUEE2",
    "doi3yTJBEsPOuOxuVTPBsCLxfXC2",
    "gdGV5y3r2MMhIqFnnd17C7He46g1",
    "fVGWKI980gVuIutCrcM6pYQz9t13",
    "oVap8rI9JlZoLECH4vi5hsYBDhr1",
    "Ibo9nm3emSh9W380x2Os2saEruO2",
  ],
  thumbnail:
    "http://books.google.com/books/content?id=fFCjDQAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api",
  infoLink:
    "http://books.google.com.tw/books?id=fFCjDQAAQBAJ&dq=intitle:atomic+habits&hl=&source=gbs_api",
  noCover: false,
};

const data2 = { ...data, smallThumbnail: "", noCover: true };

export default {
  title: "BookCover",
  component: BookLink,
  argTypes: { onClick: { action: "move" } },
} as ComponentMeta<typeof BookLink>;

const Template: ComponentStory<typeof BookLink> = (args) => (
  <ThemeProvider theme={theme}>
    <BookLink {...args}>
      <BookImg
        src={args.data.smallThumbnail ? args.data.smallThumbnail : bookCover}
        alt={`${args.data.title}`}
        width={128}
        height={193}
      />
      {args.data.noCover && <NoImgTitle>{args.data.title}</NoImgTitle>}
    </BookLink>
  </ThemeProvider>
);

export const Normal = Template.bind({});
export const NoCover = Template.bind({});

Normal.args = { data };
NoCover.args = { data: data2 };
