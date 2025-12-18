const listing = require("../models/listing");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken= process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });



module.exports.index = async (req, res) => {
  const allistings = await listing.find({});
  res.render("listings/index.ejs", { allistings });
};

module.exports.searchListings = async (req, res) => {
  const { q } = req.query;
  if (!q || q.trim() === '') {
    req.flash("error", "Please enter a search term");
    return res.redirect("/listings");
  }
  
  // Search in title, location, country, and description using case-insensitive regex
  const allistings = await listing.find({
    $or: [
      { title: { $regex: q, $options: 'i' } },
      { location: { $regex: q, $options: 'i' } },
      { country: { $regex: q, $options: 'i' } },
      { description: { $regex: q, $options: 'i' } }
    ]
  });
  
  if (allistings.length === 0) {
    req.flash("error", `No listings found for "${q}"`);
    return res.redirect("/listings");
  }
  
  res.render("listings/index.ejs", { allistings });
};

module.exports.getSuggestions = async (req, res) => {
  const { q } = req.query;
  if (!q || q.trim() === '') {
    return res.json([]);
  }
  
  try {
    const query = q.trim();
    
    // Search for listings matching the query
    const listings = await listing.find({
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { location: { $regex: query, $options: 'i' } },
        { country: { $regex: query, $options: 'i' } }
      ]
    }).limit(5);
    
    // Extract unique suggestions from titles, locations, and countries
    const suggestions = new Set();
    
    listings.forEach(list => {
      if (list.title) suggestions.add(list.title);
      if (list.location) suggestions.add(list.location);
      if (list.country) suggestions.add(list.country);
    });
    
    // Return as array, limited to 5 suggestions
    const result = Array.from(suggestions).slice(0, 5);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.json([]);
  }
};

module.exports.filterListings = async (req, res) => {
  const { category } = req.query;
  if (!category) {
    return res.redirect("/listings");
  }
  
  // Define keywords for each category
  const categoryKeywords = {
    "Trending": ["popular", "trending", "luxury", "exclusive", "modern"],
    "Rooms": ["room", "bedroom", "suite", "apartment", "studio"],
    "Iconic Cities": ["city", "urban", "downtown", "metro", "metropolitan", "new york", "paris", "london", "tokyo", "dubai"],
    "Castles": ["castle", "palace", "manor", "estate", "historic", "fortress"],
    "Amazing pools": ["pool", "swimming", "poolside", "infinity pool", "heated pool"],
    "Farms": ["farm", "ranch", "countryside", "rural", "barn", "farmhouse", "agricultural"],
    "Arctic": ["arctic", "snow", "winter", "ski", "mountain", "cold", "alpine", "northern"],
    "Treehouses": ["treehouse", "tree house", "forest", "canopy", "woods", "treetop"],
    "Beachfront": ["beach", "beachfront", "ocean", "sea", "coastal", "seaside", "waterfront", "shore"]
  };
  
  const keywords = categoryKeywords[category];
  if (!keywords) {
    return res.redirect("/listings");
  }
  
  // Search for listings matching any of the keywords
  const allistings = await listing.find({
    $or: keywords.map(keyword => ({
      $or: [
        { title: { $regex: keyword, $options: 'i' } },
        { description: { $regex: keyword, $options: 'i' } },
        { location: { $regex: keyword, $options: 'i' } }
      ]
    }))
  });
  
  if (allistings.length === 0) {
    req.flash("error", `No listings found in ${category} category`);
    return res.redirect("/listings");
  }
  
  res.render("listings/index.ejs", { allistings, selectedCategory: category });
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
