import images from '../../utils/images.js';
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    none:false,
    show:false,
    TabCur: 0,
    tabs:[
      '指标分析',
      '智能诊股',
    ],
    ai: [{
      title: '股票预测',
      name: '1',
      color: 'orange',
      pinyin:'hezhangtiao',
      shifan:'predict'
    },
    {
      title: '热词分析',
      name: '2',
      color: 'my1',
      pinyin:'hezhangtiao',
      shifan:'feeling'
    },],
    elements: [{
      title: '净资产收益',
      name: '1',
      color: 'orange',
      pinyin:'hezhangtiao',
      shifan:'jingzich'
    },
    {
      title: '市盈率、市净率',
      name: '2',
      color: 'green',
      pinyin:'jiaochapao',
      shifan:'shiy'
    },
    {
      title: '日K线图',
      name: '3',
      color: 'cyan',
      pinyin:'kaihetiao',
      shifan:'rik'
    },
    {
      title: '跌涨幅',
      name: '4',
      color: 'my1',
      pinyin:'bandun',
      shifan:'zhangfu'
    },
    {
      title: '广义货币供应量',
      name: '5',
      color: 'brown',
      pinyin:'bandun',
      shifan:'huobi'
    },
    {
      title: '央行利率政策',
      name: '6',
      color: 'mauve',
      pinyin:'bandun',
      shifan:'lilv'
    }],
    list: [
    {
      name: 'scale-down',
      color: 'orange'
    },
  ],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onShow:function(options){
    let pages = getCurrentPages();
    let currentPage = pages[pages.length-1];
    console.log(currentPage.options.text)
    var text = currentPage.options.text
    app.globalData.text = text
    this.setData({
      text:text
    })
    wx.request({
      url: 'https://www.action-recognition-wy.cn/jingzichan', 
      data: { 
        data: this.data.text    
      },
      method: "POST",
      header: {
      'content-type': 'application/x-www-form-urlencoded',
      'chartset': 'utf-8'
      },
      success:res => {
        console.log(res.data)
        if(res.data["股票存在状态"] == 1){
          this.setData({number: res.data["股票代码"]})
          app.globalData.season_1 = res.data["第一季度"]
          app.globalData.season_2 = res.data["第二季度"]
          app.globalData.season_3 = res.data["第三季度"]
          app.globalData.season_4 = res.data["第四季度"]
          //成功之后访问第二个url
          wx.request({
            url: 'https://www.action-recognition-wy.cn/', 
            data: { 
              data: this.data.text    
            },
            method: "POST",
            header: {
            'content-type': 'application/x-www-form-urlencoded',
            'chartset': 'utf-8'
            },
            success:res => {
              console.log("success")
              app.globalData.shi_y = res.data["peTTM"]
              app.globalData.shi_j = res.data["pbMRQ"]
              this.setData({
                price:res.data["stockinfo"]["price"]
              })
              //成功之后访问第三个url
              wx.request({
                url: 'https://www.action-recognition-wy.cn/lilv', 
                data: { 
                  data: this.data.text     
                },
                method: "POST",
                header: {
                'content-type': 'application/x-www-form-urlencoded',
                'chartset': 'utf-8'
                },
                success:res => {
                  console.log("success")
                  app.globalData.lilv1 = res.data["loanRate6Month"]
                  app.globalData.lilv2 = res.data["loanRate6MonthTo1Year"]
                  app.globalData.lilv3 = res.data["loanRate1YearTo3Year"]
                  app.globalData.lilv4 = res.data["loanRate3YearTo5Year"]
                  app.globalData.lilv5 = res.data["loanRateAbove5Year"]
                  wx.request({
                    url: 'https://www.action-recognition-wy.cn/huobiliang', 
                    data: { 
                      data: this.data.text   
                    },
                    method: "POST",
                    header: {
                    'content-type': 'application/x-www-form-urlencoded',
                    'chartset': 'utf-8'
                    },
                    success:res => {
                      console.log("success")
                      app.globalData.huobiliang = res.data["m2"]
                      wx.request({
                        url: 'https://www.action-recognition-wy.cn/zhangfu', 
                        data: { 
                          data: this.data.text     
                        },
                        method: "POST",
                        header: {
                        'content-type': 'application/x-www-form-urlencoded',
                        'chartset': 'utf-8'
                        },
                        success:res => {
                          console.log("success")
                          var length = this.getlength(res.data)
                          var last = this.lastEle(res.data, length)
                          this.setData({
                            zhangfu_new:last
                          })
                          app.globalData.zhangfu = res.data
                          this.setData({show:true})
                              //作雷达图
                              var options = {
                                data: [{ value: [18, 15.5, 12, 10, 3], color: "#FFFF00" }],
                                xLabel: ['基本面', '技术面', '资金面', '市场面', '政策面'],
                                chartRatio: 0.8,
                                style: 'radar',
                                showLabel: false,
                                animation: true,
                                showTooltip: true,
                                area: true,      //实线/阴影
                              }
                              this.roseComp = this.selectComponent('#radar');
                              this.roseComp.setOptions(options);
                              this.roseComp.initChart(300, 225);
                        }
                      })
                    }
                  })
                }
              })
            }
          })
        }
        else{
          wx.showToast({
            title: '您所查询的股票不存在',
            icon: 'none',
            duration: 1500,
            success: res=> {
              this.setData({none:true})
              setTimeout(function() {
                //要延时执行的代码
                wx.navigateBack({
                  delta: 1
                })
              }, 1000) //延迟时间
            },
          });
        }
      }
    })
  },

  //获取对象的长度
  getlength(obj){
  var num = 0
  for(var i in obj){
    　num++;
    }
    return num;
  },

  lastEle(obj,num){
    var index = 0
    for(var i in obj){
      index++;
      if(index==num){
        return obj[index-1];
      }
    }
  },
  
  tabSelect(e) {
    this.setData({
      TabCur: e.currentTarget.dataset.id,
      scrollLeft: (e.currentTarget.dataset.id-1)*60
    })
  },
})