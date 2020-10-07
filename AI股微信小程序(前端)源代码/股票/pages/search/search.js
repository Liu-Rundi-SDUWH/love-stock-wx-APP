Page({

  /**
   * 页面的初始数据
   */
  data: {
    history:[
      '中国银行', '全新好', '中兴通讯'
    ],
    hot:[
      '市北高薪', '天风证券', '中兴通讯'
    ],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this
    wx.request({
      url: 'https://www.action-recognition-wy.cn/hot', 
      method: "POST",
      header: {
      'content-type': 'application/x-www-form-urlencoded',
      'chartset': 'utf-8'
      },
      success:res => {
        console.log("success")
        console.log(res.data);
        that.setData({hot:res.data})
      },
      fail:res =>{
        console.log(res,'失败')
      }
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  searchInput(e){
    const text = e.detail.value;
    console.log(text)
    // console.log(text)
    wx.navigateTo({
      url: '../detail/detail?text=' + text,
    })
  },

  keywordHandle(e) {
    const text = e.target.dataset.text;
    // console.log(text)
    wx.navigateTo({
      url: '../detail/detail?text=' + text,
    })
  }
})