const fs = require('fs-extra')
const check = require('./common/check')
const jsonPath = './modules/plugin/ddHelper/runtime/last.json'
const followPath = './modules/plugin/ddHelper/json/following.json'
const qqPath = './modules/plugin/ddHelper/json/ddList.json'

var newLiving = []

fs.writeJsonSync(jsonPath, [])

async function checkLiving () {
  let ups = fs.readJsonSync(followPath)
  let upId = Object.keys(ups)
  let promiseArr = upId.map(ele => check(ele))
  let data = await Promise.all(promiseArr)
  // 获取上次检测结果
  let lastResult = fs.readJsonSync(jsonPath)
  // 获取正在直播的up
  let living = data.filter(function (value) {
    return value.status
  })
  // 获取本次检测结果
  let newResult = living.map(function (value) {
    return value.id
  })
  // 写入本次结果
  fs.writeJsonSync(jsonPath, newResult)
  // 获取本次新开播up
  newLiving = living.filter(function (value) {
    return lastResult.indexOf(value.id) === -1
  })
  if (newLiving.length === 0) return false

  return newLiving
}

const addDDlist = (roomId, name) => {
  if (!roomId || !name) return
  const follow = fs.readJsonSync(followPath)
  let obj = Object.assign(follow, {})
  obj[roomId] = {
    "name": name,
    "roomId": roomId,
    "urlId": roomId
  }
  fs.writeJsonSync(followPath, obj)
  return true
}

const helpMeDD = (qq, name) => {
  if (!name || !qq) return
  const qqfollow = fs.readJsonSync(qqPath)
  let arr = Object.assign(qqfollow, {})
  let list = []
  let youMsg = []
  arr.forEach(element => {
    if (element.id === qq) {
      youMsg = element
      element.follow = element.follow + ',' + name
    }
    list.push(element.id)
  })
  if (!list.includes(qq)) {
    youMsg = {
      "id": qq,
      "follow": name
    }
    arr.push(youMsg)
  }
  fs.writeJsonSync(qqPath, arr)
  return youMsg.follow
}

const ddAtHelper = (CQ, str) => {
  if (!str) return ''
  const arr = fs.readJsonSync(qqPath)
  let atList = ''
  arr.forEach(row => {
    if (row.follow.includes(str.split('Off')[0])) {
      atList += CQ.at(row.id) + '\n'
    }
  })
  return atList
}

const checkVtb = () => {
  const object = fs.readJsonSync(followPath)
  let arr = []
  for (const key in object) {
    if (object.hasOwnProperty(key)) {
      const element = object[key];
      arr.push(element.name)
    }
  }
  return arr.toString()
}


export default {
  checkLiving,
  newLiving,
  addDDlist,
  helpMeDD,
  ddAtHelper,
  checkVtb
}
