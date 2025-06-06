import express from "express"
import bodyParser from "body-parser"
import mongoose from "mongoose"


const app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect(
  "mongodb://127.0.0.1:27017/blogDB", 
  { useNewUrlParser: true, useUnifiedTopology: true }
);

const postSchema = {
    title: String,
    content: String
};

const Post = mongoose.model("Post", postSchema);

app.get("/", async(req, res)=>{
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
