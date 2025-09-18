// pages/fbs/fbs.js
// import QQMapWX from '../../libs/qqmap-wx-jssdk.js'
const app = getApp();
var QQMapWX = require('../../lib/qqmap-wx-jssdk.js');
const { WSS_URL } = require('../../utils/http');
const { BASE_URL } = require('../../utils/http');
const { IMG_URL } = require('../../utils/http');
import Notify from '@vant/weapp/notify/notify';
import Toast from '@vant/weapp/toast/toast';
const { generateUUID, stringToTimestamp, getCurrentTime, storage, isValidDateTime } = require('../../utils/util'); 
import Dialog from '@vant/weapp/dialog/dialog';
const md5 = require('../../utils/md5');
Page({
  data: {
    p_data: {addr: "", lng: "", lat: "", title: ""},
    isSwitchData: false,
    sp_time: "",
    titleName: "",
    isActiveTitle: 3,
    titles: [
      {id: 3, name: "场地", icon:"https://ai.anythingai.online/static/profile3/venue-7.svg"},
      {id: 4, name: "陪练", icon:"https://ai.anythingai.online/static/profile3/sp-11.svg"},
    ],
    mChecked: false,
    fmChecked: false,
    showSpPop: false,
    sp_players: "",
    sp_content: "",
    sp_price: "",
    sp_required: "",
    venue_count: 0,
    admin: "",
    isLock: false,
    isActive: 1,
    chooseList: [],
    showChoose: false,
    isShowAllData: false,
    isShowGoodPage: false,
    totalData: 0,
    showSettingCenter: false,
    showUserUpdateList: false,
    cbt_user_count: 0,
    filter_cbt_users: [],
    cbt_users: [],
    bks_name: "",
    filter_user_list_two: [],
    showGroupList: false,
    userImgs: [],
    showUserImg: false,
    userCount: 0,
    userVal: "",
    showUsersBtn: false,
    showUserList: false,
    showPrivacyContent: false,
    privacyCheckedVal: false, 
    showVenueImg: false,
    nick_name: "",
    showNickName: false,
    img_url: "",
    showReplyBtn: false,
    showFlushBtn: false,
    showServiceBtn: false,
    userid: "",
    showEvaBoard: false,
    avatarUrl: "",
    joinGroup: "⚡加入组局",
    existsGroup: "⚡退出组局",
    isAdminShow: false,
    sender_id: '',
    user_id: '',
    wssUrl: '',
    baseUrl: '',
    showChatRoom: false,
    openid: "",
    showDataNumber: 16,
    placeTag: "",
    sportSelectedCacheKey: 'selected_sport',
    sportsCacheKey: 'is_show_sports',
    defaultSportSquare: '🏀篮球场',
    defaultSportKey: 'bks',
    showSportsList: false,
    result: [],
    fileList: [],
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
    useNotice: "下拉小程序以获取附近运动场地址",
    notice: "以帮助更多人了解场地信息，感谢！",
    lat: 0,
    lng: 0,
    inputValue: "",
    markers: [],
    currentSquareSelected: 2,
    basketSquareFilter: [],
    all_sport_list: [
    ],
    checkListData: [],
    basketSquareFilterData: [],
    basketSquareData: [],
    join_users: [],
    evaluate_list: [],
    info_data: {},
    images: [],
    user_list: [],
    filter_user_list: [],
    spDataNum: 1,
    spData: [
      {id: "1", is_del: false, user_id: "ogR3E62jXXJMbVcImRqMA1gTSegM1", nick_name: "吴艳祖深圳分祖", img: "https://ai.anythingai.online/static/profile3/1527.png", publish_date: "09-15", content: "需要2个帮捡球", date: "2025-09-20 16:30 周六", addr: "深圳市顶峰篮球俱乐部龙华分店", price: "20元/小时", gender_req: "男女都可以", players: "需要2人", city: "深圳市"},
      {id: "2", is_del: false,  user_id: "ogR3E62jXXJMbVcImRqMA1gTSegM", nick_name: "深圳打铁王", img: "https://ai.anythingai.online/static/profile3/1047.png", publish_date: "09-11", content: "需要5v5对抗训练,还缺两个人", date: "2025-09-19 18:30 周五", addr: "深圳市深圳湾体育中心", price: "25元/小时", user_id: "", gender_req: "仅限男", players: "需要2人", city: "深圳市"},
      {id: "3", is_del: false,  user_id: "ogR3E62jXXJMbVcImRqMA1gTSegM", nick_name: "裤里的4分球", img: "https://ai.anythingai.online/static/profile3/1684.png", publish_date: "09-14", content: "百分单挑局输赢都给100", date: "2025-09-21 19:30 周日", addr: "深圳市东岸天台篮球场", price: "100元/局", gender_req: "仅限男", players: "需要1人", city: "深圳市"},
      {id: "4", is_del: false,  user_id: "ogR3E62jXXJMbVcImRqMA1gTSegM", nick_name: "天上掉了个篮球", img: "https://ai.anythingai.online/static/profile3/1685.png", publish_date: "09-12", content: "需要一名篮球裁判", date: "2025-09-21 19:30 周日", addr: "深圳市东岸天台篮球场", price: "50元/场", gender_req: "仅限男", players: "需要1人", city: "深圳市"},
    ],
  },
  async put_out() {
    var gender_req = ""
    const pd = this.data.p_data;
    if (this.data.mChecked) {
      gender_req = "仅限男性";
    }
    if (this.data.fmChecked) {
      gender_req = "仅限女性";
    }
    if (this.data.mChecked && this.data.fmChecked) {
      gender_req = "男女都可以";
    }
    if (!this.data.mChecked && !this.data.fmChecked) {
      gender_req = "男女都可以";
    }
    const data = {
        id:"1",
        user_id: this.data.openid,
        nick_name: this.data.nick_name,
        img: this.data.avatarUrl,
        content: this.data.sp_content,
        addr: pd.addr,
        price: this.data.sp_price,
        gender_req: gender_req,
        players: `需要${this.data.sp_players}人`,
        city: this.data.city,
        sport_key: this.data.defaultSportKey,
        lng: pd.lng,
        lat: pd.lat,
        title: pd.title
    }

    try {
      const resp = await this.put_out_api(data);
      if (resp.code != 1000) {
        Toast.fail("发布失败: ", resp.code);
        return;
      }
      this.setData({
        spData: resp.data,
      });
    } catch (error) {
      Toast.fail("发布失败: ", resp.code);
    }
  },
  put_out_api(data) {
    return new Promise((resolve, reject) => {
      wx.request({
        url: `${this.data.baseUrl}/add-publish-data?uid=${this.data.user_id}`,
        timeout: 10000,
        method: "POST",
        data: data,
        success: function (res) {
          resolve(res.data);
        },
        fail: function (err) {
          reject(err)
        }
      })
    });
  },
  onConfirmSportSelection2(e) {
    const id = e.currentTarget.dataset.id;
    if (this.data.isActiveTitle != id) {
      this.setData({
        isActiveTitle: id,
        isSwitchData: !this.data.isSwitchData,
      })
    }
  },
  onChangeGender(e) {
    const id = e.currentTarget.dataset.id;
    if (id == 1) {
      this.setData({
        mChecked: !this.data.mChecked,
      });
    } else if (id == 2) {
      this.setData({
        fmChecked: !this.data.fmChecked,
      });
    }
  },

  onSet() {
    this.setData({
      sp_content: "",
      sp_price: "",
      sp_required: "",
      sp_players: "",
      sp_time: "",
      mChecked: false,
      fmChecked: false,
    });
  },
  onChangeSpPlayersField(e) {
    const value = e.detail;
    this.setData({sp_players: value});
  },
  onChangeSpContentField(e) {
    const value = e.detail;
    this.setData({sp_content: value});
  },
  onChangeSpPriceField(e) {
    const value = e.detail;
    this.setData({sp_price: value});
  },
  onChangeSpReqField(e) {
    const value = e.detail;
    this.setData({sp_time: value});
  },
  async onConfirmPublishSp(e) {
    if (!this.data.sp_content) {
      Toast.fail("请输入陪练内容");
      return;
    }

    if (!this.data.sp_price) {
      Toast.fail("请输入陪练价格");
      return;
    }

    if (!this.data.sp_time) {
      Toast.fail("请输入陪练时间");
      return;
    }

    if (!isValidDateTime(this.data.sp_time)) {
      Toast.fail("输入的时间格式不对");
      return;
    }

    if (!this.data.sp_players) {
      Toast.fail("请输入陪练人数");
      return;
    }

    Dialog.confirm({
      title: "",
      message: "确定发布吗？",
    }).then(async () => {
      Toast.loading({
        message: '发布中...',
        forbidClick: true,
      });
      var gender_req = ""
      const pd = this.data.p_data;
      if (this.data.mChecked) {
        gender_req = "仅限男性";
      }
      if (this.data.fmChecked) {
        gender_req = "仅限女性";
      }
      if (this.data.mChecked && this.data.fmChecked) {
        gender_req = "男女都可以";
      }
      if (!this.data.mChecked && !this.data.fmChecked) {
        gender_req = "男女都可以";
      }
      const data = {
          id:"1",
          user_id: this.data.openid,
          nick_name: this.data.nick_name,
          img: this.data.avatarUrl,
          content: this.data.sp_content,
          addr: pd.addr,
          date: this.data.sp_time,
          price: this.data.sp_price,
          gender_req: gender_req,
          players: `需要${this.data.sp_players}人`,
          city: this.data.city,
          sport_key: this.data.defaultSportKey,
          lng: pd.lng,
          lat: pd.lat,
          title: pd.title
      }
  
      try {
        const resp = await this.put_out_api(data);
        console.log(resp);
        if (resp.code != 1000) {
          Toast.fail("发布失败1: ", resp.code);
          return;
        }
        this.setData({
          spData: resp.data,
        });
        // Toast.clear();
        Toast.success("发布成功");
      } catch (error) {
        Toast.fail("发布失败2: ", resp.code);
      }
      })
      .catch(() => {
        Toast.success("已取消发布");
      });
  },
  onCloseAllPop() {
    this.setData({
      showServiceBtn: false,
    });
  },
  onFilterVenueData() {
    const data = this.data.basketSquareFilterData;
    const aid = this.data.isActive;
    if (aid == 2) {
      data.sort((a, b) => {
        return b.join_users.length - a.join_users.length;
      });
    } else if (aid == 3) {
      data.sort((a, b) => {
        return b.user_reviews.length - a.user_reviews.length;
      });
    } else if (aid == 1) {
      data.sort((a, b) => {
        return a.distance - b.distance;
      });
    }
    this.setData({
      basketSquareFilterData: data
    });
    Toast.success("筛选完成");
    this.onClose();
  },
  onFiltering(e) {
    const id = e.currentTarget.dataset.id;
    this.setData({
      isActive: id,
    });
  },
  openChoosePop() {
    this.setData({
      showChoose: true,
    })
  },
  onTabSportsChange(e) {
    const data = e.currentTarget.dataset.item;
    this.setData({
      defaultSportKey: data.key,
      defaultSportSquare: data.name,
    });
  },
  openAddAddrPop() {
    this.setData({ addVillage: true})
  },
  openCheckListPop() {
    this.getCheckList();
    this.setData({
      showCheckList: true,
    })
  },
  onConfirmSportSelection1(e) {
    const data = e.currentTarget.dataset.item;
    this.setData({
      defaultSportKey: data.key,
      defaultSportSquare: data.name,
    })
    if (this.data.isUse) {
      Toast.loading({
        message: this.data.loadText,
        forbidClick: true,
        duration: 0,
      });
      this.getAddrDistance();
      storage("sport", {key: data.key, name: data.name});
    }
  },
  showGoodBtn() {
    const sport_key = this.data.defaultSportKey;
    if (sport_key == "bks" || sport_key == "bms" || sport_key == "fbs" || sport_key == "sws") {
      this.setData({
        isShowGoodPage: true,
      });
    } else {
      this.setData({
        isShowGoodPage: false,
      });
    }
  },
  getVenueImgApi(aid) {
    return new Promise((resolve, reject) => {
      wx.request({
        url: `${BASE_URL}/get-venue-img?uid=${this.data.openid}&aid=${aid}&sport_key=${this.data.defaultSportKey}&city=${this.data.city}`,
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
  async getVenueImg(e) {
    const data = e.currentTarget.dataset.item;
    try {
      await Dialog.confirm({
        title: '',
        message: `获取场地图片可能会失败, 确认获取吗？`
      }).then(async () =>{
        wx.showLoading({
          title: '获取中...',
        })
        const pdd = await this.getVenueImgApi(data.id);
        if (pdd.code != 1000) {
          Toast.fail("失败了");
          wx.hideLoading();
          return;
        }
        this.setData({
          checkListData: pdd.data,
        });
        Toast.success("成功了");
        wx.hideLoading();
        this.getAddrDistance();
      }).catch(() => {
        wx.hideLoading();
      })
      } catch (err) {
        console.log('取消或失败:', err);
      }
  },
  showDialogPopup() {
    this.setData({
      showSettingCenter: false,
    });
  },
  searchUpdateLog(e) {
    const val = e.detail;
    const cb_data = this.data.cbt_users;
    if (val == "") {
      this.setData({
        filter_cbt_users: cb_data,
        cbt_user_count: cb_data.length,
      });
      return;
    }
    this.setData({
      userVal: val,
    });
    const fd = cb_data.filter(item => {
      const nnMatch = item.nick_name.includes(val);
      const cityMatch = item.city.includes(val);
      return nnMatch || cityMatch;
    });
    this.setData({
      filter_cbt_users: fd,
      cbt_user_count: fd.length,
    });
  },
  showUserUpdateLog(e) {
    const data = e.currentTarget.dataset.item;
    if (data.venue_update_users_count > 0) {
      const fcu = data.venue_update_users;
      fcu.sort((a, b) => {
        return stringToTimestamp(b.time) - stringToTimestamp(a.time);
      });
      this.setData({
        filter_cbt_users: fcu,
        cbt_users: fcu,
        cbt_user_count: data.venue_update_users.length,
        bks_name: data.title,
        showUserUpdateList: true,
      });
    }
  },
  onCloseGroupList () {
    this.setData({
      showGroupList: false,
      showUserUpdateList: false,
      userVal: "",
    })
  },
  showUserImgShape(e) {
    const data = e.currentTarget.dataset.item;
    const title = e.currentTarget.dataset.val.title
    data.sort((a, b) => {
      return stringToTimestamp(b.time) - stringToTimestamp(a.time);
    });
    this.setData({
      showGroupList: !this.data.showGroupList,
      filter_user_list_two: data,
      user_list: data,
      userCount: data.length,
      bks_name: title,
    });
  },
  searchJoinUser(e) {
    const val = e.detail;
    const user_data = this.data.user_list;
    if (val == "") {
      this.setData({
        filter_user_list_two: this.data.user_list,
        userCount: user_data.length,
      });
      return;
    }
    this.setData({
      userVal: val,
    });
    const fd = user_data.filter(item => {
      const skdMatch = item.skill.includes(val);
      const nnMatch = item.nick_name.includes(val);
      return skdMatch || nnMatch;
    });
    this.setData({
      filter_user_list_two: fd,
      userCount: fd.length,
    });
  },
  searchUser(e) {
    const val = e.detail;
    const user_data = this.data.user_list;
    if (val == "") {
      this.setData({
        filter_user_list: user_data,
        userCount: user_data.length,
      });
      return;
    }
    this.setData({
      userVal: val,
    });
    const fd = user_data.filter(item => {
      const oidMatch = item.openid.includes(val);
      const nnMatch = item.nick_name.includes(val);
      const cityMatch = item.city.includes(val);
      return oidMatch || nnMatch || cityMatch;
    });
    this.setData({
      filter_user_list: fd,
      userCount: fd.length,
    });
  },
  async getUserList() {
    try {
      const resp = await this.getUserListApi();
      if (resp.code != 1000) {
        Toast.fail("获取用户列表失败1");
        return
      }
      const fd = resp.data;
      fd.sort((a, b) => {
        return stringToTimestamp(b.time) - stringToTimestamp(a.time);
      });
      this.setData({
        user_list: fd,
        showUserList: true,
        userCount: fd.length,
        filter_user_list: fd,
      })
    } catch (error) {
      Toast.fail("获取用户列表失败2");
    }
  },
  getUserListApi() {
    return new Promise((resolve, reject) => {
      wx.request({
        url: `${BASE_URL}/get-user-list?uid=${this.data.openid}`,
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
  onCloseUserList () {
    this.setData({
      showUserList: false,
      userVal: "",
    })
  },
  privacyContentRead() {
    this.setData({
      showPrivacyContent: !this.data.showPrivacyContent,
      privacyCheckedVal: true,
    })
  },
  showUserPrivacyContent () {
    this.setData({
      showPrivacyContent: !this.data.showPrivacyContent,
    });
  }, 
  onPrivacyCheckedChange() {
    this.setData({
      privacyCheckedVal: !this.data.privacyCheckedVal,
    });
  },
  async updateVenueImg(e) {
    const data = e.currentTarget.dataset.item;
    const fileList = this.data.fileList;
    var url = "";

    if (fileList.length == 0) {
      Toast.fail("先选择图片");
      return;
    }    
    Toast.loading({
      message: '正在更新...',
      forbidClick: true,
    });
    if (fileList.length > 0) {
      const imgname = data.id+".png";
      const filedata = {file: fileList[0].url, name: imgname, is_user_upload: 2};
      try {
        const resp = await this.uploadFileApi(filedata);
        const nr = JSON.parse(resp);
        if (nr.code == 1000) {
          url = `${IMG_URL}/${imgname}`;
        } else {
          Toast.fail("图片上传失败: 401");
          // Toast.clear();
          return;
        }
      } catch (err) {
        Toast.fail("图片上传失败: 402");
        // Toast.clear();
        return;
      }
    }
    const ad = {
      id: data.id,
      aid: data.aid,
      user_id: this.data.openid,
      addr: data.addr,
      lat: data.lat,
      lng: data.lng,
      city: this.data.city,
      sport_key: this.data.defaultSportKey,
      tags: data.tags[0],
      nick_name: this.data.nick_name,
      user_img: this.data.avatarUrl,
      openid: this.data.openid,
      content: "",
      time: getCurrentTime(),
      img: url,
      update_type: "2",
    }
   const resp = await this.userAddAddrReqApi(ad);
   if (resp.code != 1000) {
      // Notify({ type: 'danger', message: resp.msg ? resp.msg : "操作失败, 请联系管理员", duration: 20000 });
      Toast({ type: 'fail', message: resp.msg ? resp.msg : "操作失败, 请联系管理员", duration: 8000 });
      setTimeout(() => {
        Toast.clear();
      },8000);
      return;
    }
    // Notify({type: "success", message: "非常感谢您做出的巨大贡献，图片生效需要几分钟", duration: 3000});
    Toast({ type: 'success', message: "跪谢，图片生效需要几分钟", duration: 3000 });
    this.toggleShowVenueImg(e);
    this.getAddrDistance();
    setTimeout(() => {
      Toast.clear();
    },8000);
  },
  toggleShowVenueImg1(e) {
    const data = e.currentTarget.dataset.item;
    const fd = {addr: data.addr+data.title, lng: data.lng, lat: data.lat, title: this.data.city+data.title};
    console.log(fd);
    this.setData({
      showSpPop: true,
      p_data: fd,
    })
  },
  toggleShowVenueImg(e) {
    if (!this.data.isShowAllData) {
      Toast.fail("已是最新场地图片");
      return;
    }
    const index = e.currentTarget.dataset.index;
    const data = e.currentTarget.dataset.item;
    const vd = this.data.basketSquareFilterData;
    if (data.venue_update_users_count > 0) {
      const fcu = data.venue_update_users;
      fcu.sort((a, b) => {
        return stringToTimestamp(b.time) - stringToTimestamp(a.time);
      });
      console.log("fcu >>> ", fcu);
      this.setData({
        filter_cbt_users: fcu,
        cbt_users: fcu,
      });
    }
    vd[index].is_show = !vd[index].is_show; // 切换状态
    this.setData({
      basketSquareFilterData: vd,
      cbt_user_count: data.venue_update_users_count,
    });
  },
  userInfoUpdateApi(data) {
    return new Promise((resolve, reject) => {
      wx.request({
        url: `${BASE_URL}/wx-user-info-update?uid=${this.data.openid}`,
        timeout: 10000,
        method: "POST",
        data: data,
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
  async chooseNickName(e) {
    const nn = e.detail.value;
    if (nn.length == 0) {
      return;
    }
    this.setData({
      nick_name: nn,
    });
    const data = {
      openid: this.data.openid,
      img: this.data.avatarUrl, 
      nick_name: nn,
    }
    try {
      const resp = await this.userInfoUpdateApi(data);
      if (resp.code != 1000) {
        Toast.fail("更改失败");
        return;
      }
      wx.setStorageSync('openid', resp.data.openid);
      wx.setStorageSync('img', resp.data.img);
      wx.setStorageSync('nickname', resp.data.nick_name);
    } catch (err) {
      Toast.fail("更改失败");
      return;
    }
  },
  onCloseNickName() {
    this.setData({
      showNickName: false,
    })
  },
  openNickName() {
    this.setData({
      showNickName: true,
    })
  },
  deleteImg(e) {
    const id = e.detail.index;
    const fileList = [...this.data.fileList];
    fileList.splice(id, 1);
    this.setData({
      fileList: fileList,
    });
  },
  beforeRead(event) {
    const { file, callback } = event.detail;
    callback(file.type === 'image');
  },
  afterRead(event) {
    const { file } = event.detail;
    const newFiles = Array.isArray(file) ? file : [file];
    this.setData({ fileList: this.data.fileList.concat(newFiles) });
  },
  onPreviewVenueImage(e) {
    const src = e.currentTarget.dataset.src;
    const imgs =  e.currentTarget.dataset.imgs;
    var images = [src];
    if (imgs && imgs.length > 1) {
      images=imgs;
    }
    wx.previewImage({
      current: src, // 当前显示的图片
      // urls: imgs, // 预览的图片数组
      urls: images,
    });
  },
  onPreviewImage(e) {
    const src = e.currentTarget.dataset.src;
    var images = [src];
    wx.previewImage({
      current: src, // 当前显示的图片
      // urls: this.data.images // 预览的图片数组
      urls: images,
    });
  },
  onSwitchContactBtn(e) {
    const id = e.currentTarget.dataset.id;
    const newData = {};
    [{name: 'showServiceBtn', id: "1"}, {name: 'showFlushBtn', id: "2"}, {name: 'showReplyBtn', id: "3"}, {name: 'showUsersBtn', id: "4"}].forEach(k => {
      newData[k.name] = (k.id === id) ? !this.data[k.name] : false;
    });
    this.setData(newData);
  },
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
  onCloseEvaBoard() {
    this.setData({
      showEvaBoard: false,
    }, () => {
      // 此时弹窗已从视图上消失（至少已完成一次渲染）
      if (this.data.isUse) {
        this.getAddrDistance();
      }
    });
  },
  isShowEvaBoard(e) {
    const data = e.currentTarget.dataset.item;
    const fd = {
      baseUrl: BASE_URL,
      openid: this.data.openid,
      img: this.data.avatarUrl,
      group_id: data.id,
      addr: data.tags[0],
      nickname: this.data.nick_name,
      sport_key: this.data.defaultSportKey
    }
    this.setData({
      showEvaBoard: true,
      evaluate_list: data.user_reviews,
      info_data: fd
    });
  },
  async onChooseAvatar(e) {
    const { avatarUrl } = e.detail 
    this.setData({
      avatarUrl,
    })
    try {
      const reqData = {file: avatarUrl, name: this.data.openid+".png", is_user_upload: 1}
      const resp = await this.uploadFileApi(reqData);
      const fr = JSON.parse(resp);
      if (fr.code != 1000) {
        Toast.fail(fr.code);
        return;
      }
      if (reqData.is_user_upload == 1) {
        if (fr.other_data.openid && fr.other_data.img) {
          wx.setStorageSync('openid', fr.other_data.openid);
          wx.setStorageSync('img', fr.other_data.img);
          wx.setStorageSync('nickname', fr.other_data.nick_name);
        }
      }
    } catch (err) {
      Toast.fail(err.code);
    }
  },
  uploadFileApi(data) {
    return new Promise((resolve, reject) => {
      wx.uploadFile({
        url: `${BASE_URL}/wx-upload?uid=${this.data.openid}&filename=${data.name}&user_upload=${data.is_user_upload}&nick_name=${this.data.nick_name}`,
        timeout: 15000,
        filePath: data.file,
        name: 'file',
        success: function (res) {
          if (res.statusCode != 200) {
            reject({msg: res.statusCode, code: 401});
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
          nick_name: this.data.nick_name,
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
          Toast.success(data.hasJoined ? '已退出组队' : '已加入组队');
        } catch (error) {
          Toast.fail(error.code);
        }
      })
      .catch(() => {
      });
  },
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
    this.setData({
      showChatRoom: true,
    });
    // if (this.data.openid == app.globalData.admin) {
    //   this.setData({
    //     showChatRoom: true,
    //   });
    // }
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
    this.onClose();
  },
  getSportType() {
    const data = storage("sport");
    if (data) {
      this.setData({
        defaultSportKey: data.key,
        defaultSportSquare: data.name,
      });
    }
  },
  getSiteSelection() {
    try {
      // const sss = await this.cusGetStorage(this.data.sportSelectedCacheKey);
      const sss = storage("sport");
      const nd = this.data.all_sport_list.map((item) => {
        if (item.key == sss.key) {
          item.checked = true;
        } else {
          item.checked = false;
        }
        return item;
      });
      
      this.setData({
        all_sport_list: nd,
        defaultSportKey: sss.key,
        defaultSportSquare: sss.name,
      });
      storage("sport", {key: sss.key, name: sss.name});
    } catch (error) {
      console.log("缓存失效");
    }
  },
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
            showSportsList: false,
          });
        }
      } catch (error) {
        this.cusSetStorage(this.data.sportsCacheKey, 2);
        this.setData({
          showSportsList: false,
        });
      }
      
    }
  },
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
    // this.cusSetStorage(this.data.sportSelectedCacheKey, sd);
    storage("sport", {key: sd.key, name: sd.name});
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
              isAdminShow: true,
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
          // this.isShowSportList();
          // Toast.loading({
          //   message: this.data.loadText,
          //   forbidClick: true,
          //   duration: 0,
          // });
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
    // this.getSiteSelection();
  },
  // 隐私协议， 1：同意，2：拒绝
  iAacceptPrivacy(e) {
    const res = e.currentTarget.dataset.item;
    if (res == 1) {
      if (!this.data.privacyCheckedVal) {
        Toast.fail("请勾选协议");
        return;
      }
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
            Toast.loading({
              message: this.data.loadText,
              forbidClick: true,
              duration: 0,
            });
            if (this.data.isUse) {
              this.getAddrDistance();
            }
          }
          // this.isShowSportList();
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
      }, 1000)
    }
  },
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
        } if (item.customize == 2) {
          item.disable = this.data.isShowAllData;
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
  refuseAddAddrReqApi(data) {
    return new Promise((resolve, reject) => {
      wx.request({
        url: `${BASE_URL}/add-square-refuse?uid=${this.data.openid}`,
        method: "POST",
        timeout: 10000,
        data: JSON.stringify(data),
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
  passAddAddrReqApi(data) {
    return new Promise((resolve, reject) => {
      wx.request({
        url: `${BASE_URL}/add-square-pass?uid=${this.data.openid}`,
        method: "POST",
        timeout: 10000,
        header: {
          "Content-Type": "application/json", // 一定要加
        },
        data: JSON.stringify(data),
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
  async onAdd(e) {
    const addData = e.currentTarget.dataset.value;
    try {
      await Dialog.confirm({
        title: '确认添加',
        message: `确认添加 '${addData.addr}' 吗？`
      }).then(async () =>{
        wx.showLoading({
          title: '添加中...',
        })
        const pdd = await this.passAddAddrReqApi(addData);
        if (pdd.code != 1000) {
          Toast.fail("添加失败");
          wx.hideLoading();
          return;
        }
        this.setData({
          checkListData: pdd.data,
        });
        Toast.success("添加成功");
        wx.hideLoading();
      }).catch(() => {
        wx.hideLoading();
      })
      
      // const pdd = await this.passAddAddrReqApi(addData);
      // if (pdd.code != 1000) {
        
      //   Toast.fail("添加失败");
      //   return;
      // }
      // this.setData({
      //   checkListData: pdd.data,
      // });
      // Toast.success("添加成功");
      } catch (err) {
        console.log('取消或失败:', err);
      }
  },
  async onDelete(e) {
    const delData = e.currentTarget.dataset.value;
    try {
      await Dialog.confirm({
        title: '确认删除',
        message: `确认删除 '${delData.addr}' 吗？`
      });
      const fd = {
        id: delData.id, 
        city: delData.sport_key, 
        update_type: delData.update_type,
        img: delData.img,
      }
      const pdd = await this.refuseAddAddrReqApi(fd);
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
  async onConfirmAddPlace() {
    const val = this.data.villageInfo;
    const val2 = this.data.placeTag;
    const fileList = this.data.fileList;
    if (val == "") {
      this.onClose();
      Toast.fail("地址不能为空");
      return;
    }
    if (val2 == "") {
      this.onClose();
      Toast.fail("简称不能为空");
      return;
    }
    if (fileList.length == 0) {
      this.onClose();
      Toast.fail("图片不能为空");
      return;
    }

    const respTx = await this.txMapSearchAddrApi(this.data.villageInfo);
    if (respTx.status != 1000) {
      Notify({type: 'danger', message: '输入的地址无效', duration: 30000});
      return;
    }
    this.onClose();
    const uuid = generateUUID();
    var url = "";
    Toast.loading({
      message: '正在提交...',
      forbidClick: true,
    });
    if (fileList.length > 0) {
      const imgname = uuid+".png";
      const filedata = {file: fileList[0].url, name: imgname, is_user_upload: 2};
      try {
        const resp = await this.uploadFileApi(filedata);
        const nr = JSON.parse(resp);
        if (nr.code == 1000) {
          url = `${IMG_URL}/${imgname}`;
        } else {
          Toast.fail("图片上传失败1");
          // Toast.clear();
          return;
        }
      } catch (err) {
        Toast.fail(err.msg);
        // Toast.clear();
        return;
      }
    }
    const ad = {
      id: uuid,
      aid: uuid,
      user_id: this.data.openid,
      addr: this.data.villageInfo,
      lat: respTx.lat,
      lng: respTx.lng,
      city: this.data.city,
      sport_key: this.data.defaultSportKey,
      tags: val2 ? val2 : this.data.defaultSportSquare,
      img: url, // 场地图片
      nick_name: this.data.nick_name,
      user_img: this.data.avatarUrl,
      openid: this.data.openid,
      content: "",
      time: getCurrentTime(),
      update_type: "1",
    }
    const resp = await this.userAddAddrReqApi(ad);
    if (resp.code != 1000) {
      Notify({ type: 'danger', message:  resp.msg ? resp.msg : "添加地址失败, 请联系管理员", duration: 20000 });
      Toast.clear();
      return;
    }
    Notify({ type: 'success', message: "地址已提交,审核通过会更新到页面上", duration: 10000 });
    Toast.clear();
  },
  onClose() {
    this.setData({ addVillage: false, 
      showCheckList: false, 
      showSportsList: false,
      showChoose: false,
      showSpPop: false,
    });
  },
  onClearInput(e) {
    if (e.currentTarget.dataset.value != "") {
      const data = {detail: {value: ""}};
      this.getVal(data);
    }
  },
  async newGetVal(e) {
    const val = e.detail;
    this.setData({
      inputValue: val,
    });
    // var fd = this.data.basketSquareData.filter(item => item.addr.includes(val));
    const fd = this.data.basketSquareData.filter(item => {
      const addrMatch = item.addr.includes(val);
      const tagsMatch = item.tags.some(tag => tag.includes(val));
      return addrMatch || tagsMatch;
    });
    const disSortList = fd.sort((a, b) => a.distance - b.distance);
     // 等待所有异步任务都完成
     const newUL = await Promise.all(
      disSortList.map(async (item) => {
        const dl = item.user_reviews;
        dl.map((item) => {
          if (item.like_users.length > 0) {
            item.is_like = item.like_users.includes(this.data.openid);
          }
          return item;
        })
        dl.sort((a, b) => {
          return stringToTimestamp(b.time) - stringToTimestamp(a.time);
        });
        item.user_reviews = dl;
        item.user_reviews_count = dl.length;

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
      totalData: processedList.length,
    });
  },
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
  sendMsg(e) {
    const id = e.currentTarget.dataset.item;
    const img = this.data.all_sport_list.find(item => item.key == this.data.defaultSportKey);
    wx.navigateTo({
      url: `/pages/chat/chat?id=${id.id}&ava_img=${this.data.avatarUrl}&nick_name=${this.data.nick_name}&addr=${id.addr}&lat=${id.lat}&lng=${id.lng}&user_id=${this.data.openid}&sender_id=${md5(this.data.openid)}&img=${img.img}&tag=${id.tags[0]}`,
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
      Toast.fail("请先阅读用户须知内容");
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
        basketSquareData: allData.other_data,
        chooseList: allData.filter_data,
        venue_count: allData.venues.length,
        isActive: 1,
      });
      const newList = this.data.basketSquareData;
      const disSortList = newList.sort((a, b) => a.distance - b.distance);
      // 等待所有异步任务都完成
      const newUL = await Promise.all(
        disSortList.map(async (item) => {
          const dl = item.user_reviews;
          dl.map((item) => {
            if (item.like_users.length > 0) {
              item.is_like = item.like_users.includes(this.data.openid);
            }
            return item;
          })
          dl.sort((a, b) => {
            return stringToTimestamp(b.time) - stringToTimestamp(a.time);
          });
          item.user_reviews = dl;
          item.user_reviews_count = dl.length;
          return item;
        })
      );
      const processedList = newUL.map(item => {
        const hasJoined = (item.join_users || []).some(user =>
          user.group_id === item.id && user.user === this.data.openid
        );
        return {
          ...item,       
          hasJoined      
        };
      });
      this.setData({
        basketSquareFilterData: processedList,
        isEmpty: false,
        isInput: false,
        totalData: processedList.length,
        isShowAllData: allData.data,
        loadText: "获取数据中...",
        isSwitchData: false,
        isActiveTitle: 3,
      });
      this.showGoodBtn();
      this.getBasketSquareFilter();
      wx.stopPullDownRefresh();
      Toast.clear();
    } else {
      wx.stopPullDownRefresh();
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
  getOpenid() {
    let that = this;
    app.login().then(resp => {
      that.setData({
        openid: resp.openid,
        avatarUrl: resp.img,
        userid: "user_"+md5(resp.openid),
        nick_name: resp.nickname,
        img_url: IMG_URL,
        admin: app.globalData.admin,
      });
      
      that.isShowPrivacy();
    }).catch(err => {
      console.error('登录失败:', err);
    });
  },
  // 设置当前页的标题
  // setNavigatInfo() {
  //   wx.setNavigationBarColor({
  //     frontColor: "#ffffff",
  //     backgroundColor: "#256d64",
  //   });
  //   wx.setNavigationBarTitle({
  //     title: "",
  //   });
  // },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    // this.setNavigatInfo();
    this.getOpenid();
    this.getSportType();
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