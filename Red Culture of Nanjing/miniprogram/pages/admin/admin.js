// pages/admin/admin.js
Page({
  data: {
    pending: []
  },

  onLoad() {
    this.loadPendingMessages();
  },

  loadPendingMessages() {
    const db = wx.cloud.database();
    db.collection('messages')
      .where({ approved: false })
      .orderBy('time', 'desc')
      .get()
      .then(res => {
        const formatted = res.data.map(item => ({
          ...item,
          formattedTime: this.formatTime(item.time)
        }));
        console.log("加载的留言数据：", formatted);
        this.setData({ pending: formatted });
      })
      .catch(err => {
        console.error('获取待审核留言失败', err);
        wx.showToast({ title: '加载失败', icon: 'none' });
      });
  },

  formatTime(time) {
    if (!time) return '';
    // 兼容数据库 Date 类型或时间戳
    const date = new Date(time instanceof Date ? time : time.$date || time);
    const pad = n => n.toString().padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
  },

  approve(e) {
    const id = e.currentTarget.dataset.id;
    const db = wx.cloud.database();
    console.log("通过留言ID：", id);

    db.collection('messages')
      .doc(id)
      .update({
        data: { approved: true }
      })
      .then(() => {
        wx.showToast({ title: '已通过', icon: 'success' });
        this.loadPendingMessages();
      })
      .catch(err => {
        console.error('更新失败', err);
        wx.showToast({ title: '操作失败', icon: 'none' });
      });
  },

  reject(e) {
    const id = e.currentTarget.dataset.id;
    const db = wx.cloud.database();
    console.log("删除留言ID：", id);

    wx.showModal({
      title: '确认删除',
      content: '确定要删除这条留言吗？',
      success: res => {
        if (res.confirm) {
          db.collection('messages')
            .doc(id)
            .remove()
            .then(() => {
              wx.showToast({ title: '已删除', icon: 'success' });
              this.loadPendingMessages();
            })
            .catch(err => {
              console.error('删除失败', err);
              wx.showToast({ title: '操作失败', icon: 'none' });
            });
        }
      }
    });
  }
});
