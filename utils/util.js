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

module.exports = {
  stringToTimestamp
};

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : `0${n}`
}

module.exports = {
  getCurrentTime,
  generateUUID,
  stringToTimestamp,
}

