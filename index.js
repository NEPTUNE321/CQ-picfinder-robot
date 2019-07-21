require = require("esm")(module);
module.exports = require("./main");

const express = require('express');
const app = express();
const ddHelper = require('./modules/plugin/ddHelper').default
//设置路由
app.get('/get-vtb-list', function (req, res) {
  const arr = ddHelper.checkVtb(req.query.type || 'bilibili', 'str')
  res.send(arr);
});

app.get('/follow-dd', function (req, res) {
  if (!req.query.qq) {
    res.send('请输入QQ号');
    return
  }
  const follow = decodeURIComponent(req.query.follow)
  const ddMsg = ddHelper.helpMeDD(req.query.qq, follow)
  res.send(ddMsg);
});

app.get('/add-dd-list', function (req, res) {
  if (!req.query.roomId) {
    res.send('请输入房间号');
    return
  }
  const name = decodeURIComponent(req.query.roomName)
  let ddMsg = '收录失败'
  if (ddHelper.addDDlist(req.query.roomId, name)) {
    ddMsg = '收录' + name + '成功\n当前收录vtb' + ddHelper.checkVtb()
  }
  res.send(ddMsg);
});

//设置端口
const server = app.listen(3000, function () {
  const host = server.address().address;
  const port = server.address().port;
  console.log('Example app listening at http://%s:%s', host, port);
});
