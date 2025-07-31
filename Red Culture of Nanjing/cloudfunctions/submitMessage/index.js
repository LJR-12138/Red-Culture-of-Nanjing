// 云函数入口文件
const cloud = require('wx-server-sdk');
cloud.init();
const db = cloud.database();

// 云函数主入口
exports.main = async (event, context) => {
  const { OPENID } = cloud.getWXContext();

  const nickname = event.nickname || '匿名';
  const avatarUrl = event.avatarUrl;
  const content = (event.content || '').trim();

  if (!content) {
    return {
      success: false,
      msg: '留言内容不能为空'
    };
  }

  try {
    await db.collection('messages').add({
      data: {
        openid: OPENID,
        nickname,
        avatarUrl,
        content,
        time: new Date(),
        approved: false // 默认需审核
      }
    });

    return {
      success: true,
      msg: '留言已提交，等待审核'
    };
  } catch (err) {
    return {
      success: false,
      msg: '留言失败，请稍后重试',
      error: err
    };
  }
};
