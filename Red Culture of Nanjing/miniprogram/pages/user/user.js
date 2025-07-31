// pages/user/user.js

Page({
  data: {
    avatarUrl:'',
    user: {},
    hasLogin: false
  },

  onLoad() {
    this.fetchUser();
  },

  // 获取用户信息
  fetchUser() {
    wx.cloud.callFunction({
      name: 'login'
    }).then(res => {
      const user = res.result || {};
      this.setData({
        user,
        hasLogin: !!user.nickname,
        avatarUrl: user.avatarUrl 
      });
    });
  },

  // 选择头像
  onChooseAvatar(e) {
    const { avatarUrl } = e.detail;
    console.log('用户选择头像：', avatarUrl);
    this.setData({ avatarUrl });
  },

  // 提交昵称 + 头像，调用云函数保存
  onSubmit(e) {
    const nickname = e.detail.value.nickname.trim();
    const avatarUrl = this.data.avatarUrl;

    if (!nickname) {
      wx.showToast({ title: '请输入昵称', icon: 'none' });
      return;
    }

    wx.cloud.callFunction({
      name: 'login',
      data: { nickname, avatarUrl }
    }).then(res => {
      this.setData({
        user: res.result,
        hasLogin: true
      });
      wx.showToast({ title: '登录成功' });
    });
  },

  logout() {
    this.setData({
      user: {},
      hasLogin: false,
      avatarUrl: ''
    });
    wx.showToast({ title: '已退出' });
  },

  viewMyMessages() {
    wx.navigateTo({ url: '/pages/myMessages/index' });
  },
  editProfile() {
    wx.navigateTo({ url: '/pages/editProfile/index' });
  },
  feedback() {
    wx.navigateTo({ url: '/pages/feedback/index' });
  },
  goAdmin() {
    wx.navigateTo({ url: '/pages/admin/admin' });
  }
});
