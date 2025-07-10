// pages/chat/chat.js
// const app = getApp();
import Notify from '@vant/weapp/notify/notify';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    notice: "请文明发言，否则将被禁言",
    openid_key: 'openid',
    socket: null,
    group_id: 0,
    user_id: '',
    addr: '',
    inputValue: '',
    chatData: [
      // {'id': 1, 'content': '大哥大哥大哥大哥', 'user_type': 1, 'time': '2025-07-09 19:22:20', 'name': 'me'},
      // {'id': 2, 'content': '大哥2大哥大哥大哥大哥大哥大哥大哥大哥', 'user_type': 2, 'time': '2025-07-09 19:22:20', 'name': 'james'},
      // {'id': 3, 'content': '大哥1', 'user_type': 2, 'time': '2025-07-09 19:22:20', 'name': 'kim'},
      // {'id': 4, 'content': '大哥2', 'user_type': 2, 'time': '2025-07-09 19:22:20', 'name': 'kim1'},
      // {'id': 5, 'content': '大哥3', 'user_type': 2, 'time': '2025-07-09 19:22:20', 'name': 'kim2'},
      // {'id': 6, 'content': '大哥4', 'user_type': 2, 'time': '2025-07-09 19:22:20', 'name': 'kim3'},
      // {'id': 7, 'content': '大哥5', 'user_type': 2, 'time': '2025-07-09 19:22:20', 'name': 'kim4'},
    ],
  },
  // 获取input值
  getVal(e) {
    this.setData({
      inputValue: e.detail.value,
    });
  },
  // 初始化websocket
  initWss() {
    const socket = wx.connectSocket({
      url: 'wss://api.anythingai.online/basket-group/ws',
      timeout: 10000,
    })
    this.data.socket = socket;
    socket.onOpen(() => {
      console.log('连接成功') 
    })
    socket.onClose(() => {
      console.log('WebSocket 已关闭')
    });
    socket.onError((err) => {
      console.error('WebSocket 错误:', err)
      Notify('服务器无法连接');
    });
    socket.onMessage((res) => {
      const msg = JSON.parse(res.data);
      console.log(msg);
      // msg.isMe = msg.user_id === this.data.userID;
      this.setData({
        chatData: [...this.data.chatData, msg],
      })
    });
  },
  // 发送信息
  sendMsg() {
    const now = new Date()
    const time = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')} ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}:${String(now.getSeconds()).padStart(2,'0')}`
    const content = this.data.inputValue;
    const initMsg = {
      group_id: this.data.group_id,
      content: content,
      time: time,
      user_id: this.data.user_id,
    }
    this.data.socket.send({ data: JSON.stringify(initMsg)})
  },
  setNavigatInfo() {
    wx.setNavigationBarColor({
      frontColor: "#ffffff",
      backgroundColor: "#7354af",
    });
    wx.setNavigationBarTitle({
      title: '🏀 篮球群',
    });
  },
  login() {
    return new Promise((resolve, reject) => {
      wx.login({
        timeout: 10000,
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
            },
            complete: function (params) {
              wx.hideLoading();
            }
          })
        },
      })
    });
  },
  getOpenidFromCache() {
    let that = this;
    wx.getStorage({
      key: 'openid',
      success: function (res) {
        console.log("success >>> ", res);
        if (!res.data) {
          that.getOpenid();
        } else {
          that.setData({
            user_id: res.data,
          })
        }
      },
      fail: function (err) {
        console.log("err >>> ", err);
        that.getOpenid();
      },
    })
  },
  async getOpenid() {
    wx.showLoading({
      title: '加载数据中',
    });
    const resp  = await this.login();
    if (resp.data && resp.data.openid != "") {
      console.log("resp >>> ", resp.data.openid);
      wx.setStorage({
        key: 'openid',
        data: "user_"+resp.data.openid,
      });
      this.setData({
        user_id: "user_"+resp.data.openid,
      })
    }
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.getOpenidFromCache();
    this.setNavigatInfo();
    this.setData({
      group_id: options.id,
      addr: options.addr,
    });
    this.initWss();
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  }
})