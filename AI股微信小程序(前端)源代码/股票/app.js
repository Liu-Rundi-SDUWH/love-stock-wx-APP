//app.js
App({
  onLaunch: function () {
    // 展示本地存储能力
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

    wx.cloud.init({
      env:"stock-ylmoe"
    })

    const db = wx.cloud.database();
    const userDB = db.collection('user')

    wx.cloud.callFunction({
      name: 'login',
      data: {},
      success: res => {
        console.log("云函数 [login] user openid: ", res.result.openid)
        this.globalData.openid = res.result.openid;
        userDB.doc(res.result.openid).get().then(res => {
          if (res.data) {
            console.log('已有用户',res.data);
            this.globalData.userInfo= res.data
          }
        }).catch(res => {
          console.log('新用户');
          this.globalData.isNew=true 
        })
      },

      fail: err => {
        console.log("云函数 [login] 调用失败", err)
      }
    })
    
    // 登录
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
      }
    })
    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              // 可以将 res 发送给后台解码出 unionId
              this.globalData.userInfo = res.userInfo

              // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
              // 所以此处加入 callback 以防止这种情况
              if (this.userInfoReadyCallback) {
                this.userInfoReadyCallback(res)
              }
            }
          })
        }
      }
    })
  },
  globalData: {
  }
})