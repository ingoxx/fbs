// pages/chat/chat.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    chatData: [
      {'id': 1, 'content': '大哥大哥大哥大哥', 'userType': 1, 'time': '2025-07-09 19:22:20', 'name': 'me'},
      {'id': 1, 'content': '大哥2', 'userType': 2, 'time': '2025-07-09 19:22:20', 'name': 'james'},
      {'id': 1, 'content': '大哥1', 'userType': 2, 'time': '2025-07-09 19:22:20', 'name': 'kim'},
    ],
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
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.setNavigatInfo();
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