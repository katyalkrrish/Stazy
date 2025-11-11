if (process.env.NODE_ENV !== "production") {
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

// Support multiple possible env names for flexibility (Render vs local)
let urldb = process.env.ALTLASDB_URL || process.env.ATLASDB_URL || process.env.MONGODB_URI || process.env.MONGO_URL;
const redactedUri = urldb ? urldb.replace(/(mongodb(?:\+srv)?:\/\/[^:]+):[^@]+@/, '$1:<password>@') : 'MISSING';
console.log('DB URI (redacted):', redactedUri);

app.engine('ejs',ejsmate);

app.use(methodOverride('_method'));
app.use(express.urlencoded({extended:true}));
app.use(express.static(path.join(__dirname,"/public")));

app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));






async function connectWithRetry(attempt = 1) {
    if (!urldb) {
        console.error('No MongoDB URI found in environment variables.');
        return;
    }
    try {
        await mongoose.connect(urldb, { serverSelectionTimeoutMS: 8000 });
        console.log('MongoDB connection established');
    } catch (err) {
        console.error(`MongoDB connect failed (attempt ${attempt}):`, err.code || err.message);
        if (attempt < 5) {
            const wait = attempt * 2000;
            console.log(`Retrying in ${wait}ms... Ensure Atlas allows this service's outbound IP (or temporarily whitelist 0.0.0.0/0).`);
            setTimeout(() => connectWithRetry(attempt + 1), wait);
        } else {
            console.error('All retry attempts exhausted.');
        }
    }
}
connectWithRetry();


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


app.use("/listings", listingsRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/", userRouter);

// Root redirect & health check for Render
app.get('/', (req, res) => res.redirect('/listings'));
app.get('/_health', (req, res) => res.send('ok'));

app.all("*", (req, res, next) => {
    console.warn(`404 Not Found: ${req.method} ${req.originalUrl}`);
    next(new ExpressError(404, "Page Not Found"));
});

app.use((err,req,res,next)=>{
    let {StatusCode=500,message}=err;
    console.log(err);
    
    res.status(StatusCode).render("error.ejs",{StatusCode,message});
});



const PORT = process.env.PORT || 4000; // Render supplies PORT
app.listen(PORT, () => {
    console.log('Server listening on port', PORT);
    console.log(`Local listings URL: http://localhost:${PORT}/listings`);
});