module.exports = {
  channels: {
    line: {
      enabled: true,
      path: '/api/webhooks/line',
      accessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
      channelSecret: process.env.LINE_CHANNEL_SECRET,
    },
  },
};

