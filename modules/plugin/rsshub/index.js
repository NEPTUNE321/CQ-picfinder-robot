const rss = require('./src/rss');

const getMsg = (bot) => {
  rss((msg, group) => {
    return new Promise((resolve, reject) => {
      bot('send_group_msg', {
        group_id: group,
        message: msg
      }).then(resolve).catch(reject);
    })
  })
}

export default {
  getMsg
}