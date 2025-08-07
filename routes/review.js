const express = require("express");
const router = express.Router({ mergeParams: true });
const wrapAsync = require("../utils/wrapAsync.js");
const { validateReview, isLoggedIn, isReviewAuthor } = require("../middleware.js");
const reviewcontroller= require("../controllers/review.js");


// add new review
router.post("/",isLoggedIn,validateReview,wrapAsync(reviewcontroller.addnewreview));

//delete route
router.delete("/:reviewid",isLoggedIn,isReviewAuthor,wrapAsync(reviewcontroller.deleteroute));

module.exports = router;
