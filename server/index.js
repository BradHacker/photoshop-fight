const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const passport = require('passport');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);

const { db } = require('./util/database');

require('./util/auth');

const UserRouter = require('./routes/user.router');
const FightRouter = require('./routes/fight.router');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(cors());
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: new MongoStore({ mongooseConnection: db }),
  })
);
app.use(passport.initialize());
app.use(passport.session());

app.use('/api/v1/users', UserRouter);
app.use('/api/v1/fights', FightRouter);

const { Fight } = require('./models/fight.model');
const HashId = require('./util/hashids');

io.sockets.on('connection', (socket) => {
  console.log('******new socket connection******');
  socket.on('join_fight', (data, send) => {
    console.log(`Looking for fight with id: ${HashId.decodeHex(data.fightId)}`);
    Fight.findOneAndUpdate(
      { _id: HashId.decodeHex(data.fightId) },
      { $push: { competitors: HashId.decodeHex(data.userId) } },
      (err, doc) => {
        if (err) return send({ success: false, err: { ...err } });
        return send({ success: true, fight: doc });
      }
    );

    setTimeout(() => socket.emit('message', 'hey'), 5000);
  });

  socket.on('view_fight', (data, send) => {
    console.log('data', data);
    Fight.findOneAndUpdate(
      { _id: HashId.decodeHex(data.fightId) },
      { $push: { viewers: HashId.decodeHex(data.userId) } },
      (err, doc) => {
        if (err) return send({ success: false, err: { ...err } });
        return send({ success: true, fight: doc });
      }
    );
  });
});

server.listen(process.env.PORT);
