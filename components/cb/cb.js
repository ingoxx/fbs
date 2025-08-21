// miniprogram_npm/cb/cb.js
const { getCurrentTime, stringToTimestamp } = require('../../utils/util'); 
import Toast from '@vant/weapp/toast/toast';
const md5 = require('../../utils/md5');
Component({

  /**
   * 组件的属性列表
   */
  properties: {
    evaluate_list: {
      type: Object,
      value: '',
    },
    info_data: {
      type: Object,
      value: '',
    },
  },

  /**
   * 组件的初始数据
   */
  data: {
    evaluate_list: [],
    info_data: {},
    baseUrl: "",
    total_evaluate: 0,
    value: "",
    toView: "",
    liked: false,
    likeCount: 0,
    likedText: "",
    likeLocks: {},
    addr: "",
    nickname: "",
    showCloseBtn: false,
  },
  
  lifetimes: {
    attached() {
      const {  evaluate_list, info_data } = this.properties;
      const te = evaluate_list.length;
      this.setData({
        evaluate_list: evaluate_list,
        info_data: info_data,
        baseUrl: info_data.baseUrl,
        total_evaluate: te,
        addr: info_data.addr,
        nickname: info_data.nickname
      });
    },
    detached() {
      console.log('组件销毁，清除一些连接');
      
    }
  },
  /**
   * 组件的方法列表
   */
  methods: {
    onPreviewImage(e) {
      const src = e.currentTarget.dataset.src;
      var images = [src];
      wx.previewImage({
        current: src, // 当前显示的图片
        // urls: this.data.images // 预览的图片数组
        urls: images,
      });
    },
    onClearInput(e) {
      this.setData({
        value: "",
        showCloseBtn: false,
      });
    },
    onInput(e) {
      const data = e.detail.value;
      this.setData({
        value: data,
        showCloseBtn: data.length > 0,
      });
    },
    async submitSquareEvaluate() {
      if (this.data.value == "") {
        Toast.fail("输入赞美提交");
        return;
      }
      const fd = {
        user: this.data.info_data.openid,
        img: this.data.info_data.img,
        group_id: this.data.info_data.group_id,
        evaluate: this.data.value,
        nick_name: this.data.info_data.nickname,
        time: getCurrentTime()
      }
      try {
        const resp1 = await this.submitSquareEvaluateApi(fd);
        if (resp1.code != 1000) {
          Toast.fail("赞美失败");
          return;
        }

        const dl = resp1.data;
        dl.sort((a, b) => {
          return stringToTimestamp(b.time) - stringToTimestamp(a.time);
        });
        
        Toast.success("赞美成功");
        this.setData({
          evaluate_list: dl,
        });
      } catch (error) {
        Toast.fail("请求失败");
        return;
      }
    },
    // 用户点赞评论
    userLikedReviewsApi(data, lockPath) {
      return new Promise((resolve, reject) => {
        wx.request({
          url: `${this.data.baseUrl}/user-liked-reviews?uid=${this.data.info_data.openid}&key=${this.data.info_data.sport_key}`,
          timeout: 10000,
          method: "POST",
          data: data,
          success: (res) => {
            if (res.statusCode == 200) {
              resolve(res.data);
            } else {
              reject({msg: '网络错误', code: 400, path: 'user-liked-reviews'});
            }
          },
          fail: (err) => {
            reject({msg: '网络错误', code: 401, path: 'user-liked-reviews'});
          },
          complete: () => {
            this.setData({ [lockPath]: false });
          }
        })
      })
    },
    // 点赞
    async toggleLike(e) {
      const { index } = e.currentTarget.dataset;         // 用 index，不用 id，当作锁的 key
      const lockPath = `likeLocks[${index}]`;
      if (this.data.likeLocks && this.data.likeLocks[index]) return;

      // 上锁
      this.setData({ [lockPath]: true });

      const prev = this.data.evaluate_list[index];
      if (!prev) {
        this.setData({ [lockPath]: false });
        return;
      }

      // 计算下一状态：第二次点击 => 取消点赞
      const nextLiked = !prev.is_like;
      const nextCount = Math.max(0, (prev.like || 0) + (nextLiked ? 1 : -1));

      const base = `evaluate_list[${index}]`;

      // 乐观更新（立刻变红/变灰 & 数量加减）
      this.setData({
        [`${base}.is_like`]: nextLiked,
        [`${base}.like`]: nextCount
      });

      // —— 如果暂时没有后端，可直接解锁 —— //
      // this.setData({ [lockPath]: false });

      const item = e.currentTarget.dataset.item;
      item.user = this.data.info_data.openid;
      item.is_like = nextLiked;
      try {
        const resp = await this.userLikedReviewsApi(item, lockPath);
        if (resp.code != 1000) {
          Toast.fail("网络错误");
          return;
        }
        const dl = resp.data;
        dl.map((item) => {
          item.is_like = item.like_users.includes(this.data.info_data.openid);
          return item;
        })
        dl.sort((a, b) => {
          return stringToTimestamp(b.time) - stringToTimestamp(a.time);
        });

        this.setData({
          evaluate_list: dl,
        })
      } catch (error) {
        Toast.fail("网络错误");
        return;
      }
    },
    // 用户提交对谋个场地的评价api
    submitSquareEvaluateApi(data) {
      return new Promise((resolve, reject) => {
        wx.request({
          url: `${this.data.baseUrl}/update-sport-reviews?uid=${this.data.info_data.openid}&key=${this.data.info_data.sport_key}`,
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
  }
})