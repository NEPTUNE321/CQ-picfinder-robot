const fs = require('fs-extra')
const check = require('./common/check')
const jsonPath = './modules/plugin/ddHelper/runtime/last.json'

var newLiving = []

fs.writeJsonSync(jsonPath, [])

async function checkLiving() {
  let ups = fs.readJsonSync('./modules/plugin/ddHelper/json/following.json')
  let upId = Object.keys(ups)
  let promiseArr = upId.map(ele => check(ele))
  let data = await Promise.all(promiseArr)
  // 获取上次检测结果
  let lastResult = fs.readJsonSync(jsonPath)
  // 获取正在直播的up
  let living = data.filter(function(value) {
    return value.status
  })
  // 获取本次检测结果
  let newResult = living.map(function(value) {
    return value.id
  })
  // 写入本次结果
  fs.writeJsonSync(jsonPath, newResult)
  // 获取本次新开播up
  newLiving = living.filter(function(value) {
    return lastResult.indexOf(value.id) === -1
  })
  if (newLiving.length === 0) return false

  return newLiving
}

export default {
  checkLiving,
  newLiving
}
