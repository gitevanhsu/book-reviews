// ./pages/demo
import React from "react";
import {
  useAuthUser,
  withAuthUser,
  withAuthUserTokenSSR,
  AuthAction,
  withAuthUserSSR,
} from "next-firebase-auth";
import { GetServerSideProps } from "next";

const Demo = ({}) => {
  const AuthUser = useAuthUser();
  return (
    <div>
      <p>Your email is {AuthUser.email ? AuthUser.email : "unknown"}.</p>
    </div>
  );
};

// Note that this is a higher-order function.
// export const getServerSideProps = withAuthUserTokenSSR()();

// export default withAuthUser()(Demo);

export const getServerSideProps: GetServerSideProps = withAuthUserTokenSSR({
  // whenUnauthed: AuthAction.REDIRECT_TO_LOGIN,
})(async ({ AuthUser }) => {
  console.log(AuthUser);
  // const token = await AuthUser.getIdToken();
  const token = AuthUser.getIdToken();
  console.log();
  return {
    props: {},
  };
});

export default withAuthUser()(Demo);
