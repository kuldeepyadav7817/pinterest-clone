const mongoose = require('mongoose');


const postSchema = new mongoose.Schema({
  postTxt: {
    type: String,
    required: true
  },
  image: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  likes: {
    type: Array ,
    default: [],
  },
  user:{
    type:mongoose.Schema.Types.ObjectId,
    ref:'user'
  }
});

const Post = mongoose.model('Post', postSchema);

module.exports = Post;
