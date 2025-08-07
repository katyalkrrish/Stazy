const passport = require("passport");
const User = require("../models/user.js");

module.exports.rendersignupform = (req, res) => {
  res.render("users/signup.ejs");
};

module.exports.signup = async (req, res) => {
  try {
    let { username, email, password } = req.body;
    const newuser = new User({ email, username });
    const registeredUser = await User.register(newuser, password);
    console.log(registeredUser);
    req.login(registeredUser, (err) => {
      if (err) {
        return next(err);
      }
      req.flash("success", "Welcome to Stazy");
      res.redirect("/listings");
    });
  } catch (e) {
    req.flash("error", e.message);
    res.redirect("/signup");
  }
};



module.exports.renderloginform = (req, res) => {
  // Only save referrer if there's no existing redirectUrl in session
  // (to prioritize protected route redirects over referrer)
  if (
    !req.session.redirectUrl &&
    req.get("Referrer") &&
    !req.get("Referrer").includes("/login")
  ) {
    req.session.redirectUrl = req.get("Referrer");
  }
  res.render("users/login.ejs");
};



module.exports.login = async (req, res) => {
  req.flash("success", "Welcome to Stazy");
  let RedirectUrl = "/listings";
  if (res.locals.redirectUrl) {
    RedirectUrl = res.locals.redirectUrl;
    console.log("Redirecting to saved URL:", RedirectUrl);
  } else {
    console.log("No saved URL, redirecting to default:", RedirectUrl);
  }
  res.redirect(RedirectUrl);
};


module.exports.logout = (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    req.flash("success", "You are logged out!");
    res.redirect("/listings");
  });
};
