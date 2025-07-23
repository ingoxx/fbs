// pages/fbs/fbs.js
// import QQMapWX from '../../libs/qqmap-wx-jssdk.js'
const app = getApp();
var QQMapWX = require('../../lib/qqmap-wx-jssdk.js');
import Notify from '@vant/weapp/notify/notify';
import Toast from '@vant/weapp/toast/toast';
const { generateUUID } = require('../../utils/util'); 
import Dialog from '@vant/weapp/dialog/dialog';
var PinYin = require('../../miniprogram_npm/tiny-pinyin/index.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isInput: true,
    showTxMap: false,
    isEmptyTwo: false,
    isEmpty: true,
    showCheckList: false,
    city: '未获取位置',
    addr : '未获取位置',
    cityPy: '',
    addVillage: false,
    showCloseBtn: false,
    villageInfo: '',
    useNotice: "下拉小程序以获取附近篮球场地址",
    notice: "本小程序旨在为篮球爱好者方便在陌生城市约球。您也可以添加当前篮球场位置以便大家约球，非常感谢您的使用，祝您身体健康，万事如意",
    lat: 0,
    lng: 0,
    inputValue: "",
    markers: [],
    currentSquareSelected: 2,
    basketSquareFilter: [
      {'id': 5, 'icon': 'comment','name': '审核', 'customize': 3, 'disable': false, 'isDisable': false, 'action': false},
      {'id': 6, 'icon': 'add-square','name': '添加村/公园', 'customize': 1, 'disable': true, 'isDisable': true, 'action': false},
    ],
    checkListData: [],
    basketSquareFilterData: [],
    basketSquareData: []
  },
  userAddAddrReqApi(data) {
    return new Promise((resolve, reject) => {
      wx.request({
        url: 'https://ai.anythingai.online/basket-group/user-add-square',
        method: 'POST',
        timeout: 10000,
        data: data,
        success: function (res) {
          resolve(res.data);
        },
        fail: function (err) {
          reject(err)
        }
      })
    })
  },
  refuseAddAddrApi() {},
  allowAddAddrApi() {},
  getCheckListApi() {
    return new Promise((resolve, reject) => {
      wx.request({
        url: `https://ai.anythingai.online/basket-group/check-list?uid=${app.globalData.openid}`,
        timeout: 10000,
        success: function (res) {
          resolve(res.data);
        },
        fail: function (err) {
          reject(err)
        }
      })
    })
  },
  async getCheckList() {
    const data = await this.getCheckListApi();
    if (data.code != 1000) {
      const msg = data.msg ? data.msg : "获取审核列表失败";
      Notify({ type: 'danger', message: msg, duration: 20000 });
      return;
    }
    this.setData({
      checkListData: data.data,
    })
  },
  getAllDataApi() {
    return new Promise((resolve, reject) => {
      wx.request({
        url: `https://ai.anythingai.online/basket-group/show-square?lat=${this.data.lat}&lng=${this.data.lng}&city=${this.data.city}&cityCn=${this.data.city}`,
        success: function (res) {
          if (res.statusCode != 200) {
            Notify({ type: 'danger', message: '加载数据失败', duration: 30000 });
            return;
          }
          resolve(res.data);
        },
        fail: function (err) {
          Notify({ type: 'danger', message: '加载数据失败', duration: 30000 });
          reject(err)
        }
      })
    })
  },
  async getBasketSquareFilter() {
    const newBsf = this.data.basketSquareFilter;
    const updatedBsf = await Promise.all(
      newBsf.map(async (item) => {
        const res = await app.login();
        if (item.customize == 3) {
          item.disable = res.data.openid == "ogR3E62jXXJMbVcImRqMA1gTSegM";
        } else {
          item.isDisable = false;
        }
        return item;
      })
    );
    this.setData({
      basketSquareFilter: updatedBsf,
    })
  },
  refuseAddAddrReqApi(id) {
    return new Promise((resolve, reject) => {
      wx.request({
        url: 'https://ai.anythingai.online/basket-group/add-square-refuse',
        method: "POST",
        timeout: 10000,
        data: JSON.stringify({id: id}),
        success: function (res) {
          if (res.statusCode != 200) {
            Toast.fail("请求接口失败");
          }
          resolve(res.data);
        },
        fail: function (err) {
          Toast.fail("请求接口失败");
          reject(err);
        }
      })
    })
  },
  passAddAddrReqApi(id) {
    return new Promise((resolve, reject) => {
      wx.request({
        url: `https://ai.anythingai.online/basket-group/add-square-pass?city=${this.data.city}`,
        method: "POST",
        timeout: 10000,
        data: JSON.stringify({id: id}),
        success: function (res) {
          if (res.statusCode != 200) {
            Toast.fail("请求接口失败");
          }
          resolve(res.data);
        },
        fail: function (err) {
          Toast.fail("请求接口失败");
          reject(err);
        }
      })
    })
  },
  // 在审核页面提交通过审核的添加地址请求
  async onAdd(e) {
    const addData = e.currentTarget.dataset.value;
    try {
      await Dialog.confirm({
        title: '确认添加',
        message: `确认添加 '${addData.addr}' 吗？`
      });
      const pdd = await this.passAddAddrReqApi(addData.id);
      if (pdd.code != 1000) {
        Toast.fail("添加失败");
        return;
      }
      this.setData({
        checkListData: pdd.data,
      });
      Toast.success("添加成功");
    } catch (err) {
      console.log('取消或失败:', err);
    }
  },
  // 在审核页面审核不通过的加地址请求将会删除
  async onDelete(e) {
    const delData = e.currentTarget.dataset.value;
    try {
      await Dialog.confirm({
        title: '确认删除',
        message: `确认删除 '${delData.addr}' 吗？`
      });
      const pdd = await this.refuseAddAddrReqApi(delData.id);
      if (pdd.code != 1000) {
        Toast.fail("删除失败");
        return;
      }
      this.setData({
        checkListData: pdd.data,
      });
      Toast.success("删除成功");
    } catch (err) {
      console.log('取消或失败:', err);
    }
  },
  // 获取每个群组的在线人数
  async getGroupUserCount(gid) {
    const resp = await this.getGroupUserCountApi(gid);
    return resp;
  },
  getGroupUserCountApi(gid) {
    return new Promise((resolve, reject) => {
      wx.request({
        url: `https://ai.anythingai.online/basket-group/get-online?gid=${gid}`,
        timeout: 10000,
        success: res => {
          // if (res.data.code !== 1000 || res.statusCode != 200) {
          //   console.log(res.data.msg);
          // }
          resolve(res.data.data);
        },
        fail: reject
      });
    });
  },
  onChange(e) {
    const value = e.detail;
    this.setData({villageInfo: value});
  },
  // 用户提交添加篮球场地址的请求
  async onConfirm() {
    const val = this.data.villageInfo;
    if (val == "") {
      Toast.fail("不能输入空值");
      return;
    }
    const respTx = await this.txMapSearchAddrApi(this.data.villageInfo);
    if (respTx.status != 1000) {
      Notify({type: 'danger', message: '输入的地址无效', duration: 30000});
      return;
    }
    const ad = {
      id: generateUUID(),
      user_id: app.globalData.openid,
      addr: this.data.villageInfo,
      lat: respTx.lat,
      lng: respTx.lng,
    }
   const resp = await this.userAddAddrReqApi(ad);
   if (resp.code != 1000) {
      const msg = resp.msg ? resp.msg : "添加地址失败, 请联系管理员";
      Notify({ type: 'danger', message: msg, duration: 20000 });
      return;
    }
    Notify({ type: 'success', message: "地址已提交,审核通过会更新到页面上", duration: 10000 });
  },
  getUserInfo(event) {
    console.log(event.detail);
  },
  onClose() {
    this.setData({ addVillage: false, showCheckList: false, });
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
      const newList = this.data.basketSquareData.sort((a, b) => a.distance - b.distance);
      this.setData({
        basketSquareFilterData: newList,
      });
      return;
    } else if (name.name == "添加村/公园") {
      this.setData({ addVillage: true})
      return;
    } else if (name.name == "审核") {
      this.getCheckList();
      this.setData({
        showCheckList: true,
      })
      return;
    } else if (name.name == "打开定位") {
      this.getAddrDistance();
      this.setData({
        showTxMap: true,
      })
      return;
    } 
    const fd = this.data.basketSquareData.filter(item => item.tags.includes(name.name));
    this.setData({
      basketSquareFilterData: fd,
    });
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
              const addr = geoRes.result.formatted_addresses.rough;
              const city = geoRes.result.address_component.city
              // const cityPy = PinYin.convertToPinyin(city, '', true);
              this.setData({
                addr: addr,
                city: city,
                cityPy: city,
              })
              // 把需要的结果一起 resolve 出去
              resolve({
                latitude: res.latitude,
                longitude: res.longitude,
                addr: addr,
                city: city,
                // cityPy: cityPy,
              })
            },
            fail: geoErr => {
              Notify({ type: 'danger', message: '无法获取定位', duration: 0 });
              console.log('逆地址解析失败：', geoErr)
              reject(geoErr)
            },
          })
        },
        fail: locErr => {
          Notify({ type: 'danger', message: '无法获取定位', duration: 0 });
          wx.stopPullDownRefresh();
          wx.hideLoading();
          reject(locErr)
        }
      })
    })
  },
  async getAddrDistance() {
    const resp = await this.getUserLocation();
    if (resp.latitude !== "" && resp.longitude !== "" && resp.city !== "" && resp.cityPy !== "" && resp.addr !== "") {
      const allData = await this.getAllDataApi();
      this.setData({
        basketSquareData: JSON.parse(allData.data),
      });
      const newList = this.data.basketSquareData;
      // 等待所有异步任务都完成
      const updatedList = await Promise.all(
        newList.map(async (item) => {
          // const res = await this.getSearchLocation(item.addr);
          const res = this.getDistance(this.data.lat, this.data.lng, item.lat, item.lng);
          const online = await this.getGroupUserCount(item.id);
          item.distance = res/1000;
          item.distance = item.distance.toFixed(1);
          item.online = online;
          return item;
        })
      );
      const disSortList = updatedList.sort((a, b) => a.distance - b.distance);
      this.setData({
        basketSquareFilterData: disSortList.slice(0, 6),
        isEmpty: false,
        isInput: false,
      });
      this.getBasketSquareFilter();
      wx.stopPullDownRefresh();
      wx.hideLoading();
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
    return new Promise((resolve, reject) => {
      wx.request({
        url: `https://apis.map.qq.com/ws/geocoder/v1`,
        data: {
          key: 'YSRBZ-GSVY3-3P23L-RNWCE-OQB3V-T6BXG',
          address: addr,
          // region: that.data.city,
        },
        timeout: 10000,
        success(res) {
          var lat = 0;
          var lng = 0;
          var status = 1000;
          if (res.data.status === 0) {
            const location = res.data.result.location;
            lat = location.lat;
            lng = location.lng;
          } else {
            status = 1001;
          }
          resolve({
            lat: lat,
            lng: lng,
            status: status,
          });
        },
        fail(err) {
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
    wx.showLoading({
      title: '获取定位中',
    });
    this.getAddrDistance();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {
    console.log('触底了');
    
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  }
})