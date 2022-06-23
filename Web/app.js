//jshint esversion:6
require("dotenv").config();
let express = require("express");
let bodyParser = require("body-parser");

let encrypt=require("mongoose-encryption");
let md5=require("md5");
let request=require("request");
let mongoose = require("mongoose");
let ejs = require("ejs");
let _ = require("lodash");
let res = require("express/lib/response");
let session=require("express-session");
let passport=require("passport");
let passportLocalMongoose=require("passport-local-mongoose");
let homeStartingContent = "Plant disease, an impairment of the normal state of a plant that interrupts or modifies its vital functions. All species of plants, wild and cultivated alike, are subject to disease. Although each species is susceptible to characteristic diseases, these are, in each case, relatively few in number. The occurrence and prevalence of plant diseases vary from season to season, depending on the presence of the pathogen, environmental conditions, and the crops and varieties grown. Some plant varieties are particularly subject to outbreaks of diseases while others are more resistant to them. See also list of plant diseases."
let aboutContent = "Hac habitasse platea dictumst vestibulum rhoncus est pellentesque. Dictumst vestibulum rhoncus est pellentesque elit ullamcorper. Non diam phasellus vestibulum lorem sed. Platea dictumst quisque sagittis purus sit. Egestas sed sed risus pretium quam vulputate dignissim suspendisse. Mauris in aliquam sem fringilla. Semper risus in hendrerit gravida rutrum quisque non tellus orci. Amet massa vitae tortor condimentum lacinia quis vel eros. Enim ut tellus elementum sagittis vitae. Mauris ultrices eros in cursus turpis massa tincidunt dui.";
let contactContent = "Scelerisque eleifend donec pretium vulputate sapien. Rhoncus urna neque viverra justo nec ultrices. Arcu dui vivamus arcu felis bibendum. Consectetur adipiscing elit duis tristique. Risus viverra adipiscing at in tellus integer feugiat. Sapien nec sagittis aliquam malesuada bibendum arcu vitae. Consequat interdum varius sit amet mattis. Iaculis nunc sed augue lacus. Interdum posuere lorem ipsum dolor sit amet consectetur adipiscing elit. Pulvinar elementum integer enim neque. Ultrices gravida dictum fusce ut placerat orci nulla. Mauris in aliquam sem fringilla ut morbi tincidunt. Tortor posuere ac ut consequat semper viverra nam libero.";

let app = require("express");

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
app.use(session({
  secret:"Mysecret",
  resave:false,
  saveUninitialized:false
}))
app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb+srv://bhoopen:3796@cluster0.luvnn.mongodb.net/weblogDB");

let postSchema = {
  title: String,
  content: String, 
  postID: String, 
  username: String
};

let Post = mongoose.model("Post", postSchema);

let userSchema=new mongoose.Schema({
  username: String, 
  password: String
});
userSchema.plugin(passportLocalMongoose);

let User=new mongoose.model("user", userSchema);

passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

let authenticate = function (req, res, next) {
  var isAuthenticated = req.isAuthenticated();
  if (isAuthenticated) {
    next();
  }
  else {
    res.redirect("/login");
  }
}

app.get("/login", function(req, res){
  res.render("login");
})

app.get("/register", function(req, res){
  res.render("register");
})

app.post("/login", function(req, res){
  let user=new User({
    username:req.body.username,
    password:req.body.password
  });
  req.login(user, function(err){
    if(err){
      console.log(err);
      res.redirect("/login");
    } 
    else{
      passport.authenticate("local")(req, res, function(){
        res.redirect("/");
      })
    }
  })
});

app.post("/register", function(req, res){
  User.register({username:req.body.username}, req.body.password, function(err, user){
    if(err){
      console.log(err);
      res.redirect("/register");
    }
    else{
      passport.authenticate("local")(req, res, function(){
        res.redirect("/");
      })
    }
  })
})

app.get('/', authenticate, function(req, res, next){
  let s = req.user.username;
  res.render("index", {
    username:s
  });
})

app.get('/community', authenticate, function(req, res, next){
  Post.find({}, function(err, posts){
    res.render("home", {
      startingContent: homeStartingContent,
      posts: posts
      });
  });
});

app.get("/community/about", authenticate, function(req, res, next){
  res.render("about", {aboutc:aboutContent});
});

app.get("/community/contact", authenticate, function(req, res, next){
  res.render("contact", {contact:contactContent});
});

app.get("/community/compose", authenticate, function(req, res, next){
  res.render("compose");
});

app.post("/community/compose", function(req, res){
  let str=req.body.postTitle;
  str = str.replace(/\s+/g, '-').toLowerCase();
  let post = new Post({
    title: req.body.postTitle,
    content: req.body.postBody, 
    postID: str,
    username: req.user.username  
  });
  post.save(function(err){
      if (!err){
          res.redirect("/community");
      }
  });
});

app.get("/profile/:username", authenticate, function(req, res, next){
  let requestedUsername = req.params.username;
  if(requestedUsername!='navbar.js'){
    User.findOne({username:requestedUsername}, function(err, post){
      if(err){
        console.log(err);
      }
      else{
        Post.find({username:requestedUsername}, function(err, posts){
          res.render("profile", {
            username:req.user.username,
            posts:posts
          })
        })
      }
    })
  }
});

app.get("/community/posts/:postId", authenticate, function(req, res, next){
  let requestedPostId = req.params.postId;
  if(requestedPostId!='navbar.js'){
    Post.findOne({postID: requestedPostId}, function(err, post){
      if(err) {
        console.log(err);
      }
      else{
        let str=post.title;
        str = str.replace(/\s+/g, '-').toLowerCase();
        str = "/community/posts/"+str+"/edit";
        res.render("post", {
          titley: post.title,
          paragraph: post.content,
          url: str, 
          username:post.username
        });
      }
    });
  }
});

app.get("/community/posts/:postId/edit", authenticate, function(req, res){
  let requestedPostId = req.params.postId;
  if(requestedPostId!='navbar.js'){
    Post.findOne({postID: requestedPostId}, function(err, post){
      if(err) {
        console.log(err);
      }
      else{
        let str1=post.title;
        str1 = str1.replace(/\s+/g, '-').toLowerCase();
        let str = "/community/posts/"+str1+"/edit";
        if(req.user.username==post.username){
          res.render("postEdit", {
            titley: post.title,
            paragraph: post.content,
            url: str
          });
        }
        else{
          str1="/community/posts/"+str1;
          res.redirect(str1);
        }
      }
    });
  }
})

app.post("/community/posts/:postId/edit", function(req, res){
  let requestedPostId = req.params.postId;
  if(requestedPostId!='navbar.js'){
    Post.findOne({postID: requestedPostId}, function(err, post){
      if(err) {
        console.log(err);
      }
      else{
        let str=post.title;
        str = str.replace(/\s+/g, '-').toLowerCase();
        str = "/community/posts/"+str;
        post.content=req.body.postBody;
        post.save(function(err){
          if (err){
              console.log(err);
          }
        });
        res.redirect(str);
      }
    });
  }
})

app.get("/logout", function(req, res){
  req.logout();
  res.redirect("/");
});

app.listen(process.env.PORT||3000, function() {
  console.log("Server started on port 3000");
});
