// ./initAuth.js
import { init } from "next-firebase-auth";

const initAuth = () => {
  init({
    authPageURL: "/profile",
    appPageURL: "/",
    loginAPIEndpoint: "/api/login", // required
    logoutAPIEndpoint: "/api/logout", // required
    onLoginRequestError: (err) => {
      console.error(err);
    },
    onLogoutRequestError: (err) => {
      console.error(err);
    },
    // firebaseAuthEmulatorHost: "localhost:3000",
    firebaseAdminInitConfig: {
      credential: {
        projectId: process.env.NEXT_PUBLIC_PROJECTID!,
        clientEmail: process.env.FIREBASE_ADMIN_CONFIG_CLIENT_EMAIL!,
        // The private key must not be accessible on the client side.
        privateKey: process.env.FIREBASE_ADMIN_CONFIG_PRIVATE_KEY!,
      },
      databaseURL: process.env.NEXT_PUBLIC_DATABASE_URL!,
    },
    // Use application default credentials (takes precedence over firebaseAdminInitConfig if set)
    // useFirebaseAdminDefaultCredential: true,
    firebaseClientInitConfig: {
      apiKey: process.env.NEXT_PUBLIC_API_KEY!, // required
      authDomain: process.env.NEXT_PUBLIC_AUTH_DOMAIN!,
      databaseURL: process.env.NEXT_PUBLIC_DATABASE_URL!,
      projectId: process.env.NEXT_PUBLIC_PROJECTID!,
    },
    cookies: {
      name: "Book-Reviews", // required
      // Keys are required unless you set `signed` to `false`.
      // The keys cannot be accessible on the client side.
      keys: [
        process.env.COOKIE_SECRET_CURRENT,
        process.env.COOKIE_SECRET_PREVIOUS,
      ],
      httpOnly: true,
      maxAge: 12 * 60 * 60 * 24 * 1000, // twelve days
      overwrite: true,
      path: "/",
      sameSite: "strict",
      secure: false, // set this to false in local (non-HTTPS) development
      signed: true,
    },
    onVerifyTokenError: (err) => {
      console.error(err);
    },
    onTokenRefreshError: (err) => {
      console.error(err);
    },
  });
};

export default initAuth;
