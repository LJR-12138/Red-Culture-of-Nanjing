// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init()
const db = cloud.database()

exports.main = async (event, context) => {
  const { OPENID } = cloud.getWXContext()
  const { nickname, avatarUrl } = event

  const users = db.collection('users')
  const res = await users.where({ openid: OPENID }).get()

  if (res.data.length > 0) {
    await users.where({ openid: OPENID }).update({
      data: {
        nickname: nickname || res.data[0].nickname,
        avatarUrl: avatarUrl || res.data[0].avatarUrl
      }
    });
  } else {
    await users.add({
      data: {
        openid: OPENID,
        nickname,
        avatarUrl,
        role: ''
      }
    });
  }

  const user = await users.where({ openid: OPENID }).get();
  return user.data[0];
};
