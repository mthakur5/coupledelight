const Pusher = require('pusher');

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID || '1896917',
  key: process.env.PUSHER_KEY || '4c0410062699d310aa2f',
  secret: process.env.PUSHER_SECRET || '76cf4f1cbf231f49b110',
  cluster: process.env.PUSHER_CLUSTER || 'ap2',
  useTLS: true
});

module.exports = pusher;
