Component({
  properties: {
    startYear: { type: Number, value: 1970 },
    endYear: { type: Number, value: 2030 },
    valueTimestamp: { type: Number, value: 0 } // 可传默认时间戳（ms）
  },
  data: {
    rangeList: [], // [years, months, days, hours, mins, secs]
    value: [0,0,0,0,0,0],
    displayText: ''
  },
  lifetimes: {
    attached() {
      this.initRange();
    }
  },
  methods: {
    // 生成初始 range（years, months, days, hours, mins, secs）
    initRange() {
      const years = [];
      for (let y = this.data.startYear; y <= this.data.endYear; y++) years.push(y);
      const months = Array.from({length:12}, (_,i)=> (i+1));
      const hours = Array.from({length:24}, (_,i)=> (i));
      const mins = Array.from({length:60}, (_,i)=> i);
      const secs = Array.from({length:60}, (_,i)=> i);

      // days will be set based on current year/month
      const now = this.data.valueTimestamp ? new Date(this.data.valueTimestamp) : new Date();
      const yIdx = now.getFullYear() - this.data.startYear;
      const mIdx = now.getMonth();

      const days = this.daysOfMonth(now.getFullYear(), now.getMonth()+1);

      this.setData({
        rangeList: [years, months, days.map(d=> d), hours, mins, secs],
        value: [yIdx, mIdx, now.getDate()-1, now.getHours(), now.getMinutes(), now.getSeconds()]
      }, () => this.updateDisplay());
    },

    // 返回当月天数数组 [1..n]
    daysOfMonth(year, month) {
      const d = new Date(year, month, 0); // month:1-12，day 0 -> last day prev month
      const days = d.getDate();
      return Array.from({length: days}, (_,i)=> i+1);
    },

    // 当列发生变化时（需要调整天数列）
    onColumnChange(e) {
      const { column, value } = e.detail;
      const range = this.data.rangeList.slice(); // shallow copy
      const val = this.data.value.slice();

      val[column] = value;

      // 如果变更的是 年(0) 或 月(1)，需要重建 days 列
      if (column === 0 || column === 1) {
        const yearStr = range[0][val[0]]; // e.g. "2025年"
        const year = parseInt(yearStr, 10);
        const monthStr = range[1][val[1]];
        const month = parseInt(monthStr, 10);
        const days = this.daysOfMonth(year, month).map(d=> d);
        range[2] = days;

        // 如果当前 day index 超出新天数长度，修正为最后一天
        if (val[2] >= days.length) val[2] = days.length - 1;
        this.setData({ rangeList: range, value: val });
      } else {
        this.setData({ value: val });
      }
      this.updateDisplay();
    },

    // 确认选择（picker 的 bindchange）
    onConfirm(e) {
      const val = e.detail.value; // indices
      const range = this.data.rangeList;
      const year = parseInt(range[0][val[0]], 10);
      const month = parseInt(range[1][val[1]], 10);
      const day = parseInt(range[2][val[2]], 10);
      const hour = parseInt(range[3][val[3]], 10);
      const minute = parseInt(range[4][val[4]], 10);
      const second = parseInt(range[5][val[5]], 10);

      const dt = new Date(year, month-1, day, hour, minute, second);
      const formatted = this.formatDate(dt);
      this.setData({ value: val, displayText: formatted });
      // 触发事件给使用方
      this.triggerEvent('change', { timestamp: dt.getTime(), text: formatted });
    },

    updateDisplay() {
      // 根据当前 value 生成显示文本
      const v = this.data.value;
      const r = this.data.rangeList;
      if (!r || !r.length) return;
      const year = r[0][v[0]];
      const month = r[1][v[1]];
      const day = r[2][v[2]];
      const hour = r[3][v[3]];
      const minute = r[4][v[4]];
      const second = r[5][v[5]];
      this.setData({ displayText: `${year}${month}${day} ${hour}${minute}${second}` });
    },

    formatDate(d) {
      const pad = (n)=> n.toString().padStart(2,'0');
      return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
    }
  }
});
