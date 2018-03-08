var express=   require("express"),
    app=       express(),
    bodyParser= require("body-parser"),
    mongoose=   require("mongoose"),
    passport  = require("passport"),
    LocalStrategy = require("passport-local"),
    Campground= require("./models/campground"),
    Comment   = require("./models/comment"),
    User      = require("./models/user"),
    seedDB    = require("./seeds");
    
//PASSPORT CONFIGURATION
app.use(require("express-session")({
    secret: "Harika's secret key",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

mongoose.connect("mongodb://localhost/yelp_camp");
app.use(bodyParser.urlencoded({extended:true}));
app.set("view engine","ejs");
app.use(express.static(__dirname+"/public"));
seedDB();  


/*Campground.create({
    name: "Salmon Greek",
    image: "https://farm6.staticflickr.com/5181/5641024448_04fefbb64d.jpg",
    description: "This is a huge granite hill,no bathrooms"
},function(err,newGround){
    if(err){
           console.log(err);
        }else{
           console.log(newGround);
        }
});
*/

//routes
app.get("/",function(req,res){
    res.render("landing");
});


//INDEX- Show all campgrounds
app.get("/campgrounds", function(req,res){
    Campground.find({},function(err,allCampgrounds){
        if(err){
           console.log(err);
        }
        else{
           res.render("campgrounds/index",{campgrounds:allCampgrounds});
        }
    })
    
    //res.render("campgrounds",{campgrounds:campgrounds});
    
});

app.post("/campgrounds", function(req,res){
    var name= req.body.name;
    var image= req.body.image;
    var desc= req.body.description;
    var newCampground= {name:name,image:image,description: desc};
    Campground.create(newCampground,function(err,newlyCreated){
        if(err){
            console.log(err);
        }else{
            res.redirect("campgrounds");
        }
    });
});

app.get("/campgrounds/new", function(req,res){
    res.render("campgrounds/new");
});

app.get("/campgrounds/:id", function(req,res){
    console.log(req.params.id);
    Campground.findById(req.params.id).populate("comments").exec(function(err, foundCampground){
        if(err){
            console.log(err);
        }else{
            res.render("campgrounds/show", {campground: foundCampground});
        }
    });
});


//Comments Route

app.get("/campgrounds/:id/comments/new",function(req,res){
    Campground.findById(req.params.id,function(err,campground){
        if(err){
            console.log(err);
        }else{ 
            res.render("comments/new",{campground: campground});
        }
    });
});

//Comment Create Route
app.post("/campgrounds/:id/comments",function(req,res){
    Campground.findById(req.params.id,function(err,campground){
        if(err){
            console.log(err);
        }else{
            Comment.create(req.body.comment,function(err,comment){
                if(err){
                    console.log(err);
                }else{
                    campground.comments.push(comment);
                    campground.save();
                    res.redirect("/campgrounds/"+campground._id);
                }
            });
        }
    });
});


app.listen(process.env.PORT, process.env.IP, function(){
    console.log("The YelpCamp Server has started");
});