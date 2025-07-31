// app.js
App({
  onLaunch() {
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上基础库以使用云能力')
    } else {
      wx.cloud.init({
        env: 'cloudbase-9gi7sokc6685609c', // 填写你的环境 ID
        traceUser: true
      })
    }
  }
})
