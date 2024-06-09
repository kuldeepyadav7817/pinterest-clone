const express = require('express');
const router = express.Router();
const usermodel = require("./users");
const passport = require('passport');
const localStrategy = require("passport-local");
const upload = require("./multer")
const postmodel = require("./posts")

passport.use(new localStrategy(usermodel.authenticate()));

// Middleware to check if the user is authenticated
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/");
}

// home page
router.get('/', function (req, res) {
  res.render('Homepage');
});




// Register page
router.get('/register', function (req, res) {
  res.render('register');
});

// User register
router.post("/register", function (req, res) {
  const { username, email, fullname } = req.body;
  const userData = new usermodel({ username, email, fullname });

  usermodel.register(userData, req.body.password)
    .then(() => {
      passport.authenticate("local")(req, res, function () {
        res.redirect("/profile");
      });
    })
    .catch(err => {
      console.error("Error registering user:", err);
      res.redirect("/register");
    });
});

// Login page
router.get('/login', function (req, res) {
  res.render('login', { error: req.flash('error') });
});

// Login authentication
router.post("/login", passport.authenticate("local", {
  successRedirect: "/profile",
  failureRedirect: "/login",
  failureFlash: true
}));

// Logout page
router.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/');
});

// Feed page

router.get('/feed', isLoggedIn, async function (req, res,next) {
  const user = await usermodel.findOne({ username: req.session.passport.User });
  const posts = await postmodel.find();
  res.render("feed", { user, posts });
});


// User profile
router.get('/profile', isLoggedIn, async function (req, res) {

  let user = await usermodel.findOne({
    username: req.session.passport.user
  })
    .populate("posts")
  res.render("profile", { user });
});

// Upload with multer
router.post('/upload', isLoggedIn, upload.single('file'), async function (req, res, next) {
  if (!req.file) {
    return res.status(400).send('No files were uploaded');
  }
  const user = await usermodel.findOne({ username: req.session.passport.user })
  const postdata = await postmodel.create({
    postTxt: req.body.postTxt,
    image: req.file.filename,
    user: user._id
  })
  user.posts.push(postdata._id)
  await user.save();

  res.redirect('/profile');
});


router.post('/profileUpload', isLoggedIn, upload.single('image'), async function (req, res, next) {
  const user = await usermodel.findOne({ username: req.session.passport.user });
  user.dp = req.file.filename;
  await user.save();
  res.redirect('/profile')
})




module.exports = router;
