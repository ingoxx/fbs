// pages/chat/chat.js
const app = getApp();
const { BASE_URL } = require('../../utils/http');
const { WSS_URL } = require('../../utils/http');
import Notify from '@vant/weapp/notify/notify';
// const md5 = require('../../utils/md5');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    uploadBtn: false,
    fileList: [],
    bkUrl: '',
    tryConNum: 0,
    notice: "本小程序不会长期保留聊天信息，系统会自动定期清理。",
    openid_key: 'openid',
    socket: null,
    showSendBtn: false,
    showCloseBtn: false,
    connectText: "连接中...",
    toView: '',
    group_id: 0,
    user_id: '',
    nick_name: '',
    sender_id: '',
    sender_id: '',
    online: 0,
    addr: '',
    lat: 0,
    lng: 0,
    tag: '',
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
  initWss(options) {
    wx.showLoading({
      title: this.data.connectText,
    });
    const socket = wx.connectSocket({
      url: `${WSS_URL}/ws?uid=${this.data.user_id}`,
      timeout: 10000,
    });
    this.data.socket = socket;
    socket.onOpen(() => {
      console.log('连接成功');
      wx.hideLoading();
      const initMsg = {
        group_id: options.id,
        content: '',
        time: this.getCurrentTime(),
        user_id: options.user_id,
        sender_id: options.sender_id,
        nick_name: options.nick_name,
      };
      socket.send({ data: JSON.stringify(initMsg)});
    })
    socket.onClose(() => {
      console.log('WebSocket 已关闭');
      wx.hideLoading();
    });
    socket.onError((err) => {
      console.error('WebSocket 错误:', err)
      Notify({ type: 'danger', message: '服务器无法连接', duration: 10000 });
      wx.hideLoading();
    });
    socket.onMessage((res) => {
      const msg = JSON.parse(res.data);
      if (msg.content == "") {
        this.setData({
          online: msg.user_count,
        })
      } else {
        const newChatData = this.data.chatData.concat(msg);
        this.setData({
          chatData: newChatData,
          toView: `chat-${newChatData.length - 1}` // 自动滚到最后一条
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
      sender_id: this.data.sender_id,
      content: content,
      time: this.getCurrentTime(),
      user_id: this.data.user_id,
      nick_name: this.data.nick_name,
    };
    this.data.socket.send({ data: JSON.stringify(initMsg)});
    const data = {detail: {value: ""}};
    this.getVal(data);
  },
  setNavigatInfo() {
    wx.setNavigationBarColor({
      frontColor: "#ffffff",
      backgroundColor: "#7354af",
    });
    wx.setNavigationBarTitle({
      title: app.globalData.title,
    });
  },
  login() {
    return new Promise((resolve, reject) => {
      wx.login({
        timeout: 10000,
        success: (res) => {
            wx.request({
            url: `${BASE_URL}/wx-login`,
            method: 'POST',
            timeout: 10000,
            data: {
              code: res.code
            },
            success: function (resp) {
              if (resp.data.code && resp.data.code != 1000) {
                Notify({ type: 'danger', message: '微信登陆状态异常', duration: 10000 });
                return;
              }
              resolve(resp);
            },
            fail: function (err) {
              Notify({ type: 'danger', message: '微信登陆接口请求异常', duration: 10000 });
              reject(err);
            },
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
    const resp  = await this.login();
    if (resp.data && resp.data.data != "") {
      wx.setStorage({
        key: 'openid',
        data: "user_"+resp.data.data,
      });
      this.setData({
        user_id: "user_"+resp.data.data,
      })
    }
  },
  openMapApp() {
    wx.openLocation({
      latitude: Number(this.data.lat),  // 纬度
      longitude: Number(this.data.lng), // 经度
      address: this.data.addr+this.data.tag, // 地址（可选）
      scale: 18,
      success(res) {
        console.log('打开成功');
      },
      fail(err) {
        console.log('打开失败', err);
      }
    });
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
      lat: options.lat,
      lng: options.lng,
      user_id: options.user_id,
      sender_id: options.sender_id,
      bkUrl: options.img,
      tag: options.tag,
      nick_name: options.nick_name,
    });
    this.initWss(options);
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