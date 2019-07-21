const _data = require('./data')
const _user = require('./user')

/**
 * 检测是否在直播
 * @param id
 * @return {Promise}
 */
async function check (id) {
  let data = await _data(id)
  let user = await _user(id)
  let info = {
    id: data.room_id,
    status: data.live_status === 1
  }
  if (info.status) {
    info.time = data.live_time
    info.title = data.title
    info.name = user.info.uname
    info.unix = parseInt(new Date(data.live_time).getTime() / 1000)
  }
  return info
}

module.exports = check
