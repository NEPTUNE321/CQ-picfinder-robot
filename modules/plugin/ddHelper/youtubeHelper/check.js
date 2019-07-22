const _data = require('./data')

/**
 * 检测是否在直播
 * @param id
 * @return {Promise}
 */
async function check (id) {
  let data = await _data(id)
  let info = {
    type: 'you',
    status: data.length > 0
  }
  if (data.length > 0) {
    info.id = data[0].id.videoId
    info.time = data[0].snippet.publishedAt
    info.name = data[0].snippet.channelTitle
    info.title = data[0].snippet.title
    info.unix = parseInt(new Date(data[0].snippet.publishedAt).getTime() / 1000)
  }
  return info
}

module.exports = check
