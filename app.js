const express = require("express");
const app= express();
const mongoose = require("mongoose");
const listing = require("./models/listing.js");
const Review = require("./models/review.js");
const path = require("path");
const methodOverride = require('method-override');
const ejsmate= require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
const { listingSchema ,reviewSchema} = require("./schema.js");



app.engine('ejs',ejsmate);

app.use(methodOverride('_method'));
app.use(express.urlencoded({extended:true}));
app.use(express.static(path.join(__dirname,"/public")));

app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));

const validateListing = (req,res,next)=>{
    let {error} = listingSchema.validate(req.body);
    // console.log(result);
    
    if(error){
        let errorm = error.details.map((el)=>el.message).join(",");
        throw new ExpressError(400,errorm);
    }else{
        next();
    }
}

const validateReview = (req,res,next)=>{
    let {error} = reviewSchema.validate(req.body);
    // console.log(result);
    
    if(error){
        let errorm = error.details.map((el)=>el.message).join(",");
        throw new ExpressError(400,errorm);
    }else{
        next();
    }
}


main()
    .then(()=>{
    console.log("connection formed");
    
}).catch(err => console.log(err));

async function main() {
    await mongoose.connect('mongodb+srv://katyalkrrish:PjLWZtC93IKNZO3y@cluster0.irbeqgw.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0');
    };

app.get("/",(req,res)=>{
res.send("hello bhai root bhi chal gya");
});


// app.get("/testListing", async(req,res)=>{
// let sampleListing= new listing({
//     title :"My Home",
//     description: " by the beach",
//     price:1200,
//     location:" calangute ,Goa",
//     country:"India"



// });
// await sampleListing.save();
// console.log("sample was success");
// res.send("successful testing");


// index route
app.get("/listings",wrapAsync(async (req,res)=>{

      const allistings = await listing.find({});
        res.render("listings/index.ejs",{allistings});
}));


// new route
app.get("/listing/new",(req,res)=>{
    res.render("listings/new.ejs")
});

//show route
app.get("/listing/:id",wrapAsync( async (req,res)=>{
    // console.log("hello1");
    
    let {id}= req.params;
    if(id.length<24){
        throw new ExpressError(400,"send valid data for listing");
    }
    // console.log("hello2");
   const listings = await listing.findById(id).populate("reviews");
//    console.log(listings);

    res.render("listings/show.ejs",{listings});
}));


// Create route

app.post("/listings", validateListing, wrapAsync(async(req,res,next)=>{
   


const newlisting =new listing(req.body.listing);
await newlisting.save();
res.redirect("/listings");
   

}));

//edit route
app.get("/listings/:id/edit",validateListing, wrapAsync(async(req,res)=>{
    // console.log("inside edit rout");
    
    let {id}= req.params;
    // console.log("inside edit rout2");
    const listings = await listing.findById(id);
    // console.log("inside edit rout3");
    res.render("listings/edit.ejs",{listings});
    
}));



//update route

app.put("/listing/:id",validateListing,wrapAsync(async(req,res)=>{
    
    let {id}= req.params;
    if(!req.body.listing){
        throw new ExpressError(400,"send valid data for listing");
    }
    
   await listing.findByIdAndUpdate(id,{...req.body.listing});
    res.redirect(`/listing/${id}`);
}));

//              delete route
app.delete("/listing/:id",wrapAsync(async (req,res)=>{
    
    let {id}= req.params;
    
   let deleted= await listing.findByIdAndDelete(id);
   console.log(deleted);
   res.redirect("/listings");
   

}));



//reviews
//post route

app.post("/listings/:id/reviews",validateReview, wrapAsync(async(req,res)=>{

let listings = await listing.findById(req.params.id);
let newReview= new Review(req.body.review);
listings.reviews.push(newReview);
await newReview.save();
await listings.save();
console.log("new review saved");
res.redirect(`/listing/${listings._id}`);

}));

//delete route
app.delete("/listings/:id/reviews/:reviewid",wrapAsync(async(req,res)=>{
    let{id,reviewid}=req.params;
    await listing.findByIdAndUpdate(id,{$pull:{reviews:reviewid}})
  await  Review.findByIdAndDelete(reviewid);
  res.redirect(`/listing/${id}`);
}));

app.all("/listings/*",(req,res,next)=>{
    next(new ExpressError(404,"Page Not Found"));
});

app.use((err,req,res,next)=>{
    let {StatusCode=500,message}=err;
    console.log(err);
    
res.status(StatusCode).render("error.ejs",{StatusCode,message});
    res.status(StatusCode).send(message);
});








app.listen(3000,()=>{
    console.log("hello bhai chal gya");
    console.log("http://localhost:3000/listings")
});