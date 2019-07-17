require = require("esm")(module);
module.exports = require("./main");

const express = require('express');
const app = express();
const ddHelper = require('./modules/plugin/ddHelper')
console.log(ddHelper)
//设置路由
app.get('/get-vtb-list', function (req, res) {
  const reg = new RegExp("\n", "g");
  const arr = ddHelper.checkVtb().replace(reg, "").split(',')
  res.send(arr);
});

//设置端口
const server = app.listen(3000, function () {
  const host = server.address().address;
  const port = server.address().port;
  console.log('Example app listening at http://%s:%s', host, port);
});
