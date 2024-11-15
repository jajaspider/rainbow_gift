const axios = require("axios");
const _ = require("lodash");

const config = require("./config");

async function messageHandler(text) {
  const now = new Date();

  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");

  const getTime = `${hours}:${minutes}:${seconds}`;
  try {
    await axios.post(
      `https://api.telegram.org/bot${_.get(
        config,
        "telegram_api_key"
      )}/sendMessage`,
      {
        chat_id: _.get(config, "telegram_chat_id"),
        text: `[${getTime}]\n${text}`
      }
    );
  } catch (e) {
    console.dir("메세지 전송 실패");
  }
}

module.exports = { messageHandler };
