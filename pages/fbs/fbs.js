// pages/fbs/fbs.js
// import QQMapWX from '../../libs/qqmap-wx-jssdk.js'
const app = getApp();
var QQMapWX = require('../../lib/qqmap-wx-jssdk.js');
const { WSS_URL } = require('../../utils/http');
const { BASE_URL } = require('../../utils/http');
const { IMG_URL } = require('../../utils/http');
// import Notify from '@vant/weapp/notify/notify';
import Toast from '@vant/weapp/toast/toast';
const { generateUUID, stringToTimestamp, getCurrentTime, storage, isValidDateTime } = require('../../utils/util'); 
import Dialog from '@vant/weapp/dialog/dialog';
const md5 = require('../../utils/md5');

Page({
  data: {
    current_selected_id: "",
    wxDate: "",
    p_data: {addr: "", lng: "", lat: "", title: ""},
    isSwitchData: false,
    sp_time: "",
    titleName: "",
    isActiveTitle: 3,
    golbal_rid: "",
    pub_btn_text: "",
    titles: [],
    mChecked: false,
    fmChecked: false,
    filterUserPublishList: [],
    userPublishList: [],
    showSpPop: false,
    sp_players: "",
    sp_content: "",
    sp_price: "",
    sp_required: "",
    venue_count: 0,
    admin: "",
    isLock: false,
    cus_icon: "🏅",
    isActive: 1,
    chooseList: [],
    filterChooseList: [],
    showChoose: false,
    isShowAllData: false,
    isShowGoodPage: false,
    totalData: 0,
    showSettingCenter: false,
    showUserUpdateList: false,
    userPublishCount: 0,
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
    showPublishHistoryPop: false,
    villageInfo: '',
    useNotice: "下拉小程序以获取附近运动场地址",
    lat: 0,
    lng: 0,
    inputValue: "",
    markers: [],
    currentSquareSelected: 2,
    basketSquareFilter: [],
    all_sport_list: [],
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
    showPubRm: false,
    cov_data: {},
    filterSpData: [],
    spData: [],
    selectedTime: "",
    chosen: "",
    pickerVisible: true,
    pub_control: true,
    showTeamType: false,
    selectTeamType: 1,
    group_type: [],
    venue_data: {},
    group_type_name: "",
    is_in_group: false,
    select_addr: "",
    ysz_btn: "",
    jj_btn: "",
    qd_btn: "",
    showSports: false,
    sp_venue: "",
    sp_key: "",
  },

  /**
   * 3D卡片翻转切换处理函数
   */
  toggleCardFlip(e) {
    const id =  e.currentTarget.dataset.id;
    this.setData({
      current_selected_id: id,
    });
    const index = e.currentTarget.dataset.index;
    const list = this.data.basketSquareFilterData;
    if (index !== undefined && list[index]) {
      const currentFlipped = !!list[index].isFlipped;
      const key = `basketSquareFilterData[${index}].isFlipped`;
      this.setData({
        [key]: !currentFlipped
      });
    }
  },

  /**
   * 微信二维码上传与持久化展示
   */
  async uploadQrCode(e) {
    const index = e.currentTarget.dataset.index;
    const item = this.data.basketSquareFilterData[index];
    if (!item) return;

    try {
      // 1. 选择本地二维码图片
      const res = await new Promise((resolve, reject) => {
        wx.chooseMedia({
          count: 1,
          mediaType: ['image'],
          sourceType: ['album', 'camera'],
          success: resolve,
          fail: reject
        });
      });

      if (!res.tempFiles || res.tempFiles.length === 0) return;

      Toast.loading({
        message: '正在上传二维码...',
        forbidClick: true,
        duration: 0
      });

      const tempFilePath = res.tempFiles[0].tempFilePath;
      // 生成唯一文件名
      const imgName = `qr_${item.id}_${Date.now()}.png`;

      // 2. 调用已有的 uploadFileApi 接口上传文件到服务器
      const uploadResp = await this.uploadFileApi({
        file: tempFilePath,
        name: imgName,
        is_user_upload: 3
      });

      const result = typeof uploadResp === 'string' ? JSON.parse(uploadResp) : uploadResp;

      if (result.code === 1000) {
        // 3. 拼接服务器永久图片网络 URL
        const persistentUrl = result.url || `${IMG_URL}/${imgName}`;

        // 4. 获取当前卡片现有二维码列表并追加
        const currentQrList = item.qrList || [];
        const updatedQrList = [...currentQrList, persistentUrl];

        // 5. 更新页面 Data 实时渲染
        const key = `basketSquareFilterData[${index}].qrList`;
        this.setData({
          [key]: updatedQrList
        });

        // 6. 持久化存储到本地 Storage (以场地 ID 为 key)
        const storageKey = `venue_qr_${item.id}`;
        wx.setStorageSync(storageKey, updatedQrList);

        Toast.success('二维码上传成功');
      } else {
        Toast.fail('上传失败: ' + (result.code || '未知错误'));
      }
    } catch (err) {
      console.error('上传二维码出错:', err);
      Toast.clear();
    }
  },

  /**
   * 预览微信二维码大图
   */
  previewQrCode(e) {
    const src = e.currentTarget.dataset.src;
    const imgs = e.currentTarget.dataset.imgs;
    wx.previewImage({
      current: src,
      urls: imgs
    });
  },

  getRandom1to4() {
    return Math.floor(Math.random() * 4) + 1;
  },
  onConfirmNewSp() {
    if (!this.data.sp_venue) {
      Toast.fail("请输入运动类型");
      return;
    }
    if (!this.data.sp_key) {
      Toast.fail("请输入运动key");
      return;
    }
    const all_sports = this.data.all_sport_list;
    const data = {
      title: this.data.sp_venue, 
      name: `${this.data.cus_icon} ${this.data.sp_venue}`, 
      key: this.data.sp_key, 
      checked: false, 
      icon: this.data.cus_icon, 
      img: "https://ai.anythingai.online/static/profile3/cus_bg.png", 
      sport_img: `https://ai.anythingai.online/static/profile3/sp${this.getRandom1to4()}.svg`,
    }
    Dialog.confirm({
      title: '',
      message: "确定添加吗？"
    }).then(() =>{
      all_sports.unshift(data);
      this.setData({
        all_sport_list: all_sports,
        isActiveTitle: 3,
      });
      wx.setStorageSync('sport_list', all_sports);
      Toast.success("已添加");
      this.onClose();
    }).catch(() => {
    })
  },
  onChangeSpKeyField(e) {
    const value = e.detail;
    this.setData({sp_key: value});
  },
  onChangeSpVenueField(e) {
    const value = e.detail;
    this.setData({sp_venue: value});
  },
  selectSportType(e) {
    const id = e.currentTarget.dataset.id;
    this.setData({
      selectTeamType: id,
    })
  },
  formatTimestamp(timestamp, format = "yyyy-MM-dd HH:mm:ss") {
    const date = new Date(Number(timestamp));
    const pad = n => n.toString().padStart(2, '0');
  
    const map = {
      "yyyy": date.getFullYear(),
      "MM": pad(date.getMonth() + 1),
      "dd": pad(date.getDate()),
      "HH": pad(date.getHours()),
      "mm": pad(date.getMinutes()),
      "ss": pad(date.getSeconds())
    };
  
    return format.replace(/yyyy|MM|dd|HH|mm|ss/g, matched => map[matched]);
  },
  onDtChange(e) {
    this.setData({ sp_time: this.formatTimestamp(e.detail.timestamp) });
    console.log('timestamp', this.formatTimestamp(e.detail.timestamp));
  },
  isPositiveInteger(val) {
    return /^[1-9]\d*$/.test(val);
  },
  searchPublishHistory(e) {
    const val = e.detail;
    const data = this.data.userPublishList;
    if (val == "") {
      this.setData({
        filterUserPublishList: data,
        userPublishCount: data.length,
      });
      return;
    }
    this.setData({
      userVal: val,
    });

    const fd = this.data.filterUserPublishList.filter(item => {
      const contentMatch = item.content.includes(val);
      return contentMatch;
    });
    this.setData({
      filterUserPublishList: fd,
      userPublishCount: fd.length,
    });
  },
  getUserSelfPulDataApi() {
    return new Promise((resolve, reject) => {
      wx.request({
        url: `${this.data.baseUrl}/get-user-publish-data?uid=${this.data.user_id}`,
        timeout: 10000,
        success: function (res) {
          resolve(res.data);
        },
        fail: function (err) {
          console.log(err);
          reject(err)
        }
      })
    });
  },
  async openPublishList() {
    try {
      const resp = await this.getUserSelfPulDataApi();
      if (resp.code != 1000) {
        Toast.fail(`请求失败1: ${resp.code}`);
        return;
      }
      const fd = resp.data;
      fd.sort((a, b) => {
        return stringToTimestamp(b.time) - stringToTimestamp(a.time);
      });
      this.setData({
        filterUserPublishList: fd,
        userPublishList: fd,
        userPublishCount: fd.length,
        showPublishHistoryPop: true,
      });
    } catch (error) {
      Toast.fail("请求失败2");
    }
  },
  updateTaskStatusApi(data) {
    return new Promise((resolve, reject) => {
      wx.request({
        url: `${this.data.baseUrl}/update-single-publish-data?uid=${this.data.user_id}`,
        timeout: 10000,
        method:"POST",
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
  adminGetTaskBySportTpApi() {
    return new Promise((resolve, reject) => {
      wx.request({
        url: `${this.data.baseUrl}/get-all-user-publish-data?uid=${this.data.user_id}&sport_key=${this.data.defaultSportKey}`,
        timeout: 10000,
        success: function (res) {
          resolve(res.data);
        },
        fail: function (err) {
          reject(err)
        },
        complete: () => {
          wx.stopPullDownRefresh();
        }
      })
    });
  },
  userGetTaskByCityAndSportTpApi() {
    return new Promise((resolve, reject) => {
      wx.request({
        url: `${this.data.baseUrl}/get-task-by-city-sport?uid=${this.data.user_id}&city=${this.data.city}&sport_key=${this.data.defaultSportKey}`,
        timeout: 10000,
        success: function (res) {
          resolve(res.data);
        },
        fail: function (err) {
          reject(err)
        },
        complete: () => {
          wx.stopPullDownRefresh();
        }
      })
    });
  },
  createRidApi(date) {
    return new Promise((resolve, reject) => {
      wx.request({
        url: `${this.data.baseUrl}/create-user-rid?uid=${this.data.user_id}`,
        timeout: 10000,
        method: "POST",
        data: date, 
        success: function (res) {
          resolve(res.data);
        },
        fail: function (err) {
          reject(err)
        }
      })
    });
  },
  flushSpData(data) {
    data.sort((a, b) => {
      return stringToTimestamp(b.time) - stringToTimestamp(a.time);
    });
    return data;
  },
  user_del_sp(e) {
    const data = e.currentTarget.dataset.item;
    if (data.is_del || this.data.pub_control) {
      return;
    }
    Dialog.confirm({
      title: "",
      message: "确定删除吗？",
    }).then(async () => {
      Toast.loading({
        message: '删除中...',
        forbidClick: true,
      });
      const fd = {
        id: data.id,
        user_id: data.user_id,
        city: data.city,
        sport_key: data.sport_key,
        status: 2 
      };
      const resp = await this.updateTaskStatusApi(fd);
      if (resp.code != 1000) {
        Toast.fail(`删除失败1:${resp.code}`);
        return;
      }

      const sd = resp.data;
      const usd = this.data.filterUserPublishList;
      const nd = usd.filter(item => item.id != data.id);
      this.setData({
        filterSpData: this.flushSpData(sd),
        spData: this.flushSpData(sd),
        spDataNum: sd.length,
        filterUserPublishList: this.flushSpData(nd),
        userPublishList: this.flushSpData(nd),
        userPublishCount: nd.length,
      });

      Toast.success("删除完成");
    })
    .catch(() => {
    });
  },
  async cov_detail_pop(e) {
    const data = e.currentTarget.dataset.item;
    if (data.is_del || this.data.pub_control) {
      return;
    }
    if (this.data.openid != data.user_id) {
      Toast.loading({
        message: "正在接入中...",
        forbidClick: true,
        duration: 0,
      });
      try {
        const rd = {
          tid: data.id,
          nick_name: this.data.nick_name, 
          img: this.data.avatarUrl,
          city: this.data.city,
          user_id: this.data.openid
        };
        const resp = await this.createRidApi(rd);
        if (resp.code != 1000) {
          Toast.fail(`请求失败: ${resp.code}`);
          return;
        }
        data.rid = resp.data.rid;
        this.setData({
          cov_data: data,
          showPubRm: true,
        });
        Toast.success("接入成功, 发送信息吧");
      } catch (error) {
        Toast.fail(`请求失败: ${error}`);
      }
      return;
    } 
    this.setData({
      cov_data: data,
      showPubRm: true,
    });
  },
  async put_out() {
    var gender_req = "";
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
  diffFilterKeyWork() {
    const choose = this.data.chooseList;
    const tag = this.data.isActiveTitle;
    var isActive = 1;
    var chs = 0;
    if (tag == 3) {
      chs = 1000;
    } else if (tag == 4) {
      isActive = 5;
      chs = 2000;
    }
    const nc = choose.filter(item => item.type == chs);
    const uc = nc.filter(item => {
      if (item.id == 6 && this.data.openid != app.globalData.admin) {
        return false;
      }
      return true;
    });
    this.setData({
      filterChooseList: uc,
      isActive: isActive,
    })
  },
  async getLatestSpData() {
    Toast.loading({
      message: "正在获取最新陪练信息...",
      forbidClick: true,
      duration: 0,
    });

    if (this.data.openid == app.globalData.admin) {
      try {
        const resp = await this.adminGetTaskBySportTpApi();
        if (resp.code != 1000) {
          Toast.fail(`获取发布数据失败1: ${resp.code}`);
          return;
        }
        const fd = resp.data;
        fd.sort((a, b) => {
          return stringToTimestamp(b.time) - stringToTimestamp(a.time);
        });

        this.setData({
          filterSpData: fd,
          spData: fd,
          spDataNum: fd.length,
          pub_control: resp.pub_control,
        });
        Toast.clear();
        wx.stopPullDownRefresh();
      } catch (error) {
        Toast.fail("获取发布数据失败2");
      }
    } else {
      try {
        const resp = await this.userGetTaskByCityAndSportTpApi();
        if (resp.code != 1000) {
          Toast.fail(`获取发布数据失败3: ${resp.code}`);
          return;
        }
        const fd = resp.data;
        fd.filter(item => !item.is_del);
        fd.sort((a, b) => {
          return stringToTimestamp(b.time) - stringToTimestamp(a.time);
        });
        this.setData({
          filterSpData: fd,
          spData: fd,
          spDataNum: fd.length,
          pub_control: resp.pub_control,
        });
        Toast.clear();
        wx.stopPullDownRefresh();
      } catch (error) {
        Toast.fail("获取发布数据失败4");
      }
    }
  },
  async onConfirmSportSelection2(e) {
    const id = e.currentTarget.dataset.id;
    if (id == 5) {
      this.setData({
        isActiveTitle: id,
        showSports: true,
      });
      return;
    }
    if (this.data.isActiveTitle != id) {
      var swi = false;
      if (id == 3) {
        swi = false
      } else if (id == 4) {
        swi = true
      }
      this.setData({
        isActiveTitle: id,
        isSwitchData: swi,
      });
      this.diffFilterKeyWork();
      if (id == 4) {
        this.getLatestSpData();
      }
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
      sp_venue: "",
      sp_key: "",
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

    if (!this.isPositiveInteger(this.data.sp_price)) {
      Toast.fail("价格只能是整数");
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

    if (!this.isPositiveInteger(this.data.sp_players)) {
      Toast.fail("人数只能是整数");
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
      var gender_req = "";
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
        if (resp.code != 1000) {
          Toast.fail("发布失败1: ", resp.code);
          return;
        }
        Toast.success("发布成功");
        this.getLatestSpData();
        this.setData({
          isActiveTitle: 4,
          isSwitchData: true,
          spData: resp.data,
          filterSpData: resp.data,
        });
        this.diffFilterKeyWork();
        this.onClose();
      } catch (error) {
        Toast.fail("发布失败2: ", resp.code);
        this.onClose();
      }
      })
      .catch(() => {
      });
  },
  onCloseAllPop() {
    this.setData({
      showServiceBtn: false,
    });
  },
  filterSpDetail() {
    var data = [];
    const data2 = this.data.filterSpData;
    const data1 = this.data.spData;
    const aid = this.data.isActive;
    if (aid == 4) {
      data = data2.sort((a, b) => {
        if (a.is_del) return 1;
        if (b.is_del) return -1;
        return b.price - a.price; 
      });
    } else if (aid == 5) {
      this.getLatestSpData();
      this.onClose();
      return;
    } else if (aid == 6) {
      data = data1.filter(item => item.is_del);
    } else if (aid == 7) {
      data = data1.filter(item => item.is_del == false);
    }

    this.setData({
      filterSpData: data,
    });
    Toast.success("筛选完成");
    this.onClose();
  },
  filterVenueDetail() {
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
  onFilterVenueData() {
    const tid = this.data.isActiveTitle;
    if (tid == 3) {
      this.filterVenueDetail();
    } else if (tid == 4) {
      this.filterSpDetail();
    }
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
      is_in_group: true,
    })
  },
  showUserImgShape(e) {
    const data = e.currentTarget.dataset.item;
    const allData = e.currentTarget.dataset.val;
    const title = allData.title
    const sid = e.currentTarget.dataset.id;
    const t = this.data.group_type.find(item => item.id == sid)?.name
    const hasIn = data.some(item => item.user === this.data.openid);
    data.sort((a, b) => {
      return stringToTimestamp(b.time) - stringToTimestamp(a.time);
    });
    this.setData({
      showGroupList: !this.data.showGroupList,
      filter_user_list_two: data,
      user_list: data,
      userCount: data.length,
      bks_name: title,
      group_type_name: t,
      is_in_group: !hasIn,
      venue_data: allData,
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
        return;
      }
      const fd = resp.data;
      fd.sort((a, b) => {
        return stringToTimestamp(b.time) - stringToTimestamp(a.time);
      });
      
      this.setData({
        user_list: fd,
        showUserList: true,
        userCount: fd.length,
        filter_user_list: fd.slice(0, 10),
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
          return;
        }
      } catch (err) {
        Toast.fail("图片上传失败: 402");
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
      Toast({ type: 'fail', message: resp.msg ? resp.msg : "操作失败, 请联系管理员", duration: 8000 });
      setTimeout(() => {
        Toast.clear();
      },8000);
      return;
    }
    Toast({ type: 'success', message: "跪谢，图片生效需要几分钟", duration: 3000 });
    this.toggleShowVenueImg(e);
    this.getAddrDistance();
    setTimeout(() => {
      Toast.clear();
    },8000);
  },
  toggleShowVenueImg1(e) {
    if (!this.data.isShowAllData) {
      Toast.fail("已是最新场地图片");
      return;
    }
    const data = e.currentTarget.dataset.item;
    const fd = {
      addr: data.addr+data.title, 
      lng: data.lng, 
      lat: data.lat, 
      title: this.data.city+data.title
    };
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
      this.setData({
        filter_cbt_users: fcu,
        cbt_users: fcu,
      });
    }
    vd[index].is_show = !vd[index].is_show;
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
    const imgs = e.currentTarget.dataset.imgs;
    var images = [src];
    if (imgs && imgs.length > 1) {
      images = imgs;
    }
    wx.previewImage({
      current: src,
      urls: images,
    });
  },
  async onPreviewImage(e) {
    const src = e.currentTarget.dataset.src;
    const data = e.currentTarget.dataset.item;
    try {
      const pdd = await this.getVenueImgApi(data.id);
      if (pdd.code == 1000) {
        this.setData({
          checkListData: pdd.data,
        });
        this.getAddrDistance();
      }
    } catch (err) {
      console.log('取消或失败:', err);
    }

    var images = [src];
    wx.previewImage({
      current: src,
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
    const { avatarUrl } = e.detail;
    this.setData({
      avatarUrl,
    });
    try {
      const reqData = {file: avatarUrl, name: this.data.openid+".png", is_user_upload: 1};
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
        url: `${BASE_URL}/wx-upload?uid=${this.data.openid}&filename=${data.name}&user_upload=${data.is_user_upload}&nick_name=${this.data.nick_name}&id=${this.current_selected_id}&city=${this.city}&sport_key=${this.sp_key}`,
        timeout: 15000,
        filePath: data.file,
        name: 'file',
        success: function (res) {
          if (res.statusCode != 200) {
            reject({msg: res.statusCode, code: 401});
            return;
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
            return;
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
            return;
          }
          resolve(res.data);
        },
        fail: function (err) {
          reject({msg: err, code: 402})
        },
        complete: () => {
          this.onClose();
          this.onCloseGroupList();
        }
      })
    })
  },
  openSelectSportsTypePop(e) {
    const id = this.data.selectTeamType;
    const data = e.currentTarget.dataset.item;
    const ju = data.join_users;
    if (!data.hasJoined) {
      this.setData({
        showTeamType: true,
        venue_data: data,
      });
      return;
    }
    this.joinSportGroup2(e)
  },
  quitSportGroup() {
    const data = this.data.filter_user_list_two;
    const gid = data.find(item => item.user == this.data.openid)?.group_id;
    const gt = data.find(item => item.user === this.data.openid)?.group_type; 
    
    Dialog.confirm({
      title: this.data.bks_name,
      message: '确定退出吗？',
    }).then(async () => {
        const fd = {
          group_id: gid, 
          user: this.data.openid, 
          img: this.data.avatarUrl,
          nick_name: this.data.nick_name,
          oi: "1",
          group_type: gt,
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
          Toast.success('已退出组队');
        } catch (error) {
          Toast.fail("请求失败");
        }
      }).catch((err) => { 
        
      });
  },
  joinSportGroup3() {
    const data = this.data.filter_user_list_two;
    const allData = this.data.venue_data;
    const gt = data[0].group_type; 
    const gid = data[0].group_id;
    const existsAnywhere = Object.values(allData.groupedUsers).some(group => group.some(user => user.user === this.data.openid));
    if (existsAnywhere) {
      Toast.fail("您已经在其他组里，请先退出");
      return;
    }
    Dialog.confirm({
      title: this.data.bks_name,
      message: '确定加入吗？',
    }).then(async () => {
        const fd = {
          group_id: gid, 
          user: this.data.openid, 
          img: this.data.avatarUrl,
          nick_name: this.data.nick_name,
          oi: "2",
          group_type: gt
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
          Toast.fail("请求失败");
        }
      }).catch(() => {
        Toast.fail("内部错误: 500");
      });
  },
  joinSportGroup2(e) {
    const data = e.currentTarget.dataset.item;
    const ju = data.join_users;
    const gt = ju.find(item => item.user === this.data.openid)?.group_type; 
  
    Dialog.confirm({
      title: data.tags[0],
      message: data.hasJoined ? '确定退出吗？' : '确定加入吗？',
    }).then(async () => {
        const fd = {
          group_id: data.id, 
          user: this.data.openid, 
          img: this.data.avatarUrl,
          nick_name: this.data.nick_name,
          oi: data.hasJoined ? "1" : "2",
          group_type: gt,
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
      }).catch(() => {
      });
  },
  joinSportGroup(e) {
    const oi = e.currentTarget.dataset.id;
    const sid = this.data.selectTeamType;
    const data = this.data.venue_data;
    const t = this.data.group_type.find(item => item.id == sid)?.name;
    var title = "";
    if (data.join_user_count == 0) {
      title = `确定加入${t}吗？`
    } else if (data.join_user_count > 0) {
      title = `确定退出${t}吗？`
    }
    Dialog.confirm({
      title: data.tags[0],
      message: title,
    }).then(async () => {
        const fd = {
          group_id: data.id, 
          user: this.data.openid, 
          img: this.data.avatarUrl,
          nick_name: this.data.nick_name,
          oi: oi,
          group_type: this.data.selectTeamType,
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
      }).catch((err) => {
        console.log("joinSportGroupApi err >>> ", err);
      });
  },
  openMapAppDetailed2(e) {
    const data = e.currentTarget.dataset.item;
    wx.openLocation({
      latitude: Number(data.lat),
      longitude: Number(data.lng),
      address: data.addr,
      scale: 18,
      success(res) {
        console.log('打开成功');
      },
      fail(err) {
        console.log('打开失败', err);
      }
    });
  },
  openMapAppDetailed(e) {
    const data = e.currentTarget.dataset.item;
    var addr = "";
    if (data.tags != undefined && data.tags.length > 0) {
      addr = data.addr+data.tags[0];
    } else {
      addr = data.addr;
    }
    wx.openLocation({
      latitude: Number(data.lat),
      longitude: Number(data.lng),
      address: addr,
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
    const sd = e.currentTarget.dataset.id;
    if (sd == 3) {
      const allData = this.data.venue_data;
      const addr = allData.title;
      this.setData({
        showGroupList:false,
        showChatRoom: true,
        select_addr: addr,
      });
      return;
    }
    this.setData({
      showChatRoom: true,
      select_addr: "",
    });
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
    storage("sport", {key: sd.key, name: sd.name});
  },
  openMapApp() {
    wx.openLocation({
      latitude: Number(this.data.lat),
      longitude: Number(this.data.lng),
      address: this.data.addr,
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
      success(res) {},
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
          resolve(JSON.parse(res.data));
        },
        fail(err) {
          reject(err);
        }
      });
    });
  },
  async isShowPrivacy() {
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
          wssUrl: WSS_URL,
          baseUrl: BASE_URL,
          user_id: this.data.openid,
          sender_id: md5(this.data.openid),
        });

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
          const sport_list = wx.getStorageSync('sport_list');
          if (!sport_list) {
            this.getAllSportsApi().then((resp) => {
              if (resp.code == 1000) {
                this.setData({
                  all_sport_list: resp.data,
                });
                wx.setStorageSync('sport_list', resp.data);
              }
            }).catch((err) => {
              Toast.fail("502")
            });
          } else {
            this.setData({
              all_sport_list: sport_list,
            });
          }
          
          if (this.data.isActiveTitle == 3) {
            this.getAddrDistance();
          } else if (this.data.isActiveTitle == 4) {
            this.getLatestSpData();
          }
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
  },
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
              this.getOpenid();
            }
          }
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
      Toast.fail("加载数据失败5");
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
            Toast.clear();
            Toast.fail("加载数据失败6");
            reject(new Error(`HTTP 状态码异常: ${res.statusCode}`));
            return;
          }
          resolve(res.data);
        },
        fail: function (err) {
          Toast.fail("请求失败6");
          reject(err)
        }
      })
    })
  },
  async getBasketSquareFilter() {
    const newBsf = this.data.basketSquareFilter;
    const updatadBsf = await Promise.all(
      newBsf.map(async (item) => {
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
          "Content-Type": "application/json",
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
      Toast.fail("输入的地址无效");
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
          return;
        }
      } catch (err) {
        Toast.fail(err.msg);
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
      img: url,
      nick_name: this.data.nick_name,
      user_img: this.data.avatarUrl,
      openid: this.data.openid,
      content: "",
      time: getCurrentTime(),
      update_type: "1",
    }
    const resp = await this.userAddAddrReqApi(ad);
    if (resp.code != 1000) {
      Toast.fail("添加地址失败, 请联系管理员");
      return;
    }
    Toast.success("地址已提交,验证地址通过会更新到页面上");
  },
  onClose() {
    this.setData({ addVillage: false, 
      showCheckList: false, 
      showSportsList: false,
      showChoose: false,
      showSpPop: false,
      showPubRm: false,
      showPublishHistoryPop:false,
      showTeamType: false,
      showSports: false,
    });
  },
  onClearInput(e) {
    if (e.currentTarget.dataset.value != "") {
      const data = {detail: {value: ""}};
      this.getVal(data);
    }
  },
  async venvuFliterData(e) {
    const val = e.detail;
    this.setData({
      inputValue: val,
    });
    const fd = this.data.basketSquareData.filter(item => {
      const addrMatch = item.addr.includes(val);
      const tagsMatch = item.tags.some(tag => tag.includes(val));
      return addrMatch || tagsMatch;
    });
    const disSortList = fd.sort((a, b) => a.distance - b.distance);
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

      // 读取本地持久化二维码列表
      const storageKey = `venue_qr_${item.id}`;
      const localQrList = wx.getStorageSync(storageKey) || [];
      const serverQrList = item.qrList || item.qr_imgs || [];
      const finalQrList = Array.from(new Set([...serverQrList, ...localQrList]));

      return {
        ...item,
        hasJoined,
        isFlipped: item.isFlipped || false,
        qrList: finalQrList
      };
    });

    this.setData({
      basketSquareFilterData: processedList,
      totalData: processedList.length,
    });
  },
  spFilterData(e) {
    const val = e.detail;
    const data = this.data.spData;
    if (val == "") {
      this.setData({
        filterSpData: data,
        spDataNum: data.length,
      });
      return;
    }
    this.setData({
      inputValue: val,
    });

    const fd = data.filter(item => {
      const contentMatch = item.content.includes(val);
      const dateMatch = item.date.includes(val);
      const priceMatch = item.price.includes(val);
      return contentMatch || dateMatch || priceMatch;
    });
    this.setData({
      filterSpData: fd,
      spDataNum: fd.length,
    });
  },
  newGetVal(e) {
    const tid = this.data.isActiveTitle;
    if (tid == 4) {
      this.spFilterData(e);
    } else {
      this.venvuFliterData(e);
    }
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
      const id = e.currentTarget.dataset.id;
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
              resolve({
                latitude: res.latitude,
                longitude: res.longitude,
                addr: addr,
                city: city,
              })
            },
            fail: geoErr => {
              Toast.fail("无法获取定位1");
              console.log('逆地址解析失败：', geoErr)
              reject(geoErr)
            },
          })
        },
        fail: locErr => {
          Toast.fail("无法获取定位2");
          wx.stopPullDownRefresh();
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
        filterChooseList: allData.filter_data,
        venue_count: allData.venues.length,
        group_type: allData.group_type,
        isActive: 1,
      });
      const newList = this.data.basketSquareData;
      const disSortList = newList.sort((a, b) => a.distance - b.distance);
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

        // 读取本地持久化存储的二维码列表
        const storageKey = `venue_qr_${item.id}`;
        const localQrList = wx.getStorageSync(storageKey) || [];
        const serverQrList = item.qrList || item.qr_imgs || [];
        const finalQrList = Array.from(new Set([...serverQrList, ...localQrList]));

        return {
          ...item,       
          hasJoined,
          isFlipped: false, // 初始化 3D 卡片为不翻转状态
          qrList: finalQrList // 持久化二维码列表
        };
      });
      const pl = processedList.map(v => {
        const groups = { ysz: [], jj: [], qd: [] }
        const filter_groups = { ysz: [], jj: [], qd: [] }
        var ysz_len = 0;
        var jj_len = 0;
        var qd_len = 0;
        v.join_users.forEach(u => {
          switch (u.group_type) {
            case 1: groups.ysz.push(u); break
            case 2: groups.jj.push(u); break
            case 3: groups.qd.push(u); break
          }
        })
        filter_groups.ysz = groups.ysz.slice(0, 10);
        filter_groups.jj = groups.jj.slice(0, 10);
        filter_groups.qd = groups.qd.slice(0, 10);
        ysz_len = groups.ysz.length;
        jj_len = groups.jj.length;
        qd_len = groups.qd.length;
        return { ...v, filterGroupUsers: filter_groups, groupedUsers: groups, ysz_users: ysz_len, jj_users: jj_len, qd_users: qd_len }
      });

      const btn_list = allData.btn;
      var btn_text = "";
      var ysz_btn = this.data.group_type.find(item => item.id == 1)?.name;
      var jj_btn = this.data.group_type.find(item => item.id == 2)?.name;
      var qd_btn = this.data.group_type.find(item => item.id == 3)?.name;
      if (allData.data) {
        const obj = btn_list.find(item => item.id == 2);
        btn_text = obj.name;
      } else {
        const obj = btn_list.find(item => item.id == 1);
        btn_text = obj.name;
      }
      
      this.setData({
        basketSquareFilterData: pl,
        isEmpty: false,
        isInput: false,
        totalData: pl.length,
        isShowAllData: allData.data,
        loadText: "获取数据中...",
        isSwitchData: false,
        isActiveTitle: 3,
        titles: allData.btn,
        pub_btn_text: btn_text,
        ysz_btn: ysz_btn,
        jj_btn: jj_btn,
        qd_btn: qd_btn,
      });
      this.showGoodBtn();
      this.getBasketSquareFilter();
      wx.stopPullDownRefresh();
      this.diffFilterKeyWork();
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
    s = s * 6371.0;
    s = s * 1000;
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

  onLoad(options) {
    this.getOpenid();
    this.getSportType();
  },

  onReady() {},
  onShow() {},
  onHide() {},
  onUnload() {},

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
  onReachBottom() {},
  onShareAppMessage() {}
})