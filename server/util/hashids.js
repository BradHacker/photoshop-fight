const hashids = require('hashids');
const HashId = new hashids(process.env.HASHID_SALT);

module.exports = HashId;
