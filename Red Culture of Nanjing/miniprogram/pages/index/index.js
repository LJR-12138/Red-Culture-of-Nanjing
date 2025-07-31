// pages/index/index.js
Page({
  data: { spots: [] },
  onLoad() {
    wx.cloud.database().collection('scenic_spots')
      .get().then(res => this.setData({ spots: res.data }));
  },
  goDetail(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({ url: `/pages/detail/detail?id=${id}` });
  }
});
