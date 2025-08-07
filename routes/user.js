const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware.js");
const usercontroller= require("../controllers/user.js");



router.route("/signup")
.get(usercontroller.rendersignupform)
.post(wrapAsync(usercontroller.signup));

router.route("/login")
.get(usercontroller.renderloginform)
.post(saveRedirectUrl,
  passport.authenticate("local", {
    failureRedirect: "/login",
    failureFlash: true,
  }),usercontroller.login);


//logout  
router.get("/logout", usercontroller.logout);

module.exports = router;
