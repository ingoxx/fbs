// app.js
import Notify from '@vant/weapp/notify/notify';
const { BASE_URL } = require('./utils/http');
App({
  login() {
    return new Promise((resolve, reject) => {
      wx.login({
        success: (res) => {
            wx.request({
            url: `${BASE_URL}/wx-login`,
            method: 'POST',
            data: {
              code: res.code
            },
            success: function (resp) {
              if (resp.data.errcode) {
                Notify({type: 'danger', message: '请检查微信登陆状态', duration: 20000})
                return;
              }
              resolve(resp);
            },
            fail: function (err) {
              Notify({type: 'danger', message: '请检查微信登陆状态', duration: 20000})
              reject(err);
            }
          })
        },
        fail: (err) => {
          Notify({type: 'danger', message: '请检查微信登陆状态', duration: 20000})
          console.log("wxlogin failed esg >>> ", err);
        },
      })
    });
  },
  onLaunch() {
    // 展示本地存储能力
    // const logs = wx.getStorageSync('logs') || []
    // logs.unshift(Date.now())
    // wx.setStorageSync('logs', logs)

    // // 登录
    // wx.login({
    //   success: res => {
    //     // 发送 res.code 到后台换取 openId, sessionKey, unionId
    //   }
    // })
    this.login().then(resp => {
      console.log("resp >>> ", resp);
      this.globalData.openid = resp.data.other_data.openid;
      this.globalData.img = resp.data.other_data.img;
      wx.setStorage({
        key: "openid",
        data: resp.data.openid,
      })
    }).catch(err => {
      console.log("wx login faid >>> ", err);
    });
  },
  globalData: {
    img: null,
    openid: null,
    title: "🏃 运动记录",
    admin: 'ogR3E62jXXJMbVcImRqMA1gTSegM',
  }
})
