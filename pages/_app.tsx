import type { AppProps } from "next/app";
import { ResetStyle, GlobalStyle } from "../components/globalStyle";
import { Header } from "../components/header";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <ResetStyle />
      <GlobalStyle />
      <Header />
      <Component {...pageProps} />
    </>
  );
}
