import { RequestHandler } from "express";
import { google } from "googleapis";

const googleConfig = {
  clientId: process.env.GOOGLE_CLIENT_ID, // e.g. asdfghjkljhgfdsghjk.apps.googleusercontent.com
  clientSecret: process.env.GOOGLE_CLIENT_SECRET, // e.g. _ASDFA%DFASDFASDFASD#FAD-
  redirect: process.env.GOOGLE_REDIRECT_URI, // this must match your google api settings
};

const defaultScope = [
  "https://www.googleapis.com/auth/userinfo.profile",
  "https://www.googleapis.com/auth/userinfo.email",
];

function createConnection() {
  return new google.auth.OAuth2(
    googleConfig.clientId,
    googleConfig.clientSecret,
    googleConfig.redirect
  );
}

function getConnectionUrl(auth: any) {
  return auth.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: defaultScope,
  });
}

export const generateSignInUrl: RequestHandler = async (req, res, next) => {
  try {
    const auth = createConnection();
    const url = getConnectionUrl(auth);
    res.redirect(url);
  } catch (e) {
    res.status(401).json({ error: true, msg: String(e) });
  }
};

export const validateGoogleToken: RequestHandler = async (req, res, next) => {
  try {
    const auth = createConnection();
    const data = await auth.getToken(`${req.query.code}`);
    const tokens = data.tokens;
    auth.setCredentials(tokens);
    const url =
      "https://people.googleapis.com/v1/people/me?personFields=names,emailAddresses,photos";
    const resp: any = await auth.request({ url });

    const user = {
      first_name: resp.data.names[0].givenName,
      last_name: resp.data.names[0].familyName,
      photo: resp.data.photos[0].url,
      email: resp.data.emailAddresses[0].value,
    };
    req.user = user;
    next();
  } catch (e) {
    res.status(401).json({ error: "Not Authorized", msg: String(e) });
  }
};
