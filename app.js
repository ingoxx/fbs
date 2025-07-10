// app.js
App({
  login() {
    return new Promise((resolve, reject) => {
      wx.login({
        success: (res) => {
            wx.request({
            url: 'https://api.anythingai.online/wx-login',
            method: 'POST',
            data: {
              code: res.code
            },
            success: function (resp) {
              if (resp.data.errcode) {
                return;
              }
              resolve(resp);
            },
            fail: function (err) {
              console.log("wxlogin esg >>> ", err);
              reject(err);
            }
          })
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
    // this.login().then(resp => {
    //   this.globalData.openid = resp.data.openid;
    //   console.log("wx login openid >>> ", this.globalData.openid);
    // }).catch(err => {
    //   console.log("wx login faid >>> ", err);
    // });
  },
  globalData: {
    openid: null
  }
})
