//jshint esversion:6
require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");

let encrypt=require("mongoose-encryption");
let md5=require("md5");
const mongoose = require("mongoose");
const ejs = require("ejs");
const _ = require("lodash");
const res = require("express/lib/response");
const homeStartingContent = "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Tellus in hac habitasse platea dictumst vestibulum rhoncus est pellentesque. Vitae nunc sed velit dignissim sodales ut eu sem. Sed tempus urna et pharetra pharetra. Purus sit amet luctus venenatis lectus. Venenatis urna cursus eget nunc scelerisque viverra mauris in aliquam. Pretium lectus quam id leo in vitae turpis massa sed. Eu volutpat odio facilisis mauris sit amet massa. Platea dictumst quisque sagittis purus sit amet volutpat. Pellentesque sit amet porttitor eget. Quis viverra nibh cras pulvinar mattis. Ut consequat semper viverra nam libero justo laoreet. Morbi tempus iaculis urna id volutpat. Felis eget nunc lobortis mattis aliquam faucibus. Sit amet cursus sit amet dictum sit amet. Tortor posuere ac ut consequat semper viverra. Non nisi est sit amet facilisis magna."
const aboutContent = "Hac habitasse platea dictumst vestibulum rhoncus est pellentesque. Dictumst vestibulum rhoncus est pellentesque elit ullamcorper. Non diam phasellus vestibulum lorem sed. Platea dictumst quisque sagittis purus sit. Egestas sed sed risus pretium quam vulputate dignissim suspendisse. Mauris in aliquam sem fringilla. Semper risus in hendrerit gravida rutrum quisque non tellus orci. Amet massa vitae tortor condimentum lacinia quis vel eros. Enim ut tellus elementum sagittis vitae. Mauris ultrices eros in cursus turpis massa tincidunt dui.";
const contactContent = "Scelerisque eleifend donec pretium vulputate sapien. Rhoncus urna neque viverra justo nec ultrices. Arcu dui vivamus arcu felis bibendum. Consectetur adipiscing elit duis tristique. Risus viverra adipiscing at in tellus integer feugiat. Sapien nec sagittis aliquam malesuada bibendum arcu vitae. Consequat interdum varius sit amet mattis. Iaculis nunc sed augue lacus. Interdum posuere lorem ipsum dolor sit amet consectetur adipiscing elit. Pulvinar elementum integer enim neque. Ultrices gravida dictum fusce ut placerat orci nulla. Mauris in aliquam sem fringilla ut morbi tincidunt. Tortor posuere ac ut consequat semper viverra nam libero.";

const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://bhoopen:3796@cluster0.luvnn.mongodb.net/weblogDB");

const postSchema = {
  title: String,
  content: String
};

const Post = mongoose.model("Post", postSchema);

let userSchema=new mongoose.Schema({
  email: String, 
  password: String
});

let User=new mongoose.model("user", userSchema);

app.get("/", function(req, res){
  res.render("login");
})

app.get("/register", function(req, res){
  res.render("register");
})

app.post("/", function(req, res){
  const name=req.body.username;
  const pass=md5(req.body.password);  
  User.findOne({email:name}, function(err, foundUser){
      if(err) console.log(err);
      else{
          if(foundUser){
              if(foundUser.password===pass){
                  res.redirect("home");
              }
              else{
                console.log(foundUser.password);
                console.log(pass);
                res.render("login");
              }
              
          }
          else
          res.render("login");
      }
  });
});

app.post("/register", function(req, res){
  let newUser=new User({
      email:req.body.username,
      password:md5(req.body.password)
  })
  newUser.save(function(err){
      if(err){
          console.log(err);
      }
      else {
          res.render("login");
      }
  })
})

app.get('/home', function(req, res){
  res.sendFile(__dirname+"/index.html");
})

app.get('/community',function(req,res){
  Post.find({}, function(err, posts){
    res.render("home", {
      startingContent: homeStartingContent,
      posts: posts
      });
  });
});

app.get("/community/about",function(req,res){
  res.render("about", {aboutc:aboutContent});
});

app.get("/community/contact",function(req,res){
  res.render("contact", {contact:contactContent});
});

app.get("/community/compose",function(req,res){
  res.render("compose");
});

app.post("/community/compose", function(req,res){
  const post = new Post({
    title: req.body.postTitle,
    content: req.body.postBody   
  });
  post.save(function(err){
      if (!err){
          res.redirect("/community");
      }
  });
});

app.get("/community/posts/:postId", function(req, res){
  const requestedPostId = req.params.postId;
  if(requestedPostId!='navbar.js'){
    Post.findOne({_id: requestedPostId}, function(err, post){
      if(err) {
        console.log(err);
      }
      else{
        res.render("post", {
          titley: post.title,
          paragraph: post.content
        });
      }
    });
  }
});

app.listen(process.env.PORT||3000, function() {
  console.log("Server started on port 3000");
});
