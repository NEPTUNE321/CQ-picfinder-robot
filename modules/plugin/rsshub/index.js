const rss = require('./src/rss');

const getMsg = () => {
  return new Promise((resolve, reject) => {
    rss((msg, group) => {
      console.log(msg)
      resolve({
        msg: msg,
        groupId: group
      })
    })
  })
}

export default {
  getMsg
}