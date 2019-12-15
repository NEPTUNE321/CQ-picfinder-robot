const {
  rsshub
} = require('../../credentials');
const fs = require('fs');
const path = require('path');
const db = require('../db');
const rsslist = require('../../db/bilibili-video.json');
const rp = require('request-promise');
const Parser = require('rss-parser');
const dayjs = require('dayjs');
const _ = require('lodash');
const cheerio = require('cheerio');
const download = require('download');
const del = require('del');
const fileType = require('file-type');
const mkdirTmp = require('../mkdirTmp');
const logger = require('../logger');

function sub (config, send) {
  rp.get(`${rsshub}${config.url}`, {
    transform: async function (body, response, resolveWithFullResponse) {
      if (response.headers['content-type'] === 'application/xml; charset=utf-8') {
        const parser = new Parser();
        const feed = await parser.parseString(body);
        return feed;
      } else {
        return body;
      }
    }
  }).then(async feed => {
    const oldFeed = db.get(`rss["${config.name}"]`).value();
    if (!oldFeed) { // 如果不存在说明是第一次请求
      console.log(feed)
      logger.info('rss：首次请求 ==> ' + config.name);
      db.set(`rss["${config.name}"]`, feed.items).write();
      return false;
    }

    let items = _.chain(feed.items).differenceBy(oldFeed, 'guid').value();

    if (items.length) {
      logger.info(`rss：发现 ${items.length} 条更新 ==> ` + config.name);
      db.set(`rss["${config.name}"]`, feed.items).write();
    } else {
      return false;
    }

    items.forEach(async item => {
      // 移除图片前后的换行，以免出现发送文字时格式问题
      const content = item.content.replace(/<br><video.+?><\/video>|<br><img.+?>/g, e => {
        return e.replace(/<br>/, '');
      })

      const images = new Array();

      const $ = cheerio.load(content.replace(/<br\/?>/g, '\n'));
      // 获取媒体资源
      if ($('img').length) {
        let imgs = new Array();
        $('img').each(function () {
          const src = $(this).attr('src');
          if (src) imgs.push(src);
        })

        try {
          let fileDataArr = await Promise.all(imgs.map(e => {
            return download(e, {
              proxy: config.proxy ? 'http://127.0.0.1:1080' : false
            })
          }))
          fileDataArr.forEach(fileData => {
            mkdirTmp();
            const imgType = fileType(fileData).ext;
            const imgPath = path.join(__dirname, `../tmp/${Math.random().toString(36).substr(2)}.${imgType}`);
            fs.writeFileSync(imgPath, fileData);
            images.push(imgPath);
          })
        } catch (error) {
          logger.error(`rss：图片下载失败 ==> ${config.name} ==> ${err.message || JSON.stringify(err)}`);
        }
      }
      const cqimgpath = images.map(imgPath => {
        return `[CQ:image,file=file:///${imgPath}]`
      })

      const message = `【${feed.title}】更新了！\n` +
        '----------------------\n' +
        `标题：${item.title}\n` +
        `内容：${cqimgpath.length ? `\n${cqimgpath.join('')}\n` : ''}` +
        '----------------------\n' +
        `原链接：${item.link}\n` +
        `日期：${dayjs(item.pubDate).format('M月D日HH:mm:ss')}`;
      let arr = config.group
      let type = 'group'
      if (config.member) {
        arr = config.member
        type = 'member'
      }
      Promise.all(arr.map(id => send(message, id, type))).then(() => {
        logger.info('rss：发送成功 ==> ' + item.link);
        images.forEach(path => {
          del(path).catch(logger.error);
        })
      }).catch(err => {
        logger.error(`rss：发送失败 ==> ${item.link} ==> ${err.message || JSON.stringify(err)}`);
        images.forEach(path => {
          del(path).catch(logger.error);
        })
      });
    });
  }).catch(err => logger.error(`rss：请求RSSHUB失败 ==> ${config.name} ==> ${err.message || JSON.stringify(err)}`))
}

module.exports = function (send) {
  function start () {
    logger.info('rss：开始执行任务');
    Object.keys(rsslist).forEach((c, i) => {
      rsslist[c].name = c;
      setTimeout(() => {
        logger.info('rss：开始抓取：' + rsslist[c].name);
        sub(rsslist[c], send)
      }, 1000 * 10 * i);
    })
  }
  start();
  setInterval(start, 1000 * 60 * 5);
}