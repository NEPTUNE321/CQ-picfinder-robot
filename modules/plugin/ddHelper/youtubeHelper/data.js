import Axios from 'axios'

const key = 'AIzaSyB_KwkA7BmXg2Abj820Doq52TqK0w_IRxs'

let params = {
  eventType: 'live',
  part: 'snippet',
  type: 'video',
  key: key
}

function user (id) {
  params.channelId = id
  return new Promise(function (resolved, reject) {
    let api = `https://content.googleapis.com/youtube/v3/search`
    Axios.get(api, { params })
      .then(res => {
        // https://www.youtube.com/watch?v=res.data.items.id.videoId
        user = res.data.items
        resolved(user)
      })
      .catch(err => {
        return reject(err)
      })
  })
}

module.exports = user
