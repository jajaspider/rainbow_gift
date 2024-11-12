const axios = require("axios");
const _ = require("lodash");

const config = require("./config");

async function messageHandler(text) {
  const getTime = this.getCurrentTime();
  try {
    await axios.post(
      `https://api.telegram.org/bot${_.get(
        config,
        "telegram_api_key"
      )}/sendMessage`,
      {
        chat_id: _.get(config, "telegram_chat_id"),
        text: `[${getTime}] ${text}`
      }
    );
  } catch (e) {
    console.dir("메세지 전송 실패");
  }
}

module.exports = { messageHandler };
