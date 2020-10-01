const hashids = require('hashids');
const HashId = new hashids(process.env.HASHID_SALT);

const fightActionEncode = (action, hashid) => HashId.encodeHex(Buffer(`${action}_${hashid}`).toString('hex'));

const fightActionDecode = (hash) => {
  const parts = Buffer(HashId.decodeHex(hash), 'hex').toString('utf8').split('_');
  return {
    action: parts[0],
    hashid: parts[1],
  };
};

module.exports = {
  HashId,
  fightActionEncode,
  fightActionDecode,
};
