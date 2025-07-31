// pages/feedback/index.js
const db = wx.cloud.database();
const _ = db.command;

Page({
  data: {
    content: '',
    feedbackList: [],
    isAdmin: false,
    selectedIds: []
  },

  async onLoad() {
    const res = await wx.cloud.callFunction({ name: 'login' });
    const openid = res.result.openid;

    // 获取用户角色
    const userRes = await db.collection('users').where({ openid }).get();
    const role = userRes.data[0]?.role || '';

    this.setData({
      isAdmin: role === 'admin'
    });

    if (role === 'admin') {
      this.loadFeedback();
    }
  },

  onInput(e) {
    this.setData({ content: e.detail.value });
  },

  async submit() {
    const content = this.data.content.trim();
    if (!content) {
      wx.showToast({ title: '内容不能为空', icon: 'none' });
      return;
    }

    await db.collection('feedback').add({
      data: {
        content,
        time: new Date()
      }
    });

    wx.showToast({ title: '提交成功' });
    this.setData({ content: '' });

    if (this.data.isAdmin) {
      this.loadFeedback(); // 管理员提交后也刷新列表
    }
  },

  async loadFeedback() {
    const res = await db.collection('feedback').orderBy('time', 'desc').get();
    const formattedList = res.data.map(item => ({
      ...item,
      formattedTime: this.formatTime(item.time)
    }));
    this.setData({ feedbackList: formattedList });
  },

  onCheckboxChange(e) {
    this.setData({ selectedIds: e.detail.value });
  },

  async deleteSelected() {
    const ids = this.data.selectedIds;
    if (ids.length === 0) {
      wx.showToast({ title: '未选择任何项', icon: 'none' });
      return;
    }

    try {
      await db.collection('feedback').where({
        _id: _.in(ids)
      }).remove();

      wx.showToast({ title: '删除成功' });
      this.loadFeedback();
      this.setData({ selectedIds: [] });
    } catch (err) {
      console.error('批量删除失败', err);
      wx.showToast({ title: '删除失败', icon: 'none' });
    }
  },

  formatTime(time) {
    if (!time) return '';
    const date = new Date(time);
    const y = date.getFullYear();
    const m = ('0' + (date.getMonth() + 1)).slice(-2);
    const d = ('0' + date.getDate()).slice(-2);
    const h = ('0' + date.getHours()).slice(-2);
    const min = ('0' + date.getMinutes()).slice(-2);
    return `${y}-${m}-${d} ${h}:${min}`;
  }
});
