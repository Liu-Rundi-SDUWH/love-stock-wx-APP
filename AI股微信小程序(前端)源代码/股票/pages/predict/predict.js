import * as echarts from '../../ec-canvas/echarts';
const app = getApp()
var null_arr = ['-', '-', '-', '-', '-', '-', '-', '-', '-',]

Page({
  data: {
    show:false,
    list: [      //动画
      {
        name: 'scale-down',
        color: 'orange'
      },
    ],
    ecBar: {   //净资产
        lazyLoad: true
    },
  },

    onLoad(){
        wx.request({
            url: 'https://www.action-recognition-wy.cn/prediction', 
            data: { 
              data: app.globalData.text  
            },
            method: "POST",
            header: {
            'content-type': 'application/x-www-form-urlencoded',
            'chartset': 'utf-8'
            },
            success:res => {
                this.setData({prediction:res.data["涨幅预测"]})
                console.log("success")
                this.setData({show:true})
                console.log(res.data["涨幅预测"])
                this.ecComponent = this.selectComponent('#jingzich');
                this.getData()
            },
            fail:res => {
                console.log(res)
            }
        })
    },

  onReady(){
  },

  getData(){
    this.ecComponent.init((canvas, width, height, dpr) => {
    // 获取组件的 canvas、width、height 后的回调函数
    // 在这里初始化图表
    const chart = echarts.init(canvas, null, {
        width: width,
        height: height,
        devicePixelRatio: dpr // new
    });
    chart.setOption(this.getoption());
    // 注意这里一定要返回 chart 实例，否则会影响事件处理等
    return chart;
    });
  },

  arange(n, step){
    var result = [];
    for (var i = 1; step > 0 ? i < n+1 : i > n+1; i += step)
    {
      result.push(String(i));
    }
    return result;
  },
  
  getlength(obj){
    var num = 0
    for(var i in obj){
      　num++;
      }
      return num;
  },

  getoption(){
    var prediction = null_arr.concat(this.data.prediction)
    return{
        color: ["#37A2DA", "#9FE6B8"],
        legend: {
            data: ['history', 'prediction'],
            textStyle: { //图例文字的样式
                color: '#fff',
                fontSize: 12
              },
            z: 100
        },
        grid: {
            left: '10%',
            right: '5%',
            bottom: '10%'
        },
        // dataZoom: [
        //     {
        //         type: 'inside',
        //         start: 50,
        //         end: 100
        //     },
        //     {
        //         show: true,
        //         type: 'slider',
        //         top: '90%',
        //         start: 50,
        //         end: 100
        //     }
        // ],
        tooltip: {
            show: true,
            trigger: 'axis'
        },
        xAxis: {
            type: 'category',
            axisTick: {show: false},
            axisLine: {
            lineStyle: {
                color: '#fff'
            }
            },
            axisLabel: {
            color: '#fff'
            },
            axisPointer: {
                type: 'shadow'
            },
            data: this.arange(this.getlength(prediction),1),
        },
        yAxis: {
            x: 'center',
            type: 'value',
            splitLine: {
                lineStyle: {type: 'dashed'}
            },
            axisLine: {
                lineStyle: {
                  color: '#fff'
                }
              },
              axisLabel: {
                color: '#fff'
              },
        },
        series: [{
            name: 'history',
            type: 'line',
            smooth: true,
            data: app.globalData.zhangfu
        }, {
            name: 'prediction',
            type: 'line',
            smooth: true,
            data: prediction
        }]
    }
  },

  backsearch(e){
    var anmiaton = e.currentTarget.dataset.class;
    var that = this;
    that.setData({
      animation: anmiaton
    })
    setTimeout(function() {
      that.setData({
        animation: ''
      })
    }, 1000)
    setTimeout(function() {
      wx.navigateTo({
        url: '../search/search',
      })
    }, 700)
  }
})