import type { AppProps } from "next/app";
import { ResetStyle, GlobalStyle } from "../components/globalStyle";
import { Header } from "../components/header";
import { Provider } from "react-redux";
import store from "../store";
import { resetServerContext } from "react-beautiful-dnd";
export default function App({ Component, pageProps }: AppProps) {
  resetServerContext();
  return (
    <>
      <ResetStyle />
      <GlobalStyle />
      <Provider store={store}>
        <Header />
        <Component {...pageProps} />
      </Provider>
    </>
  );
}
