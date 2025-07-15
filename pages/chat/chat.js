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
    showSendBtn: false,
    showCloseBtn: false,
    group_id: 0,
    user_id: '',
    online: 0,
    addr: '',
    inputValue: '',
    chatData: [],
  },
  // 获取input值
  onClearInput(e) {
    if (e.currentTarget.dataset.value != "") {
      const data = {detail: {value: ""}};
      
      this.getVal(data);
    }
  },
  getVal(e) {
    console.log(e);
    if (e.detail.value!="") {
      this.setData({ 
        showSendBtn: true,
        showCloseBtn: true,
        inputValue: e.detail.value,
      })
    } else {
      this.setData({ 
        showSendBtn: false,
        showCloseBtn: false,
        inputValue: e.detail.value,
      })
    }
  },
  // 初始化websocket
  initWss() {
    wx.showLoading({
      title: '连接中...',
    });
    const socket = wx.connectSocket({
      url: 'wss://ai.anythingai.online/basket-group/ws',
      timeout: 10000,
    });
    this.data.socket = socket;
    let that = this;
    socket.onOpen(() => {
      console.log('连接成功');
      wx.hideLoading();
      const initMsg = {
        group_id: that.data.group_id,
        content: '',
        time: that.getCurrentTime(),
        user_id: that.data.user_id,
      };
      socket.send({ data: JSON.stringify(initMsg)});
    })
    socket.onClose(() => {
      console.log('WebSocket 已关闭')
    });
    socket.onError((err) => {
      console.error('WebSocket 错误:', err)
      Notify({ type: 'danger', message: '服务器无法连接', duration: 0 })
      wx.hideLoading();
    });
    socket.onMessage((res) => {
      const msg = JSON.parse(res.data);
      console.log(msg);
      if (msg.content == "") {
        this.setData({
          online: msg.user_count,
        })
      } else {
        this.setData({
          chatData: [...this.data.chatData, msg],
        })
      }
    });
  },
  getCurrentTime() {
    const now = new Date()
    const time = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')} ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}:${String(now.getSeconds()).padStart(2,'0')}`
    return time
  },
  // 发送信息
  sendMsg() {
    const content = this.data.inputValue;
    const initMsg = {
      group_id: this.data.group_id,
      content: content,
      time: this.getCurrentTime(),
      user_id: this.data.user_id,
    };
    this.data.socket.send({ data: JSON.stringify(initMsg)});
  },
  setNavigatInfo() {
    wx.setNavigationBarColor({
      frontColor: "#ffffff",
      backgroundColor: "#7354af",
    });
    wx.setNavigationBarTitle({
      title: '🏀 球行者',
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
    // wx.showLoading({
    //   title: '加载数据中',
    // });
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
    if (this.data.socket) {
      this.data.socket.close();
      console.log('已关闭连接');
    }
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