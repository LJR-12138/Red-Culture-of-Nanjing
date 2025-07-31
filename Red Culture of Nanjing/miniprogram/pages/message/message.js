// pages/message/message.js
const db = wx.cloud.database();

Page({
  data: {
    messages: [],
    content: '',
    openid: '',
    user: {},
    hasLogin: false,
    hideInput: false
  },

  async onLoad() {
    await this.loadUser();
    this.loadMessages();
  },

  async onShow() {
    // 普通页面回显刷新
    await this.loadUser();
    this.loadMessages();
  },

  // 下拉刷新（可选）
  onPullDownRefresh() {
    this.loadMessages(() => wx.stopPullDownRefresh());
  },

  async loadUser() {
    try {
      const res = await wx.cloud.callFunction({ name: 'login' });
      const openid = res.result.openid;

      // 通过 openid 获取用户详细信息（昵称、头像）
      const userRes = await db.collection('users').where({ openid }).get();
      const userData = userRes.data[0] || {};

      this.setData({
        openid,
        user: userData,
        hasLogin: !!userData.nickname
      });
    } catch (err) {
      console.error('获取用户信息失败', err);
    }
  },

  loadMessages(callback) {
    db.collection('messages')
      .where({ approved: true })
      .orderBy('time', 'desc')
      .get()
      .then(res => {
        const data = res.data.map(item => ({
          ...item,
          time: formatDateTime(item.time)
        }));
        this.setData({ messages: data });
        if (callback) callback();
      })
      .catch(err => {
        console.error('加载留言失败', err);
        wx.showToast({ title: '加载留言失败', icon: 'none' });
        if (callback) callback();
      });
  },

  onScroll(e) {
    this.setData({ hideInput: e.detail.scrollTop > 50 });
  },

  onInput(e) {
    this.setData({ content: e.detail.value });
  },

  submitMessage() {
    const content = this.data.content.trim();
    if (!content) return wx.showToast({ title: '内容不能为空', icon: 'none' });

    const { user } = this.data;

    wx.cloud.callFunction({
      name: 'submitMessage',
      data: {
        nickname: user.nickname,
        avatarUrl: user.avatarUrl,
        content
      }
    })
      .then(res => {
        if (res.result.success) {
          wx.showToast({ title: res.result.msg });
          this.setData({ content: '' });
          this.loadMessages();
        } else {
          wx.showToast({ title: res.result.msg, icon: 'none' });
        }
      })
      .catch(err => {
        console.error('发布失败:', err);
        wx.showToast({ title: '发布失败', icon: 'none' });
      });
  }
});

// 时间格式化函数
function formatDateTime(dateObj) {
  if (!dateObj) return '';
  const date = new Date(dateObj);
  const y = date.getFullYear();
  const m = (date.getMonth() + 1).toString().padStart(2, '0');
  const d = date.getDate().toString().padStart(2, '0');
  const hh = date.getHours().toString().padStart(2, '0');
  const mm = date.getMinutes().toString().padStart(2, '0');
  return `${y}-${m}-${d} ${hh}:${mm}`;
}
