import express from "express"
import bodyParser from "body-parser"
import mongoose from "mongoose"
import session from "express-session"
import bcrypt from "bcrypt"



const app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

app.use(session({
  secret: "YourKey",
  resave: false,
  saveUninitialized: false
}));



mongoose.connect(
  "mongodb://127.0.0.1:27017/blogDB", 
  { useNewUrlParser: true, useUnifiedTopology: true }
);

const passSchema={
  username: String,
  password: String
};

const User = mongoose.model("User", passSchema);

const postSchema = {
    title: String,
    content: String
};

const Post = mongoose.model("Post", postSchema);

app.get("/register", (req, res)=>{
  res.render("register");
});

app.get("/login", (req, res)=>{
  res.render("login");
});

app.get("/profile", (req, res) => {
  if (!req.session.user) {
    return res.redirect("/login");
  }

  res.render("profile", { user: req.session.user });
});


app.post("/register", async (req, res)=>{
  const randPassword = await bcrypt.hash(req.body.password, 10);

  const user = new User({
    username: req.body.username,
    password: randPassword
  });

  await user.save();
  req.session.user=user;
  res.redirect("/profile");
});

app.post("/login", async (req, res) => {
  const user = await User.findOne({ username: req.body.username });

  if (user && await bcrypt.compare(req.body.password, user.password)) {
    req.session.user = user;
    res.redirect("/profile");
  } else {
    res.send("Invalid login");
  }
});


app.get("/", async(req, res)=>{
    if (!req.session.user) {
    return res.redirect("/login");
  }

    const posts= await Post.find();
    res.render("home", {posts: posts});
});

app.get("/compose", (req, res)=>{
    res.render("compose");
});

app.post("/compose", async (req, res) => {
  const post = new Post({
    title: req.body.postTitle,
    content: req.body.postBody
  });

  await post.save();
  res.redirect("/");
});

app.get("/posts/:postId", async (req, res) => {
  const requestedPostId = req.params.postId;
  const post = await Post.findById(requestedPostId);

  res.render("post", {
    title: post.title,
    content: post.content
  });
});

app.listen(3000, function () {
  console.log("Server started on port 3000");
});
