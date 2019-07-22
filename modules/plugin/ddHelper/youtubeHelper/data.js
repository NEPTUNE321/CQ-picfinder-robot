import Axios from 'axios'
import conf from '../../../config';

const key = conf.picfinder.google.key

let params = {
  eventType: 'live',
  part: 'snippet',
  type: 'video',
  key: key
}

function user (id) {
  params.channelId = id
  const hour = new Date().getHours()
  if (hour < 18) return []
  return new Promise(function (resolved, reject) {
    const query = `?channelId=${params.channelId}&eventType=${params.eventType}&part=${params.part}&type=${params.type}&key=${params.key}`
    const api = `https://content.googleapis.com/youtube/v3/search${query}`
    Axios.get(api)
      .then(res => {
        console.log(res.data.items)
        // https://www.youtube.com/watch?v=res.data.items.id.videoId
        let data = res.data.items
        resolved(data)
      })
      .catch(err => {
        // if (err.response.data) console.log(JSON.stringify(err.response.data))
        return reject(err)
      })
  })
}

module.exports = user
