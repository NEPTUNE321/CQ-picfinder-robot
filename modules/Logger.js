/*
 * @Author: JindaiKirin 
 * @Date: 2018-07-23 10:54:03 
 * @Last Modified by: mikey.zhaopeng
 * @Last Modified time: 2020-01-19 11:32:10
 */

import Fs from 'fs';
import Path from 'path';

const banListFile = Path.resolve(__dirname, '../data/ban.json');

if (!Fs.existsSync(banListFile)) Fs.writeFileSync(banListFile, JSON.stringify({
  u: [],
  g: []
}));

let banList = require(banListFile);

function updateBanListFile () {
  Fs.writeFileSync(banListFile, JSON.stringify(banList));
}

/**
 * 各种记录
 *
 * @class Logger
 */
class Logger {
  constructor() {
    this.searchMode = []; //搜图模式
    this.repeater = []; //复读
    this.repeatLog = []; //复读消息记录
    this.searchCount = []; //搜索次数记录
    this.hsaSign = []; //每日签到
    this.date = new Date().getDate();
    this.adminSigned = false; //自动帮自己签到的标志

    setInterval(() => {
      //每日初始化
      let nowDate = new Date().getDate();
      if (this.date != nowDate) {
        this.date = nowDate;
        this.repeatLog = [];
        this.searchCount = [];
        this.hsaSign = [];
        this.adminSigned = false;
      }
    }, 60 * 1000);
  }

  static ban (type, id) {
    if (type == 'u') banList.u.push(id);
    else if (type == 'g') banList.g.push(id);
    updateBanListFile();
  }

  static checkBan (u, g = 0) {
    if (banList.u.includes(u)) return true;
    if (g != 0 && banList.g.includes(g)) return true;
    return false;
  }

	/**
	 * 管理员是否可以签到（用于自动签到）
	 *
	 * @returns 可以或不可以
	 * @memberof Logger
	 */
  canAdminSign () {
    if (this.adminSigned) return false;
    this.adminSigned = true;
    return true;
  }

	/**
	 * 搜图模式开关
	 *
	 * @param {number} g 群号
	 * @param {number} u QQ号
	 * @param {boolean} s 开启为true，关闭为false
	 * @param {Function} cb 定时关闭搜图模式的回调函数
	 * @returns 已经开启或已经关闭为false，否则为true
	 * @memberof Logger
	 */
  smSwitch (g, u, s, cb = null) {
    if (!this.searchMode[g]) this.searchMode[g] = [];
    if (!this.searchMode[g][u]) this.searchMode[g][u] = {
      enable: false,
      db: 999,
      timeout: null
    };
    let t = this.searchMode[g][u];
    //清除定时
    if (t.timeout) {
      clearTimeout(t.timeout);
      t.timeout = null;
    }
    //搜图模式切换
    if (s) {
      //定时关闭搜图模式
      if (g != 0) t.timeout = setTimeout(() => {
        t.enable = false;
        if (typeof cb == "function") cb();
      }, 60 * 1000);
      if (t.enable) return false;
      t.enable = true;
      t.db = 999;
      return true;
    } else {
      if (t.enable) {
        t.enable = false;
        return true;
      }
      return false;
    }
  }

	/**
	 * 设置搜图图库
	 *
	 * @param {number} g 群号
	 * @param {number} u QQ号
	 * @param {number} db 图库ID
	 * @memberof Logger
	 */
  smSetDB (g, u, db) {
    this.searchMode[g][u].db = db;
  }

	/**
	 * 获取搜图模式状态
	 *
	 * @param {number} g 群号
	 * @param {number} u QQ号
	 * @returns 未开启返回false，否则返回图库ID
	 * @memberof Logger
	 */
  smStatus (g, u) {
    if (!this.searchMode[g] || !this.searchMode[g][u] || !this.searchMode[g][u].enable) return false;
    return this.searchMode[g][u].db;
  }

	/**
	 * 记录复读情况
	 *
	 * @param {number} g 群号
	 * @param {number} u QQ号
	 * @param {string} msg 消息
	 * @returns 如果已经复读则返回0，否则返回当前复读次数
	 * @memberof Logger
	 */
  rptLog (g, u, msg) {
    let t = this.repeater[g];
    //没有记录或另起复读则新建记录
    if (!t || t.msg != msg) {
      this.repeater[g] = {
        user: u,
        msg: msg,
        times: 1,
        done: false
      };
      t = this.repeater[g];
    } else if (t.user != u) {
      //不同人复读则次数加1
      t.user = u;
      t.times++;
    }
    return t.done ? 0 : t.times;
  }

	/**
	 * 记录每日复读情况
	 *
	 * @param {number} g 群号
	 * @param {number} u QQ号
	 * @returns 返回今日的复读情况
	 * @memberof Logger
	 */
  rptMsgLog (g, u) {
    if (!g && !u) return this.repeatLog
    let t = this.repeatLog[g]
    if (!u) return t
    //没有记录或另起复读则新建记录
    let arr = []
    let data = {
      user_id: u,
      time: 1
    }
    if (!t || t.length === 0) {
      t = []
      t.push(data)
    } else {
      t.forEach(element => {
        if (element.user_id === u) element.time++
        arr.push(element.user_id)
      })
      if (!arr.includes(u)) t.push(data)
    }
    console.log(t)
    this.repeatLog[g] = t
    return t
  }

	/**
	 * 标记该群已复读
	 *
	 * @param {number} g 群号
	 * @memberof Logger
	 */
  rptDone (g) {
    this.repeater[g].done = true;
  }

	/**
	 * 记录并判断用户是否可以搜图
	 *
	 * @param {number} u QQ号
	 * @param {*} limit 限制
	 * @returns 允许搜图则返回true，否则返回false
	 * @memberof Logger
	 */
  canSearch (u, limit, key = 'search') {
    if (!this.searchCount[u]) this.searchCount[u] = {};

    if (key == 'setu') {
      if (!this.searchCount[u][key]) this.searchCount[u][key] = {
        date: new Date().getTime() - limit.cd * 1000,
        count: 0
      };
      let setuLog = this.searchCount[u][key];
      if (setuLog.date + limit.cd * 1000 <= new Date().getTime() && limit.value == 0) return true;
      if (setuLog.date + limit.cd * 1000 > new Date().getTime() || setuLog.count++ >= limit.value) return false;
      setuLog.date = new Date().getTime();
      return true;
    }

    if (limit == 0) return true;
    if (!this.searchCount[u][key]) this.searchCount[u][key] = 0;
    if (this.searchCount[u][key]++ < limit) return true;
    return false;
  }

	/**
	 * 用户是否可以签到
	 *
	 * @param {number} u QQ号
	 * @returns 可以则返回true，已经签到过则返回false
	 * @memberof Logger
	 */
  canSign (u) {
    if (this.hsaSign.includes(u)) return false;
    this.hsaSign.push(u);
    return true;
  }
}

export default Logger;
