module.exports = {
  channels: {
    line: {
      enabled: true,
      path: '/api/webhooks/line',
      // 支援兩種環境變數命名方式
      accessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN || process.env.CHANNEL_ACCESS_TOKEN,
      channelSecret: process.env.LINE_CHANNEL_SECRET || process.env.CHANNEL_SECRET,
    },
  },
};

