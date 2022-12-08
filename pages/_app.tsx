import type { AppProps } from "next/app";
import Head from "next/head";

import { ResetStyle, GlobalStyle } from "../components/globalStyle";
import { ThemeProvider } from "styled-components";
import { resetServerContext } from "react-beautiful-dnd";
import { Provider } from "react-redux";

import store from "../store";
import { HeaderComponent } from "../components/header";
const theme = {
  red: "#E84545",
  darkYellow: "#f4d68b",
  darkYellow2: "#d3b874",
  yellow: "#F9EBC8",
  white: "#F5F5F5",
  grey: "#EEE",
  black: "#393E46",
  starYellow: "#f39c12",
  fz1: "36px",
  fz2: "32px",
  fz3: "24px",
  fz4: "16px",
  fz5: "12px",
};

export default function App({ Component, pageProps }: AppProps) {
  resetServerContext();
  return (
    <>
      <Head>
        <title>Book Reviews!</title>
        <link rel="shortcut icon" href="static/logo.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>
      <ResetStyle />
      <GlobalStyle />
      <ThemeProvider theme={theme}>
        <Provider store={store}>
          <HeaderComponent />
          <Component {...pageProps} />
        </Provider>
      </ThemeProvider>
    </>
  );
}
