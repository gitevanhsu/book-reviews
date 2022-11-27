import type { AppProps } from "next/app";
import { ResetStyle, GlobalStyle } from "../components/globalStyle";
import { HeaderComponent } from "../components/header";
import { Provider } from "react-redux";
import store from "../store";
import { resetServerContext } from "react-beautiful-dnd";
import { ThemeProvider } from "styled-components";
import Head from "next/head";

const theme = {
  red: "#E84545",
  greyBlue: "#A0BCC2",
  greyGreen: "#DAE5D0",
  yellow: "#F9EBC8",
  white: "#F5F5F5",
  grey: "#EEE",
  black: "#393E46",
  yellow2: "#ffefc6",
  fz: "12",
};

// break point
// 1280
// 992
// 768
// 576
// 480
import initAuth from "../initAuth"; // the module you created above

initAuth();

export default function App({ Component, pageProps }: AppProps) {
  resetServerContext();
  return (
    <>
      <Head>
        <title>Book Reviews!</title>
        <link rel="shortcut icon" href="static/favicon.ico" />
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
