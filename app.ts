import express from "express";
import cors from "cors";
import { config } from "dotenv";

config({ path: ".env" });

import * as SocialSigninHelper from "./SocialSigninHelper";

const app = express();

app.use(cors());

const router = express.Router();

router.route("/google-signin").get(SocialSigninHelper.generateSignInUrl);

router.route("/google-auth").get(SocialSigninHelper.validateGoogleToken);

app.use("/api", router);

app.get("/", (req, res) => {
  res.status(200).json({ error: false, msg: "Test Google Signin" });
});

// Port settings
app.listen(process.env.PORT || 3000, () => {
  console.log(`Server started on port ${process.env.PORT || 3000}`);
});
