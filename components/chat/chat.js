// miniprogram_npm/chat/chat.js
import Toast from '@vant/weapp/toast/toast';
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    wssUrl: {
      type: String,
      value: '',
    },
    baseUrl: {
      type: String,
      value: '',
    },
    user_id: {
      type: String,
      value: '',
    },
    sender_id: {
      type: String,
      value: '',
    },
  },
  /**
   * 组件的初始数据
   */
  data: {
    group_id_value: "",
    value: '',
    count: 0,
    socket: null,
    sender_id: "",
    user_id: "",
    wssUrl: "",
    baseUrl: "",
    chatData: [
      // {sender_id: 'lxb', content: '大哥', time: '2025-08-06 15:18:15'},
      // {sender_id: 'lxb', content: '大哥', time: '2025-08-06 15:18:15'},
      // {sender_id: 'lxb', content: '大哥', time: '2025-08-06 15:18:15'},
      // {sender_id: 'lxb', content: '大哥', time: '2025-08-06 15:18:15'},
      // {sender_id: 'lxb', content: '大哥', time: '2025-08-06 15:18:15'}
    ],
    filter_groups_data: [],
    groups_data: [],
    socket_list: [],
    toView: '',
    group_id: "",
  },
  /**
   * 组件关闭后的清理
   */
  lifetimes: {
    attached() {
      const { wssUrl, user_id, sender_id, baseUrl } = this.properties;
      this.setData({
        filter_groups_data: this.data.groups_data,
        wssUrl: wssUrl,
        user_id: user_id,
        sender_id:sender_id,
        baseUrl: baseUrl,
      });
      this.getOnlineDataApi().then((resp) => {
        if (resp.code != 1000) {
          Toast.fail("online: ", resp.code);
          return;
        }
        const fd = resp.data.sort((a, b) => b.online_user - a.online_user);
        this.setData({
          groups_data: resp.data,
          filter_groups_data: fd,
        });
        // this.setData({
        //   groups_data: resp.data,
        //   filter_groups_data: resp.data,
        // });
      }).catch((err) => {
        Toast.fail("online err: ", err);
      })
    },
    detached() {
      console.log('组件销毁，清除一些连接');
      const sl = this.data.socket_list;
      if (sl.length > 0) {
        sl.forEach((socket, index) => {
          if (socket) {
            socket.close();
          }
        });
      }
      // if (this.data.socket) {
      //   this.data.socket.close();
      //   console.log('已关闭连接');
      // }
    }
  },
  /**
   * 组件的方法列表
   */
  methods: {
    refreshOnlineData() {
      wx.showLoading({
        title: '刷新中...',
      })
      this.getOnlineDataApi().then((resp) => {
        if (resp.code != 1000) {
          Toast.fail("online: ", resp.code);
          return;
        }
        const fd = resp.data.sort((a, b) => b.online_user - a.online_user);
        this.setData({
          groups_data: resp.data,
          filter_groups_data: fd,
        });
        wx.hideLoading();
      }).catch((err) => {
        Toast.fail("online err: ", err);
        wx.hideLoading();
      })
    },
    getGroupIdSuffix(gid) {
      return gid.replace("group_id_online_", "");
    },
    getOnlineDataApi() {
      return new Promise((resolve, reject) => {
        wx.request({
          url: `${this.data.baseUrl}/get-all-online-data?uid=${this.data.user_id}`,
          timeout: 10000,
          success: function (res) {
            resolve(res.data);
          },
          fail: function (err) {
            reject(err)
          }
        })
      });
    },
    onFilterGroupId(e) {
      const val = e.detail.value;
      var fd = [];
      if (val != "") {
        fd = this.data.groups_data.filter(item => {
          const match = item.group_id.includes(val);
          return match;
        });
      } else {
        fd = this.data.groups_data;
      }
      this.setData({
        filter_groups_data: fd,
      });
    },
    getVal(e) {
      console.log(e.detail.value);
      this.setData({
        value: e.detail.value,
      });
    },
    handleClick() {
      this.setData({
        count: this.data.count + 1,
      });
      // 触发自定义事件，通知父组件/页面
      this.triggerEvent('myevent', { count: this.data.count });
    },
    onClickGroupId(e) {
      const gid = e.currentTarget.dataset.id;
      if (gid.group_id != this.data.group_id) {
        // this.clearSocket();
        this.setData({
          chatData: [],
        });
      }
      this.setData({
        group_id: gid.group_id,
        count: gid.online_user,
      });
      
      this.initWss(gid.group_id);
    },
    clearSocket() {
      if (this.data.socket) {
        this.data.socket.close();
        console.log('已关闭连接');
      }
    },
    initWss(gid) {
      wx.showLoading({
        title: "连接中...",
      });
      const socket = wx.connectSocket({
        url: `${this.data.wssUrl}/ws?uid=${this.data.user_id}`,
        timeout: 10000,
      });
      this.data.socket = socket;
      this.setData({
        socket: socket,
      });
      this.setData({
        socket_list: [...this.data.socket_list, socket],
      });
      socket.onOpen(() => {
        console.log('连接成功');
        wx.hideLoading();
        const initMsg = {
          group_id: this.getGroupIdSuffix(gid),
          content: '',
          time: this.getCurrentTime(),
          user_id: this.data.user_id,
          sender_id: this.data.sender_id,
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
            count: msg.user_count,
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
      const content = this.data.value;
      if (content == "") {
        Toast.fail("输入内容");
        return;
      }
      if (this.data.group_id == "") {
        Toast.fail("点击左侧id");
        return;
      }
      const initMsg = {
        group_id: this.getGroupIdSuffix(this.data.group_id),
        sender_id: this.data.sender_id,
        content: content,
        time: this.getCurrentTime(),
        user_id: this.data.user_id,
      };
      this.data.socket.send({ data: JSON.stringify(initMsg)});
      const data = {detail: {value: ""}};
      this.getVal(data);
    },
  }
})