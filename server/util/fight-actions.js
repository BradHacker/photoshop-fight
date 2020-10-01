const { Fight } = require('../models/fight.model');
const { HashId } = require('../util/hashids');

const competeInFight = (socket, userId, hashId, callback) => {
  Fight.findOneAndUpdate(
    { _id: HashId.decodeHex(hashId) },
    { $pull: { competitors: { user: HashId.decodeHex(userId) } } },
    (err, doc) => {
      if (err) return callback({ success: false, error: { ...err } });
      // doc.populate({ path: 'competitors.user', select: { password: 0, _id: 0 } }, (err, fight) => {
      //   if (fight.competitors.filter((c) => c.user.hashid === data.userId).length > 0) {
      //     console.log(data.userId);
      //     console.log(fight.competitors.filter((c) => c.user.hashid === data.userId));
      //     console.log(
      //       `Previous competitor ready state: ${fight.competitors.filter((c) => c.user.hashid === data.userId)[0].ready}`
      //     );
      //   }
      // });
      Fight.findOneAndUpdate(
        { _id: HashId.decodeHex(hashId) },
        { $addToSet: { competitors: { user: HashId.decodeHex(userId), socketId: (' ' + socket.id).slice(1) } } },
        { new: true },
        (err, res) => {
          if (err) return callback({ success: false, error: { ...err } });
          // console.log(doc);
          res
            .populate({ path: 'viewers.user', select: { password: 0, _id: 0 } })
            .populate({ path: 'competitors.user', select: { password: 0, _id: 0 } }, (err, fight) => {
              if (err) return callback({ success: false, error: { ...err } });
              socket.join(hashId, () => {
                // console.log('socket now connected to: ', Object.keys(socket.rooms));
                socket.to(hashId).emit('competitors_update', { competitors: fight.competitors });
                return callback({
                  success: true,
                  fight,
                  action: 'compete',
                  stateTimeElapsed: fight.stateBeginTime ? (new Date().getTime() - fight.stateBeginTime.getTime()) / 1000 : 0,
                });
              });
            });
        }
      );
    }
  );
};

viewFight = (socket, userId, hashId, callback) => {
  Fight.findOneAndUpdate(
    { _id: HashId.decodeHex(hashId) },
    { $pull: { viewers: { user: HashId.decodeHex(userId) } } },
    (err) => {
      if (err) return callback({ success: false, error: { ...err } });
      Fight.findOneAndUpdate(
        { _id: HashId.decodeHex(hashId) },
        { $addToSet: { viewers: { user: HashId.decodeHex(userId), socketId: (' ' + socket.id).slice(1) } } },
        { new: true },
        (err, doc) => {
          if (err) return callback({ success: false });
          // console.log(doc);
          doc
            .populate({ path: 'viewers.user', select: { password: 0, _id: 0 } })
            .populate({ path: 'competitors.user', select: { password: 0, _id: 0 } }, (err, fight) => {
              socket.join(hashId, () => {
                console.log('socket now viewing fight: ', Object.keys(socket.rooms)[1]);
                socket.to(hashId).emit('viewers_update', { viewers: fight.viewers });
                return callback({ success: true, fight, action: 'view' });
              });
            });
        }
      );
    }
  );
};

competitorReady = (io, socket, data, callback) => {
  const fightId = Object.keys(socket.rooms)[1];
  Fight.findOneAndUpdate(
    { _id: HashId.decodeHex(fightId), 'competitors.user': HashId.decodeHex(data.userId) },
    { $set: { 'competitors.$.ready': data.ready } },
    { new: true },
    (err, doc) => {
      if (err) return callback({ success: false, error: { ...err } });
      doc
        .populate({ path: 'viewers.user', select: { password: 0, _id: 0 } })
        .populate({ path: 'competitors.user', select: { password: 0, _id: 0 } }, (err, fight) => {
          if (err) return callback({ success: false, error: { ...err } });
          // console.log('******* sending competitors_update ******');
          socket.to(fightId).emit('competitors_update', { competitors: fight.competitors });
          callback({ success: true, competitors: fight.competitors });
        });

      // If all competitors ready
      if (doc.competitors.filter((c) => !c.ready).length === 0 && doc.state === 'pre-round') {
        doc.state = 'round-start';
        doc.stateBeginTime = new Date();
        doc.stateLength = 3000 * 60;
        doc.save((err, newDoc) => {
          io.sockets.to(fightId).emit('state_update', { state: 'round-start', stateLength: 3 * 60 });
        });
      }
    }
  );
};

competitorStateFinish = (io, socket, data, callback) => {
  const fightId = Object.keys(socket.rooms)[1];
  Fight.findOneAndUpdate(
    { _id: HashId.decodeHex(fightId), 'competitors.user': HashId.decodeHex(data.userId) },
    { $set: { 'competitors.$.stateDone': true } },
    { new: true },
    (err, doc) => {
      if (err && calback) return callback({ success: false, error: { ...err } });
      doc
        .populate({ path: 'viewers.user', select: { password: 0, _id: 0 } })
        .populate({ path: 'competitors.user', select: { password: 0, _id: 0 } }, (err, fight) => {
          if (err && callback) return callback({ success: false, error: { ...err } });
          // console.log('******* sending competitors_update ******');
          socket.to(fightId).emit('competitors_update', { competitors: fight.competitors });
          if (callback) callback({ success: true, competitors: fight.competitors });
        });

      // If all competitors ready
      if (doc.competitors.filter((c) => !c.stateDone).length === 0 && doc.state === 'round-start') {
        console.log('Ready for initializing round code!!!!!!!!!!!');
        // doc.state = 'round-start';
        // doc.stateBeginTime = new Date();
        // doc.stateLength = 3 * 60;
        // doc.save((err, newDoc) => {
        //   io.sockets.to(fightId).emit('state_update', { state: 'round-start', stateLength: 3 * 60 });
        // });
      }
    }
  );
};

module.exports = {
  competeInFight,
  viewFight,
  competitorReady,
  competitorStateFinish,
};
