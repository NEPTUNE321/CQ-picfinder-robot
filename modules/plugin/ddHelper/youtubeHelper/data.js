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
  const query = `?channelId=${params.channelId}&eventType=${params.eventType}&part=${params.part}&type=${params.type}&key=${params.key}`
  const api = `https://content.googleapis.com/youtube/v3/search${query}`
  return Axios.get(api)
}

module.exports = user
