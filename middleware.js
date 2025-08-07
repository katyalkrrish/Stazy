const listing = require("./models/listing.js");
const { listingSchema } = require("./schema.js");
const ExpressError = require("./utils/ExpressError.js");
const { reviewSchema } = require("./schema.js");

const Review = require("./models/review.js");
module.exports.isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    req.session.redirectUrl = req.originalUrl;
    console.log("User not authenticated, saving URL:", req.originalUrl);
    req.flash("error", "You must be logged in");
    return res.redirect("/login");
  }
  next();
};

module.exports.saveRedirectUrl = (req, res, next) => {
  console.log("Saving redirect URL, session has:", req.session.redirectUrl);

  if (req.session.redirectUrl) {
    res.locals.redirectUrl = req.session.redirectUrl;
    console.log("Moved to res.locals:", res.locals.redirectUrl);
    delete req.session.redirectUrl; // Clear the redirect URL after saving it
  }
  next();
};

module.exports.isOwner = async (req, res, next) => {
  let { id } = req.params;
  let listing1 = await listing.findById(id);
  if (!listing1.owner.equals(req.user._id)) {
    req.flash("error", "You are not the owner of this listing");
    return res.redirect(`/listings/${id}`);
  }
  next();
};

module.exports.validateListing = (req, res, next) => {
  let { error } = listingSchema.validate(req.body);
  // console.log(result);

  if (error) {
    let errorm = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, errorm);
  } else {
    next();
  }
};

module.exports.validateReview = (req, res, next) => {
  let { error } = reviewSchema.validate(req.body);
  // console.log(result);

  if (error) {
    let errorm = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, errorm);
  } else {
    next();
  }
};

module.exports.isReviewAuthor= async(req,res,next)=>{
    let { id,reviewid } = req.params;
  let listing1 = await Review.findById(reviewid);
  if (!listing1.author.equals(res.locals.currUser._id)) {
    req.flash("error", "You did not create this review");
    return res.redirect(`/listings/${id}`);
  }
  next();
};