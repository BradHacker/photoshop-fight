const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
const app = express();

require('./util/database');
require('./util/auth');

const UserRouter = require('./routes/user.router');

app.use(bodyParser.json());
app.use(cookieParser());
app.use(cors());
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());

app.use('/api/v1/users', UserRouter);

app.listen(process.env.PORT, () => console.log(`Server listening on ${process.env.PORT}`));
