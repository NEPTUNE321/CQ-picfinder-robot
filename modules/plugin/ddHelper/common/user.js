import Axios from 'axios'

function user(id) {
  return new Promise(function(resolved, reject) {
    let api = `https://api.live.bilibili.com/live_user/v1/UserInfo/get_anchor_in_room?roomid=${id}`
    Axios.get(api)
      .then(res => {
        user = res.data.data
        resolved(user)
      })
      .catch(err => {
        return reject(err)
      })
  })
}

module.exports = user
