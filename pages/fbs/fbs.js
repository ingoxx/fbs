// pages/fbs/fbs.js
// import QQMapWX from '../../libs/qqmap-wx-jssdk.js'
const app = getApp();
var QQMapWX = require('../../lib/qqmap-wx-jssdk.js');
const { WSS_URL } = require('../../utils/http');
const { BASE_URL } = require('../../utils/http');
const { IMG_URL } = require('../../utils/http');
import Notify from '@vant/weapp/notify/notify';
import Toast from '@vant/weapp/toast/toast';
const { generateUUID } = require('../../utils/util'); 
import Dialog from '@vant/weapp/dialog/dialog';
const md5 = require('../../utils/md5');
Page({
  data: {
    userid: "",
    showEvaBoard: false,
    avatarUrl: "",
    joinGroup: "⚡加入组局",
    existsGroup: "⚡退出组局",
    isShowMsgBtn: false,
    sender_id: '',
    user_id: '',
    wssUrl: '',
    baseUrl: '',
    showChatRoom: false,
    openid: "",
    showDataNumber: 8,
    placeTag: "",
    sportSelectedCacheKey: 'selected_sport',
    sportsCacheKey: 'is_show_sports',
    defaultSportSquare: '篮球场',
    defaultSportKey: 'bks',
    showSportsList: false,
    result: [],
    agreeCacheKey: 'is_agree',
    isShowPrivacyCacheKey: 'show_privacy',
    isUse: false,
    isInput: true,
    showTxMap: false,
    isEmptyTwo: false,
    isEmpty: true,
    showCheckList: false,
    city: '未获取位置',
    addr : '未获取位置',
    loadText: "获取数据中...",
    cityPy: '',
    addVillage: false,
    showCloseBtn: false,
    showPrivacy: false,
    villageInfo: '',
    useNotice: "下拉小程序以获取附近运动场所地址",
    notice: "本小程序致力于让运动爱好者无论身处何地，都能轻松找到运动搭子一起运动。您也可以随时添加新的运动场所位置，方便更多人加入。感谢您的支持，祝您身体健康，事事顺心！",
    lat: 0,
    lng: 0,
    inputValue: "",
    markers: [],
    currentSquareSelected: 2,
    basketSquareFilter: [
      {'id': 6, 'icon': 'medal','name': '运动场地选择', 'customize': 1, 'disable': true, 'isDisable': false, 'action': false},
      {'id': 7, 'icon': 'add-square','name': '添加场地', 'customize': 1, 'disable': true, 'isDisable': false, 'action': false},
      {'id': 5, 'icon': 'comment','name': '审核', 'customize': 3, 'disable': false, 'isDisable': false, 'action': false},
    ],
    all_sport_list: [
    ],
    checkListData: [],
    basketSquareFilterData: [],
    basketSquareData: [],
    join_users: [],
    evaluate_list: [
      // {like: 0, group_id: "aaa-bbb-ccc-ddd-eee", user: "aaa", evaluate: "这里打球得掉层皮才能走", img: "https://mp-578c2584-f82c-45e7-9d53-51332c711501.cdn.bspapp.com/wx-fbs/wx_1.JPG"},
      // {like: 0, group_id: "aaa-bbb-ccc-ddd-eee", user: "bbb", evaluate: "打球5分钟，吵架10分钟", img: "https://mp-578c2584-f82c-45e7-9d53-51332c711501.cdn.bspapp.com/wx-fbs/wx_3.JPG"},
      // {like: 0, group_id: "aaa-bbb-ccc-ddd-eee", user: "ccc", evaluate: "打架为啥带个球？", img: "https://mp-578c2584-f82c-45e7-9d53-51332c711501.cdn.bspapp.com/wx-fbs/wx_4.JPG"},
      // {like: 0, group_id: "aaa-bbb-ccc-ddd-eee", user: "ccc", evaluate: "热身运动一定要做足，篮底内线肉搏才能赢", img: "https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0"}
    ],
    info_data: {},
  },
  // 生成随机的头像
  generateImg(min, max) {
    const num = Math.floor(Math.random() * (max - min + 1)) + min;
    const img_url = `${IMG_URL}/${num}.png`;
    return img_url;
  },
  // 获取某个场地的所有用户的评价Api
  getAllEvaluateApi(gid) {
    return new Promise((resolve, reject) => {
      wx.request({
        url: `${BASE_URL}/get-user-reviews?uid=${this.data.openid}&gid=${gid}&key=${this.data.defaultSportKey}`,
        timeout: 10000,
        success: (res) => {
          if (res.statusCode == 200) {
            resolve(res.data);
          } else {
            reject({msg: '网络错误', code: 400, path: 'get-user-reviews'});
          }
        },
        fail: (err) => {
          reject({msg: '网络错误', code: 401, path: 'get-user-reviews'});
        }
      })
    });
  },
  // 场地评价弹窗
  onCloseEvaBoard() {
    this.setData({
      showEvaBoard: false,
    });
  },
  isShowEvaBoard(e) {
    const data = e.currentTarget.dataset.item;
    const fd = {
      baseUrl: BASE_URL,
      openid: this.data.openid,
      img: this.data.avatarUrl,
      group_id: data.id,
      sport_key: this.data.defaultSportKey
    }
    this.setData({
      showEvaBoard: true,
      evaluate_list: data.user_reviews,
      info_data: fd
    });
  },
  // 头像选择
  async onChooseAvatar(e) {
    const { avatarUrl } = e.detail 
    this.setData({
      avatarUrl,
    })
    try {
      const reqData = {file: avatarUrl, name: this.data.openid+".png"}
      const resp = await this.uploadFileApi(reqData);
      
      const fr = JSON.parse(resp);
      console.log(fr);
      if (fr.code != 1000) {
        Toast.fail(fr.code);
      }
    } catch (err) {
      Toast.fail(err.code);
    }
  },
  // 文件上传api
  uploadFileApi(data) {
    return new Promise((resolve, reject) => {
      wx.uploadFile({
        url: `${BASE_URL}/wx-upload?uid=${this.data.openid}&filename=${data.name}`,
        timeout: 5000,
        filePath: data.file,
        name: 'file',
        success: function (res) {
          if (res.statusCode != 200) {
            reject({msg: '网络错误', code: 401});
            return
          }
          resolve(res.data);
        },
        fail: function (err) {
          reject({msg: err, code: 402})
        }
      })
    })
  },
  // 获取群组人数
  getGroupUsersApi(gid) {
    return new Promise((resolve, reject) => {
      wx.request({
        url: `${BASE_URL}/get-join-users?uid=${this.data.openid}&gid=${gid}`,
        timeout: 10000,
        success: function (res) {
          if (res.statusCode != 200) {
            reject({msg: '网络错误', code: 400});
            return
          }
          resolve(res.data);
        },
        fail: function (err) {
          reject(err)
        }
      })
    })
  },
  // 加入组局api
  joinSportGroupApi(data) {
    return new Promise((resolve, reject) => {
      wx.request({
        url: `${BASE_URL}/user-join-group?uid=${this.data.openid}`,
        timeout: 5000,
        method: "POST",
        data: data,
        success: function (res) {
          if (res.statusCode != 200) {
            reject({msg: '网络错误', code: 401});
            return
          }
          resolve(res.data);
        },
        fail: function (err) {
          reject({msg: err, code: 402})
        }
      })
    })
  },
  // 加入组局弹窗确认, 1:退出组局,2加入组局
  joinSportGroup(e) {
    const data = e.currentTarget.dataset.item;
    Dialog.confirm({
      title: data.tags[0],
      message: data.hasJoined ? '确定退出吗？' : '确定加入吗？',
    })
      .then(async () => {
        const fd = {
          group_id: data.id, 
          user: this.data.openid, 
          img: this.data.avatarUrl,
          oi: data.hasJoined ? "1" : "2"
        };
        try {
          const resp = await this.joinSportGroupApi(fd);
          if (resp.code == 1006) {
            Toast.fail(resp.msg)
            return;
          }
          if (resp.code != 1000) {
            Toast.fail(resp.code);
            return;
          }
          this.getAddrDistance();
          Toast.success(data.hasJoined ? '已退出' : '已加入');
        } catch (error) {
          Toast.fail(error.code);
        }
      })
      .catch(() => {
      });
  },
  // 打开地图
  openMapAppDetailed(e) {
    const data = e.currentTarget.dataset.item;
    wx.openLocation({
      latitude: Number(data.lat),  // 纬度
      longitude: Number(data.lng), // 经度
      address: data.addr+data.tags[0], // 地址（可选）
      scale: 18,
      success(res) {
        console.log('打开成功');
      },
      fail(err) {
        console.log('打开失败', err);
      }
    });
  },
  getAllSportsApi() {
    return new Promise((resolve, reject) => {
      wx.request({
        url: `${BASE_URL}/get-all-sports?uid=${this.data.openid}`,
        timeout: 10000,
        success: (res) => {
          if (res.statusCode == 200) {
            resolve(res.data);
          } else {
            reject({
              statusCode: res.statusCode,
              message: '请求失败',
              response: res
            })
          }
        },
        fail: (err) => {
          reject(err);
        }
      })
    });
  },
  onCloseChatRoom() {
    this.setData({
      showChatRoom: false,
    });
  },
  isShowChatRoom(e) {
    if (this.data.openid == app.globalData.admin) {
      this.setData({
        showChatRoom: true,
      });
    }
  },
  onConfirmSportSelection() {
    if (this.data.isUse) {
      Toast.loading({
        message: this.data.loadText,
        forbidClick: true,
        duration: 0,
      });
      this.getAddrDistance();
    } 
  },
  async getSiteSelection() {
    try {
      const sss = await this.cusGetStorage(this.data.sportSelectedCacheKey);
      const nd = this.data.all_sport_list.map((item) => {
        if (item.key == sss.key) {
          item.checked = true;
        } else {
          item.checked = false;
        }
        return item;
      })
      this.setData({
        all_sport_list: nd,
        defaultSportKey: sss.key,
        defaultSportSquare: sss.name,
      });
    } catch (error) {
      console.log("缓存失效");
    }
  },
  // 运动偏好弹窗
  async isShowSportList() {
    // 1：打开场地选择，2：关闭场地选择
    if (this.data.isUse) {
      try {
        const resp = await this.cusGetStorage(this.data.sportsCacheKey);
        if (resp == 2) {
          this.setData({
            showSportsList: false,
          });
        } else {
          this.setData({
            showSportsList: true,
          });
        }
      } catch (error) {
        this.cusSetStorage(this.data.sportsCacheKey, 2);
        this.setData({
          showSportsList: true,
        });
      }
      
    }
  },
  // 运动偏好选择
  onSportsChange(e) {
    const sd = e.currentTarget.dataset.item;
    const nd = this.data.all_sport_list.map((item) => {
      if (item.key == sd.key) {
        item.checked = true;
      } else {
        item.checked = false;
      }
      return item
    })
    this.setData({
      all_sport_list: nd,
      defaultSportKey: sd.key,
      defaultSportSquare: sd.name,
    });
    this.cusSetStorage(this.data.sportSelectedCacheKey, sd);
  },
  openMapApp() {
    wx.openLocation({
      latitude: Number(this.data.lat),  // 纬度
      longitude: Number(this.data.lng), // 经度
      address: this.data.addr, // 地址（可选）
      scale: 18,
      success(res) {
        console.log('打开成功');
      },
      fail(err) {
        console.log('打开失败', err);
      }
    });
  },
  cusSetStorage(key, data) {
    wx.setStorage({
      key: key,
      data: JSON.stringify(data),
      success(res) {
        console.log(res.data);
      },
      fail(err) {
        Toast.fail("数据存储失败");
      }
    })
  },
  cusGetStorage(key) {
    return new Promise((resolve, reject) => {
      wx.getStorage({
        key: key,
        success(res) {
          resolve(JSON.parse(res.data)); // ✅ 拿到结果
        },
        fail(err) {
          reject(err); // ⚠️ 如果没找到
        }
      });
    });
  },
  async isShowPrivacy() {
    // 1: 关闭隐私协议弹窗，2：打开隐私协议弹窗
    try {
      const value = await this.cusGetStorage(this.data.isShowPrivacyCacheKey);
      if (value == 2) {
        this.setData({
          showPrivacy: true,
          isUse: false,
          loadText: "首次加载数据会比较耗时",
        })
      } else if (value == 1) {
        this.setData({
          showPrivacy: false,
          isUse: true,
          loadText: "获取数据中...",
          wssUrl: WSS_URL,
          baseUrl: BASE_URL,
          user_id: this.data.openid,
          sender_id: md5(this.data.openid),
        })
        if (this.data.isUse) {
          Toast.loading({
            message: this.data.loadText,
            forbidClick: true,
            duration: 0,
          });
          if (this.data.openid == app.globalData.admin) {
            this.setData({
              isShowMsgBtn: true,
            });
          }
          this.getAllSportsApi().then((resp) => {
            if (resp.code == 1000) {
              this.setData({
                all_sport_list: resp.data,
              });
            }
          }).catch((err) => {
            Toast.fail("502")
          });
          this.isShowSportList();
          this.getAddrDistance();
        }
      }
    } catch (err) {
      this.cusSetStorage(this.data.isShowPrivacyCacheKey, 2);
      this.setData({
        showPrivacy: true,
        isUse: false,
        loadText: "首次加载数据会比较耗时",
      })
    }
    this.getSiteSelection();
  },
  // 隐私协议， 1：同意，2：拒绝
  iAacceptPrivacy(e) {
    const res = e.currentTarget.dataset.item;
    if (res == 1) {
      this.cusSetStorage(this.data.isShowPrivacyCacheKey, 1);
      this.setData({
        showPrivacy: false,
        isUse: true,
        loadText: "首次加载数据会比较耗时",
      })
      setTimeout(()=>{
        this.getAllSportsApi().then((resp) => {
          if (resp.code == 1000) {
            this.setData({
              all_sport_list: resp.data,
            });
          }
          this.isShowSportList();
        }).catch((err) => {
          Toast.fail("502")
        })
      },500)
    } else if (res == 2) {
      this.cusSetStorage(this.data.isShowPrivacyCacheKey, 2);
      this.setData({
        showPrivacy: false,
        isUse: false,
      })
      setTimeout(() => {
        this.setData({
          showPrivacy: true,
          isUse: false,
        })
      }, 5000)
    }
  },
  // 提交添加地址的api
  userAddAddrReqApi(data) {
    return new Promise((resolve, reject) => {
      wx.request({
        url: `${BASE_URL}/user-add-square?uid=${this.data.openid}`,
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
  // 地址审核列表
  getCheckListApi() {
    return new Promise((resolve, reject) => {
      wx.request({
        url: `${BASE_URL}/check-list?uid=${this.data.openid}`,
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
  // 拉取所有数据
  getAllDataApi() {
    return new Promise((resolve, reject) => {
      wx.request({
        url: `${BASE_URL}/show-square?lat=${this.data.lat}&lng=${this.data.lng}&city=${this.data.city}&uid=${this.data.openid}&sport_key=${this.data.defaultSportKey}&sport_name=${this.data.defaultSportSquare}`,
        success: function (res) {
          if (res.statusCode != 200) {
            wx.stopPullDownRefresh();
            // wx.hideLoading();
            Toast.clear();
            Notify({ type: 'danger', message: `加载数据失败：${res.statusCode}`, duration: 30000 });
            reject(new Error(`HTTP 状态码异常: ${res.statusCode}`));
            return;
          }
          resolve(res.data);
        },
        fail: function (err) {
          Notify({ type: 'danger', message: '请求失败', duration: 30000 });
          reject(err)
        }
      })
    })
  },
  async getBasketSquareFilter() {
    const newBsf = this.data.basketSquareFilter;
    const updatadBsf = await Promise.all(
      newBsf.map(async (item) => {
        // const res = await app.login();
        if (item.customize == 3) {
          item.disable = this.data.openid == app.globalData.admin;
        } else {
          item.isDisable = false;
        }
        return item;
      })
    );
    this.setData({
      basketSquareFilter: updatadBsf,
    })
  },
  refuseAddAddrReqApi(id, city) {
    return new Promise((resolve, reject) => {
      wx.request({
        url: `${BASE_URL}/add-square-refuse?uid=${this.data.openid}`,
        method: "POST",
        timeout: 10000,
        data: JSON.stringify({id: id, city: city}),
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
  passAddAddrReqApi(id, city) {
    return new Promise((resolve, reject) => {
      wx.request({
        url: `${BASE_URL}/add-square-pass?uid=${this.data.openid}`,
        method: "POST",
        timeout: 10000,
        data: JSON.stringify({id: id, city: city}),
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
      const pdd = await this.passAddAddrReqApi(addData.id, addData.sport_key);
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
      const pdd = await this.refuseAddAddrReqApi(delData.id, delData.sport_key);
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
  // 每个群组的在线人数接口
  getGroupUserCountApi(gid) {
    return new Promise((resolve, reject) => {
      wx.request({
        url: `${BASE_URL}/get-online?gid=${gid}&uid=${this.data.openid}&user_id=${this.data.openid}`,
        timeout: 10000,
        success: res => {
          resolve(res.data);
        },
        fail: reject
      });
    });
  },
  onChangeAddAddrField(e) {
    const value = e.detail;
    this.setData({villageInfo: value});
  },
  onChangeAddTagField(e) {
    const value = e.detail;
    this.setData({placeTag: value});
  },
  // 用户提交添加篮球场地址的请求
  async onConfirmAddPlace() {
    const val = this.data.villageInfo;
    const val2 = this.data.placeTag;
    if (val == "") {
      Toast.fail("地址不能为空");
      return;
    }
    if (val2 == "") {
      Toast.fail("简称不能为空");
      return;
    }
    const respTx = await this.txMapSearchAddrApi(this.data.villageInfo);
    if (respTx.status != 1000) {
      Notify({type: 'danger', message: '输入的地址无效', duration: 30000});
      return;
    }
    
    const ad = {
      id: generateUUID(),
      user_id: this.data.openid,
      addr: this.data.villageInfo,
      lat: respTx.lat,
      lng: respTx.lng,
      city: this.data.city,
      sport_key: this.data.defaultSportKey,
      tags: val2 ? val2 : this.data.defaultSportSquare,
    }
    console.log("ad >>> ", ad);
   const resp = await this.userAddAddrReqApi(ad);
   if (resp.code != 1000) {
      const msg = resp.msg ? resp.msg : "添加地址失败, 请联系管理员";
      Notify({ type: 'danger', message: msg, duration: 20000 });
      return;
    }
    Notify({ type: 'success', message: "地址已提交,审核通过会更新到页面上", duration: 10000 });
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
    // var fd = this.data.basketSquareData.filter(item => item.addr.includes(e.detail.value));
    const fd = this.data.basketSquareData.filter(item => {
      const addrMatch = item.addr.includes(e.detail.value);
      const tagsMatch = item.tags.some(tag => tag.includes(e.detail.value));
      return addrMatch || tagsMatch;
    });
    const disSortList = fd.sort((a, b) => a.distance - b.distance);
    this.setData({
      basketSquareFilterData: disSortList.slice(0, this.data.showDataNumber),
    });
},
  // 进到群组
  chatRoom(e) {
    const id = e.currentTarget.dataset.item;
    const img = this.data.all_sport_list.find(item => item.key == this.data.defaultSportKey);
    wx.navigateTo({
      url: `/pages/chat/chat?id=${id.id}&addr=${id.addr}&lat=${id.lat}&lng=${id.lng}&user_id=${this.data.openid}&sender_id=${md5(this.data.openid)}&img=${img.img}&tag=${id.tags[0]}`,
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
    if (!this.data.isUse) {
      Toast.fail("请先同意协议");
      this.setData({
        showPrivacy: true,
      });
      return;
    }
    var name = this.data.basketSquareFilter.find(item => item.id == id);
    if (name.name == "运动场地选择") {
      this.getSiteSelection();
      this.setData({
        showSportsList: true,
      });
      return;
    } else if (name.name == "添加场地") {
      this.setData({ addVillage: true})
      return;
    } else if (name.name == "审核") {
      this.getCheckList();
      this.setData({
        showCheckList: true,
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
            markers: [{
              id: 1,
              longitude: res.longitude,
              latitude: res.latitude,
              title: '当前位置'
            }],
          })
          qqmapsdk.reverseGeocoder({
            location: {
              latitude: res.latitude,
              longitude: res.longitude
            },
            success: geoRes => {
              const addr = geoRes.result.formatted_addresses.rough;
              const city = geoRes.result.address_component.city;
              this.setData({
                addr: addr,
                city: city,
              })
              // 把需要的结果一起 resolve 出去
              resolve({
                latitude: res.latitude,
                longitude: res.longitude,
                addr: addr,
                city: city,
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
          console.log(locErr);
          wx.stopPullDownRefresh();
          // wx.hideLoading();
          Toast.clear();
          reject(locErr)
        }
      })
    })
  },
  async getAddrDistance() {
    const resp = await this.getUserLocation();
    if (resp.latitude !== "" && resp.longitude !== "" && resp.city !== "") {
      const allData = await this.getAllDataApi();
      if (allData.code != 1000) {
        Toast.fail(allData.code);
        return;
      }
      this.setData({
        basketSquareData: JSON.parse(allData.data),
      });
      const newList = this.data.basketSquareData;
      const updatadList = newList.map((item) => {
          const res = this.getDistance(this.data.lat, this.data.lng, item.lat, item.lng);
          item.distance = res/1000;
          item.distance = item.distance.toFixed(1);
          return item;
      });
      const disSortList = updatadList.sort((a, b) => a.distance - b.distance);
      const sliceDataList = disSortList.slice(0, this.data.showDataNumber);
      // 等待所有异步任务都完成
      const newUL = await Promise.all(
        sliceDataList.map(async (item) => {
          const online = await this.getGroupUserCountApi(item.id);
          if (online.code != 1000) {
            Toast.fail("失败: ", online.code);
            return;
          }
          item.online = online.data;
          const group_users = await this.getGroupUsersApi(item.id);
          if (group_users.code != 1000) {
            Toast.fail("group_users: ", online.code);
            return;
          }
          if (group_users.data.length > 0 ) {
            item.join_user_count = group_users.data.length;
          }
          item.join_users = group_users.data.slice(-this.data.showDataNumber);

          // 获取某个场地id的所有用户评价
          const eva_data = await this.getAllEvaluateApi(item.id);
          if (eva_data.code != 1000) {
            Toast.fail("eva_data: ", eva_data.code);
            return;
          }
          item.user_reviews = eva_data.data;
          item.user_reviews_count = eva_data.data.length;

          return item;
        })
      );
      const processedList = newUL.map(item => {
        const hasJoined = (item.join_users || []).some(user =>
          user.group_id === item.id && user.user === this.data.openid
        );
        return {
          ...item,       // 保留原来的字段
          hasJoined      // 新增字段
        };
      });

      this.setData({
        basketSquareFilterData: processedList,
        isEmpty: false,
        isInput: false,
      });
      this.getBasketSquareFilter();
      wx.stopPullDownRefresh();
      // wx.hideLoading();
      Toast.clear();
    } else {
      wx.stopPullDownRefresh();
      // wx.hideLoading();
      Toast.clear();
      Toast.fail("加载数据失败3");
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
  // 获取openid
  getOpenid() {
    let that = this;
    app.login().then(resp => {
      that.setData({
        openid: resp.openid,
        avatarUrl: resp.img,
        userid: "user_"+md5(resp.openid),
      });
      that.isShowPrivacy();
    }).catch(err => {
      console.error('登录失败:', err);
    });
  },
  // 设置当前页的标题
  setNavigatInfo() {
    wx.setNavigationBarColor({
      frontColor: "#ffffff",
      backgroundColor: "#6a72d9",
    });
    wx.setNavigationBarTitle({
      title: app.globalData.title,
    });
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.setNavigatInfo();
    this.getOpenid();
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
    // this.getOpenid();
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
    if (this.data.isUse) {
      Toast.loading({
        message: this.data.loadText,
        forbidClick: true,
        duration: 0,
      });
      this.getOpenid();
    } else {
      wx.stopPullDownRefresh();
    }
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