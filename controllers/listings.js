const listing = require("../models/listing");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken= process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });



module.exports.index = async (req, res) => {
  const allistings = await listing.find({});
  res.render("listings/index.ejs", { allistings });
};

module.exports.rendernewform = (req, res) => {res.render("listings/new.ejs");};

module.exports.showlisting = async (req, res) => {
  let { id } = req.params;
  const listings = await listing
    .findById(id)
    .populate({
      path: "reviews",
      populate: {
        path: "author",
      },
    })
    .populate("owner");
  if (!listings) {
    req.flash("error", "Listing you requested for does not exist");
    res.redirect("/listings");
  }
  //   console.log("listings", listings);
  res.render("listings/show.ejs", { listings });
};

module.exports.createroute = async (req, res, next) => {

  let response =await geocodingClient.forwardGeocode({
  query: req.body.listing.location,
  limit: 1,
})
  .send()
  


 let url= await req.file.path;
 let filename =  await req.file.filename;
console.log(url ,"--------" ,filename);

  const newlisting = new listing(req.body.listing);
  newlisting.owner = req.user._id;
  newlisting.Image={url,filename};
  newlisting.geometry=response.body.features[0].geometry;

  let savedlis=await newlisting.save();
  console.log(savedlis);
  
  req.flash("success", "New Listing Created !!! ");
  res.redirect("/listings");
};

module.exports.renderEditroute = async (req, res) => {
  let { id } = req.params;
  const listings = await listing.findById(id);
  if (!listings) {
    req.flash("error", "Listing you requested for does not exist");
    res.redirect("/listings");
  }
 let originalImageUrl=listings.Image.url;
 originalImageUrl=originalImageUrl.replace("/upload","/upload/h_250,w_250")
  res.render("listings/edit.ejs", { listings,originalImageUrl });
};

module.exports.updateroute = async (req, res) => {
  let { id } = req.params;
  let Listing =await listing.findByIdAndUpdate(id, { ...req.body.listing });
  if(typeof(req.file)!=="undefined"){
  let url= await req.file.path;
 let filename =  await req.file.filename;

 Listing.Image={url,filename};
 await Listing.save();
  }
  req.flash("success", "Listing Updated !!! ");
  res.redirect(`/listings/${id}`);
};

module.exports.deleteroute = async (req, res) => {
  let { id } = req.params;

  let deleted = await listing.findByIdAndDelete(id);
  console.log(deleted);
  req.flash("success", "Listing Deleted !!! ");
  res.redirect("/listings");
};
