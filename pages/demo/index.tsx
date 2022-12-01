// ./pages/demo
import React from "react";
import {
  useAuthUser,
  withAuthUser,
  withAuthUserTokenSSR,
  AuthAction,
} from "next-firebase-auth";
import { GetServerSideProps } from "next";

const Demo = () => {
  const AuthUser = useAuthUser();
  return (
    <div>
      <p>Your email is {AuthUser.email ? AuthUser.email : "unknown"}.</p>
    </div>
  );
};

export const getServerSideProps: GetServerSideProps = withAuthUserTokenSSR({
  // whenUnauthed: AuthAction.REDIRECT_TO_LOGIN,
})(async ({ AuthUser }) => {
  console.log(AuthUser);

  return {
    props: {},
  };
});
export default withAuthUser()(Demo);
