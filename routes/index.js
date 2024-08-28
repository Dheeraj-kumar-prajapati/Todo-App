var express = require('express');
var router = express.Router();
const { User } = require('../models/todoSchema');

router.get('/', async function (req, res) {

  if (req.cookies && req.cookies.user_id) {
    req.session = req.session || {};
    req.session.username = req.cookies.user_id;
    req.session.isAuthenticated = true;
    console.log("user name : ", req.session.username);

    const user = await User.findById({ _id: req.session.username });

    res.render('todo', { username: user.username });
  }
  else
    res.redirect("/login");
});

router.get('/signup', function (req, res) {
  return res.render('signupPage');
});

router.get('/verify', function (req, res) {
  return res.render('verifyAcc');
})

router.get('/login', function (req, res) {
  return res.render('loginPage');
});

module.exports = router;