import Axios from 'axios'

function user(id) {
  return new Promise(function(resolved, reject) {
    let api = `http://api.live.bilibili.com/room/v1/Room/get_info?room_id=${id}`
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
