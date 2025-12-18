const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const { isLoggedIn ,validateListing, isOwner } = require("../middleware.js");
const listingcontroller= require("../controllers/listings.js");
const multer  = require('multer')
const{storage}= require("../cloudComfig.js")
const upload = multer({ storage });


router.route("/")
.get(wrapAsync(listingcontroller.index))
.post(isLoggedIn,upload.single('listing[Image]'),validateListing,wrapAsync(listingcontroller.createroute));

//search route
router.get("/search", wrapAsync(listingcontroller.searchListings));

//filter route
router.get("/filter", wrapAsync(listingcontroller.filterListings));

//new route
router.get("/new", isLoggedIn,listingcontroller.rendernewform);


 router.route("/:id")
.get(wrapAsync(listingcontroller.showlisting))
.put(isLoggedIn,isOwner,upload.single('listing[Image]'),validateListing,wrapAsync(listingcontroller.updateroute))
.delete(isLoggedIn,isOwner,wrapAsync(listingcontroller.deleteroute));


//edit route
router.get("/:id/edit",isLoggedIn,isOwner,wrapAsync(listingcontroller.renderEditroute));


module.exports = router;
