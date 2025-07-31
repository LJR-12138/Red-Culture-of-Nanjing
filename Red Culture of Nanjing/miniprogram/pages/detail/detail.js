// pages/detail/detail.js
Page({
  data: {
    spot: {},
    markers: []
  },

  onLoad(options) {
    const id = options.id;
    console.log('页面参数 id:', id);

    wx.cloud.database().collection('scenic_spots')
      .doc(id)
      .get()
      .then(res => {
        const spot = res.data;
        console.log('数据库返回数据:', spot);

        // 设置 marker
        const marker = {
          id: 1,
          latitude: spot.coordinate.latitude,
          longitude: spot.coordinate.longitude,
          title: spot.name,
          width: 40,
          height: 40
        };

        this.setData({
          spot,
          markers: [marker]
        });
      })
      .catch(err => {
        console.error('获取数据失败:', err);
        wx.showToast({ title: '加载失败', icon: 'none' });
      });
  },

  openMap() {
    const { coordinate, name, address } = this.data.spot;

    if (coordinate && typeof coordinate.latitude === 'number' && typeof coordinate.longitude === 'number') {
      wx.openLocation({
        latitude: coordinate.latitude,
        longitude: coordinate.longitude,
        name,
        address,
        scale: 18
      });
    } else {
      wx.showToast({
        title: '坐标信息缺失',
        icon: 'none'
      });
    }
  }
});
