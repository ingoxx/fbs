const getCurrentTime = (() => {
  const now = new Date();
  const time = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')} ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}:${String(now.getSeconds()).padStart(2,'0')}`
  return time;
})
const generateUUID = (() => {
  let s = [];
  let hexDigits = "0123456789abcdef";
  for (let i = 0; i < 36; i++) {
    s[i] = hexDigits.substr(Math.floor(Math.random() * 16), 1);
  }
  s[14] = "4";  // bits 12-15 of the time_hi_and_version field to 0010
  s[19] = hexDigits.substr((parseInt(s[19], 16) & 0x3) | 0x8, 1);  // bits 6-7 of the clock_seq_hi_and_reserved to 01
  s[8] = s[13] = s[18] = s[23] = "-";

  return s.join("");
})

const isValidDateTime = ((str) => {
  // 1. 初步格式校验：YYYY-MM-DD HH:MM:SS
  const regex = /^(\d{4})-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])\s(0\d|1\d|2[0-3]):([0-5]\d):([0-5]\d)$/;
  const match = str.match(regex);
  if (!match) return false;

  // 2. 进一步校验是否是合法日期（如2月29日、闰年等）
  const year = parseInt(match[1], 10);
  const month = parseInt(match[2], 10) - 1; // JS月份从0开始
  const day = parseInt(match[3], 10);

  const date = new Date(year, month, day);
  // 检查：年月日是否匹配
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month ||
    date.getDate() !== day
  ) {
    return false;
  }
  return true;
})

const checkUpdate = (() => {
  if (wx.canIUse('getUpdateManager')) {
    const updateManager = wx.getUpdateManager();

    // 检查新版本
    updateManager.onCheckForUpdate(function (res) {
      console.log("是否有新版本: ", res.hasUpdate);
    });

    // 新版本下载完成
    updateManager.onUpdateReady(function () {
      wx.showModal({
        title: '更新提示',
        content: '发现新版本，是否立即使用？',
        success(res) {
          if (res.confirm) {
            updateManager.applyUpdate();
          }
        }
      });
    });
    // 新版本下载失败
    updateManager.onUpdateFailed(function () {
      wx.showModal({
        title: '更新提示',
        content: '新版本下载失败，请删除小程序后重新打开。',
        showCancel: false
      });
    });
  } else {
    wx.showModal({
      title: '提示',
      content: '当前微信版本过低，无法使用更新功能，请升级微信后重试。',
      showCancel: false
    });
  }
})
const storage = ((key, val) => {
  try {
    if (typeof val === "undefined") {
      // 查询缓存
      return wx.getStorageSync(key);
    } else {
      // 保存缓存
      wx.setStorageSync(key, val);
      return true;
    }
  } catch (e) {
    console.error("Storage Error:", e);
    return null;
  }
})
/**
 * 将字符串时间转换为时间戳
 * @param {string} timeStr - 时间字符串（如 "2025-07-18 12:30:29"）
 * @param {string} [unit='ms'] - 返回时间戳单位，'ms' 毫秒，'s' 秒
 * @returns {number|null} - 转换后的时间戳，转换失败返回 null
 */
const stringToTimestamp = ((timeStr, unit = 'ms') => {
  if (typeof timeStr !== 'string' || !timeStr.trim()) {
    return null;
  }

  // 去除多余空格
  let safeStr = timeStr.trim();

  // 替换所有 "-" 为 "/"，确保 iOS/Safari/微信小程序兼容
  safeStr = safeStr.replace(/-/g, '/');

  // 解析成 Date 对象
  const date = new Date(safeStr);
  if (isNaN(date.getTime())) {
    return null; // 转换失败
  }

  const ts = date.getTime();
  return unit === 's' ? Math.floor(ts / 1000) : ts;
})

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : `0${n}`
}

module.exports = {
  getCurrentTime,
  generateUUID,
  stringToTimestamp,
  checkUpdate,
  storage,
  isValidDateTime,
}

