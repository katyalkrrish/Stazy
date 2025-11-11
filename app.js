if(process.env.NODE_ENV!="production"){
require('dotenv').config();
}

// console.log(process.env.SECRET);

const express = require("express");
const app= express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require('method-override');
const ejsmate= require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const session= require("express-session");
const MongoStore = require('connect-mongo');

const reviewRouter= require("./routes/review.js");
const listingsRouter=require("./routes/listing.js");
const userRouter = require("./routes/user.js");

const flash = require("connect-flash");
const passport= require("passport");
const LocalStrategy= require("passport-local");
const User= require("./models/user.js")

let urldb = process.env.ALTLASDB_URL;

app.engine('ejs',ejsmate);

app.use(methodOverride('_method'));
app.use(express.urlencoded({extended:true}));
app.use(express.static(path.join(__dirname,"/public")));

app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));






main()
    .then(()=>{
    console.log("connection formed");
    
}).catch(err => console.log(err));

async function main() {

    await mongoose.connect(urldb);
    };


    const store = MongoStore.create({
    mongoUrl: urldb,
   crypto: {
       secret: process.env.SECRET
   },

    touchAfter: 24 * 3600 // time period in seconds
});
store.on("error",function(e){
    console.log("session store error",e);
});

     //in milli seconds for one week;
const sessionoptions={
    store,
    secret: process.env.SECRET,
    resave:false,
    saveUninitialized:true,
    cookie:{
        expires: Date.now()+7*24*60*60*1000,    
   
        maxAge:7*24*60*60*1000,
        httpOnly: true,
    }
};



app.use(session(sessionoptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.use((req,res,next)=>{
    res.locals.success=req.flash("success");
    res.locals.error=req.flash("error");
    res.locals.currUser= req.user;
    next();
})

// app.get("/demouser",async(req,res)=>{
//     let fakeuser=new User({
//         email:"student@gmail.com",
//         username:"delta-student"
//     });
//    let registeredUser= await User.register(fakeuser,"helloworld");
//    res.send(registeredUser);
// })


app.use("/listings",listingsRouter);
app.use("/listings/:id/reviews",reviewRouter);
app.use("/",userRouter);

app.all("*",(req,res,next)=>{
    next(new ExpressError(404,"Page Not Found"));
});

app.use((err,req,res,next)=>{
    let {StatusCode=500,message}=err;
    console.log(err);
    
    res.status(StatusCode).render("error.ejs",{StatusCode,message});
});



app.listen(3000,()=>{
    console.log("hello bhai chal gya");
    console.log("http://localhost:3000/listings")
});