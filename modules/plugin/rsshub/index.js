const rss = require('./src/rss');

const getMsg = (bot) => {
  rss((msg, id, type) => {
    return new Promise((resolve, reject) => {
      let type = 'send_group_msg',
        obj = {
          group_id: id,
          message: msg
        }
      if (type = 'member') {
        type = 'send_private_msg'
        obj = {
          user_id: id,
          message: msg
        }
      }
      bot(type, obj).then(resolve).catch(reject);
    })
  })
}

export default {
  getMsg
}