// pages/fbs/fbs.js
// import QQMapWX from '../../libs/qqmap-wx-jssdk.js'
var QQMapWX = require('../../lib/qqmap-wx-jssdk.js');
var qqmapsdk;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    city: '未知',
    currentSquareSelected: 1,
    basketSquareFilter: [
      {'id': 1, 'icon': 'map-marked','name': '所有'},
      {'id': 2, 'icon': 'location','name': '距离最近'},
      {'id': 3, 'icon': 'wap-home','name': '城中村'},
      {'id': 4, 'icon': 'fire','name': '公园'},
    ],
    basketSquareFilterData: [],
    basketSquareData: [
      {
        'id': 1, 
        'addr': '深圳市观澜田背一村',
        'img': 'https://mp-578c2584-f82c-45e7-9d53-51332c711501.cdn.bspapp.com/wx-fbs/bk2.svg', 
        'distance': 600, 
        'online': 8, 
        'basketType': '城中村',
        'tags': ['城中村','室外','有棚顶']
      },
      {
        'id': 2, 
        'addr': '深圳市观澜大水坑村',
        'img': 'https://mp-578c2584-f82c-45e7-9d53-51332c711501.cdn.bspapp.com/wx-fbs/bk3.svg', 
        'distance': 1200, 
        'online': 16, 
        'basketType': '城中村',
        'tags': ['城中村','室外']
      },
      {
        'id': 3, 
        'addr': '深圳市福田香蜜湖篮球公园',
        'img': 'https://mp-578c2584-f82c-45e7-9d53-51332c711501.cdn.bspapp.com/wx-fbs/bk3.svg', 
        'distance': 1200, 
        'online': 100, 
        'basketType': '公园',
        'tags': ['公园','室外']
      }
    ]
  },
  // 自定义逻辑
  chatRoot(e) {
    const id = e.currentTarget.dataset.item;
    wx.navigateTo({
      url: `/pages/chat/chat?id=${id.id}&addr=${id.addr}`,
    });
  },
  getBasketSquareData() {
    this.setData({
      basketSquareFilterData: this.data.basketSquareData,
    });
  },
  onSelected(e) {
    const id =  e.currentTarget.dataset.id;
    this.setData({
      currentSquareSelected: id
    });
    this.filterBasketSquare(id);
  },
  filterBasketSquare(id) {
    var name = this.data.basketSquareFilter.find(item => item.id == id);
    if (name.name == "所有" || name.name == "距离最近") {
      this.setData({
        basketSquareFilterData: this.data.basketSquareData,
      });
      return;
    }
    var fd = this.data.basketSquareData.filter(item => item.tags.includes(name.name));
    this.setData({
      basketSquareFilterData: fd,
    });
  },
  getUserLocation() {
    const qqmapsdk = new QQMapWX({
      key: 'YSRBZ-GSVY3-3P23L-RNWCE-OQB3V-T6BXG'
    })
    wx.getLocation({
      type: 'gcj02',
      isHighAccuracy: true,
      altitude: true,
      success: res => {
        console.log('当前位置坐标：', res)
        qqmapsdk.reverseGeocoder({
          location: {
            latitude: res.latitude,
            longitude: res.longitude
          },
          success: res => {
            console.log('逆地址解析结果：', res)
            const city = res.result.address;
            this.setData({
              city: city
            })
          },
          fail: err => {
            console.log('逆地址解析失败：', err)
          }
        })
      }
    })
  },
// 设置当前页的标题
setNavigatInfo() {
  wx.setNavigationBarColor({
    frontColor: "#ffffff",
    backgroundColor: "#6a72d9",
  });
  wx.setNavigationBarTitle({
    title: '🏀 篮球场集合',
  });
},
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.setNavigatInfo();
    this.getBasketSquareData();
    this.getUserLocation();
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