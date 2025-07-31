// pages/myMessages/index.js
const db = wx.cloud.database();

Page({
  data: {
    filterOptions: ['已审核', '未审核'],
    currentFilterIndex: 0,
    filteredMessages: [],
    messages: []
  },

  onLoad() {
    this.loadMessages();
  },

  loadMessages() {
    db.collection('messages')
      .orderBy('time', 'desc')
      .get()
      .then(res => {
        const formatted = res.data.map(item => ({
          ...item,
          formattedTime: this.formatTime(item.time)
        }));
        this.setData({
          messages: formatted
        }, () => {
          this.filterMessages();
        });
      });
  },

  filterMessages() {
    const approved = this.data.currentFilterIndex === 0;
    const filtered = this.data.messages.filter(m => m.approved === approved);
    this.setData({ filteredMessages: filtered });
  },

  onFilterChange(e) {
    this.setData({
      currentFilterIndex: +e.detail.value
    }, () => {
      this.filterMessages();
    });
  },

  deleteMessage(e) {
    const id = e.currentTarget.dataset.id;
    wx.showModal({
      title: '确认删除',
      content: '确定删除这条留言吗？',
      success: res => {
        if (res.confirm) {
          db.collection('messages').doc(id).remove()
            .then(() => {
              wx.showToast({ title: '删除成功' });
              this.loadMessages();
            });
        }
      }
    });
  },

  formatTime(time) {
    if (!time) return '';
    const date = new Date(time instanceof Date ? time : time.$date || time);
    const pad = n => n.toString().padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth()+1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
  }
});
