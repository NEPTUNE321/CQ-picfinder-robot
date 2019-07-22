const fs = require('fs-extra')
const check = require('./common/check')
const checkYtb = require('./youtubeHelper/check')
const biliJsonPath = './modules/plugin/ddHelper/runtime/last.json'
const ytbJsonPath = './modules/plugin/ddHelper/runtime/ytblast.json'
const biliPath = './modules/plugin/ddHelper/json/following.json'
const ytbPath = './modules/plugin/ddHelper/json/youtubeFollow.json'
const qqPath = './modules/plugin/ddHelper/json/ddList.json'

var newLiving = []

fs.writeJsonSync(biliJsonPath, [])
fs.writeJsonSync(ytbJsonPath, [])

async function checkLive (followPath, checkFun, jsonPath) {
  let ups = fs.readJsonSync(followPath)
  let upId = Object.keys(ups)
  let promiseArr = upId.map(ele => checkFun(ele))
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

async function checkLiving () {
  const biliArr = await checkLive(biliPath, check, biliJsonPath)
  const youArr = await checkLive(ytbPath, checkYtb, ytbJsonPath)
  let living = Object.assign(biliArr, [])
  if (youArr && youArr.length > 0) {
    youArr.forEach(element => {
      living.push(element)
    })
  }
  return living
}

const addDDlist = (roomId, name) => {
  if (!roomId || !name) return
  const follow = fs.readJsonSync(biliPath)
  let obj = Object.assign(follow, {})
  obj[roomId] = {
    "name": name,
    "roomId": roomId,
    "urlId": roomId
  }
  fs.writeJsonSync(biliPath, obj)
  return true
}

const helpMeDD = (qq, name) => {
  if (!name || !qq) return
  const qqfollow = fs.readJsonSync(qqPath)
  let followList = [name]
  if (name.indexOf(',')) {
    followList = name.split(',')
  }
  let arr = Object.assign(qqfollow, {})
  let list = []
  let youMsg = []
  arr.forEach(element => {
    if (element.id === qq) {
      youMsg = element
      followList.forEach(row => {
        if (!element.follow.includes(row))
          element.follow = element.follow + ',' + row
      })
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
  if (!str.roomId) return ''
  const arr = fs.readJsonSync(qqPath)
  let atList = ''
  arr.forEach(row => {
    row.follow.split(',').forEach(e => {
      if (str.roomId.includes(e)) {
        atList += CQ.at(row.roomId) + '\n'
      }
    })
  })
  return atList
}

const checkVtb = (type, str) => {
  let path = biliPath
  if (type === 'you') path = ytbPath
  const object = fs.readJsonSync(path)
  let arr = []
  for (const key in object) {
    if (object.hasOwnProperty(key)) {
      const element = object[key]
      if (str) {
        arr.push({
          name: element.name,
          id: element.roomId
        })
      } else {
        arr.push(`\n${element.name}`)
      }
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
