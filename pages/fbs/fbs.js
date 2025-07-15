// pages/fbs/fbs.js
// import QQMapWX from '../../libs/qqmap-wx-jssdk.js'
var QQMapWX = require('../../lib/qqmap-wx-jssdk.js');
import Toast from '@vant/weapp/toast/toast';
var qqmapsdk;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    city: '未知',
    addVillage: false,
    showCloseBtn: false,
    villageInfo: '',
    lat: 0,
    lng: 0,
    inputValue: "",
    currentSquareSelected: 1,
    basketSquareFilter: [
      {'id': 1, 'icon': 'map-marked','name': '所有', 'customize': 2},
      {'id': 2, 'icon': 'location','name': '距离最近', 'customize': 2},
      {'id': 3, 'icon': 'wap-home','name': '城中村', 'customize': 2},
      {'id': 4, 'icon': 'fire','name': '公园', 'customize': 2},
      {'id': 5, 'icon': 'add-square','name': '添加村/公园', 'customize': 1},
    ],
    basketSquareFilterData: [],
    basketSquareData: [
      {
        'id': 1, 
        'addr': '深圳市观澜田背一村',
        'img': 'https://mp-578c2584-f82c-45e7-9d53-51332c711501.cdn.bspapp.com/wx-fbs/bk2.svg', 
        'distance': 0, 
        'online': 0, 
        'basketType': '城中村',
        'tags': ['城中村','室外','有棚顶']
      },
      {
        'id': 2, 
        'addr': '深圳市观澜大水坑村',
        'img': 'https://mp-578c2584-f82c-45e7-9d53-51332c711501.cdn.bspapp.com/wx-fbs/bk3.svg', 
        'distance': 0, 
        'online': 0, 
        'basketType': '城中村',
        'tags': ['城中村','室外']
      },
      {
        'id': 3, 
        'addr': '深圳市福田香蜜湖篮球公园',
        'img': 'https://mp-578c2584-f82c-45e7-9d53-51332c711501.cdn.bspapp.com/wx-fbs/bk3.svg', 
        'distance': 0, 
        'online': 10, 
        'basketType': '公园',
        'tags': ['公园','室外']
      },
      {
        'id': 4, 
        'addr': '深圳市龙华区竹村',
        'img': 'https://mp-578c2584-f82c-45e7-9d53-51332c711501.cdn.bspapp.com/wx-fbs/bk3.svg', 
        'distance': 0, 
        'online': 0, 
        'basketType': '城中村',
        'tags': ['城中村','室外']
      },
    ]
  },
  // 自定义逻辑
  onChange(e) {
    const value = e.detail;
    this.setData({villageInfo: value});
  },
  onConfirm() {
    console.log('提交的值:', this.data.villageInfo);
    // 在这里写你的提交逻辑
    const val = this.data.villageInfo;
    if (val == "") {
      Toast.fail("不能输入空值");
      return;
    }
    
    Toast.success({
      type: 'success',
      message: "后台审核后会更新到页面上",
      duration: 6000,
    });
  },
  getUserInfo(event) {
    console.log(event.detail);
  },
  onClose() {
    this.setData({ addVillage: false });
  },
  onClearInput(e) {
    if (e.currentTarget.dataset.value != "") {
      const data = {detail: {value: ""}};
      this.getVal(data);
    }
  },
  // 获取input值
  getVal(e) {
    if (e.detail.value == "") {
      this.setData({
        inputValue: e.detail.value,
        showCloseBtn: false,
      });
    } else {
      this.setData({
        inputValue: e.detail.value,
        showCloseBtn: true,
      });
    }
    
    var fd = this.data.basketSquareData.filter(item => item.addr.includes(e.detail.value));
    this.setData({
      basketSquareFilterData: fd,
    });
},
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
    if (this.data.inputValue == "") {
      const id =  e.currentTarget.dataset.id;
      this.setData({
        currentSquareSelected: id
      });
      this.filterBasketSquare(id);
    } else {
      this.setData({
        currentSquareSelected: 1008618,
      });
    }
  },
  filterBasketSquare(id) {
    var name = this.data.basketSquareFilter.find(item => item.id == id);
    if (name.name == "所有") {
      this.setData({
        basketSquareFilterData: this.data.basketSquareData,
      });
      return;
    } else if (name.name == "距离最近") {
      const newList = this.data.basketSquareFilterData.sort((a, b) => a.distance - b.distance);
      this.setData({
        basketSquareFilterData: newList,
      });
      return;
    } else if (name.customize == 1) {
      this.setData({ addVillage: true})
      return;
    }
    var fd = this.data.basketSquareData.filter(item => item.tags.includes(name.name));
    this.setData({
      basketSquareFilterData: fd,
    });
  },
  nogetUserLocation() {
    const qqmapsdk = new QQMapWX({
      key: 'YSRBZ-GSVY3-3P23L-RNWCE-OQB3V-T6BXG'
    })
    wx.getLocation({
      type: 'gcj02',
      isHighAccuracy: true,
      altitude: true,
      success: res => {
        console.log('当前位置坐标：', res)
        this.setData({
          lat: res.latitude,
          lng: res.longitude,
        });
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
  getUserLocation() {
    const qqmapsdk = new QQMapWX({
      key: 'YSRBZ-GSVY3-3P23L-RNWCE-OQB3V-T6BXG'
    });
    return new Promise((resolve, reject) => {
      wx.getLocation({
        type: 'gcj02',
        isHighAccuracy: true,
        altitude: true,
        success: res => {
          this.setData({
            lat: res.latitude,
            lng: res.longitude,
          })
          qqmapsdk.reverseGeocoder({
            location: {
              latitude: res.latitude,
              longitude: res.longitude
            },
            success: geoRes => {
              const city = geoRes.result.address
              this.setData({
                city: city
              })
              // 把需要的结果一起 resolve 出去
              resolve({
                latitude: res.latitude,
                longitude: res.longitude,
                city: city,
              })
            },
            fail: geoErr => {
              console.log('逆地址解析失败：', geoErr)
              reject(geoErr)
            }
          })
        },
        fail: locErr => {
          console.log('定位失败：', locErr)
          reject(locErr)
        }
      })
    })
  },
  async getAddrDistance() {
    const resp = await this.getUserLocation();
    if (resp.latitude !== "" && resp.longitude !== "" && resp.city !== "") {
      const newList = this.data.basketSquareData;
      // 等待所有异步任务都完成
      const updatedList = await Promise.all(
        newList.map(async (item) => {
          const res = await this.getSearchLocation(item.addr);
          item.distance = res/1000;
          item.distance = item.distance.toFixed(1);
          return item;
        })
      );
      this.setData({
        basketSquareFilterData: updatedList,
      });
    } else {
      console.log("获取距离失败");
    }
  },
  async getSearchLocation(addr) {
    const resp = await this.txMapSearchAddrApi(addr);
    if (resp.distance > 0) {
      return resp.distance;
    } else {
      return 0;
    }
  },
  // 腾讯地图的关键字api
  txMapSearchAddrApi(addr) {
    let that = this;
    return new Promise((resolve, reject) => {
      wx.request({
        url: `https://apis.map.qq.com/ws/place/v1/suggestion`,
        data: {
          key: 'YSRBZ-GSVY3-3P23L-RNWCE-OQB3V-T6BXG',
          keyword: addr,
          region: that.data.city,
        },
        success(res) {
          if (res.data.status === 0 && res.data.data.length > 0) {
            const location = res.data.data[0].location;
            const lat = location.lat;
            const lng = location.lng;
            const dis = that.getDistance(that.data.lat, that.data.lng, lat, lng);
            // 把需要的结果用 resolve 返回
            resolve({
              distance: dis,
            });
          } else {
            console.log('没有找到匹配地址');
            reject(new Error('没有找到匹配地址'));
          }
        },
        fail(err) {
          console.error('请求失败', err);
          reject(err);
        }
      });
    });
  },
  getDistance(lat1, lng1, lat2, lng2) {
    const rad = Math.PI / 180;
    const radLat1 = lat1 * rad;
    const radLat2 = lat2 * rad;
    const a = radLat1 - radLat2;
    const b = (lng1 - lng2) * rad;
    let s = 2 * Math.asin(Math.sqrt(
      Math.pow(Math.sin(a/2), 2) +
      Math.cos(radLat1) * Math.cos(radLat2) * Math.pow(Math.sin(b/2), 2)
    ))
    s = s * 6371.0; // 地球半径，单位 km
    s = s * 1000;   // 米
    return Math.floor(s);
  },
  // 设置当前页的标题
  setNavigatInfo() {
    wx.setNavigationBarColor({
      frontColor: "#ffffff",
      backgroundColor: "#6a72d9",
    });
    wx.setNavigationBarTitle({
      title: '🏀 球行者',
    });
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.setNavigatInfo();
    // this.getBasketSquareData();
    this.getAddrDistance();
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
    console.log('下拉了');
    wx.stopPullDownRefresh();
    Toast.loading({
      message: '重新定位中...',
      forbidClick: true,
      duration: 3000,
    });
    // setTimeout(() => {
    //   wx.stopPullDownRefresh();
    // }, 3000)
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {
    console.log('触底了');
    Toast.loading({
      message: '拉取数据中...',
      forbidClick: true,
      duration: 3000,
    });
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  }
})