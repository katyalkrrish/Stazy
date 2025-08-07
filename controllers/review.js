const Review = require("../models/review.js");
const listing = require("../models/listing.js");
module.exports.addnewreview=async (req, res, next) => {
    let listings = await listing.findById(req.params.id);
    let newReview = new Review(req.body.review);
    newReview.author=req.user._id;
    console.log(newReview);
    
    listings.reviews.push(newReview);
    await newReview.save();
    await listings.save();
    console.log("new review saved");
    req.flash("success", "New Review Added !!! ");
    res.redirect(`/listings/${listings._id}`);
  }


module.exports.deleteroute=async (req, res) => {
    let { id, reviewid } = req.params;
    await listing.findByIdAndUpdate(id, { $pull: { reviews: reviewid } });
    await Review.findByIdAndDelete(reviewid);
    req.flash("success", "Review Deleted !!! ");
    res.redirect(`/listings/${id}`);
  }