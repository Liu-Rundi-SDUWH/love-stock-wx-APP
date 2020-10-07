import * as echarts from '../../ec-canvas/echarts';
const app = getApp()

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
            url: 'https://www.action-recognition-wy.cn/emotion', 
            data: { 
              data: app.globalData.text
            },
            method: "POST",
            header: {
            'content-type': 'application/x-www-form-urlencoded',
            'chartset': 'utf-8'
            },
            success:res => {
                app.globalData.ji = res.data["积极数值变化"]
                console.log(res.data)
                app.globalData.xiao = res.data["消极数值变化"]
                this.setData({show:true, ji:res.data["积极数值变化"], xiao:res.data["消极数值变化"],
                ji_emotion:res.data["平均积极数值"].toFixed(3), xiao_emotion:res.data["平均消极数值"].toFixed(3),
                emotion:res.data["情感分析数值"].toFixed(3)})
                console.log("success")
                this.setData({show:true})
                this.ecComponent = this.selectComponent('#jingzich');
                this.getData()
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

  
//np.arange
arange(n, step){
  var result = [];
  for (var i = 1; step > 0 ? i < n+1 : i > n+1; i += step)
  {
    result.push(String(i));
  }
  return result;
},

//获取对象的长度
getlength(obj){
  var num = 0
  for(var i in obj){
    　num++;
    }
    return num;
},

  getoption(){
    return{
      color: ["#37A2DA", "#8B0A50", "#9FE6B8", "#37A2DA", '#ffff33'],
      tooltip: {
        trigger: 'axis',
        axisPointer: {
            crossStyle: {
                color: '#999'
            }
        }
      },
      legend: {
          data: ['正面', '负面'],
          textStyle: { //图例文字的样式
            color: '#fff',
            fontSize: 12
          },
      },
      grid: {
        top: 70,
        bottom: 30,
        right: 20,
        left:40
      },
      xAxis: [
        {
          type: 'category',
          data: this.arange(this.getlength(this.data.ji),1),
          axisTick: { show: false },
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
          }
        }
      ],
      yAxis: [
        {
          type: 'value',
          name: '情感概率',
          scale:true,
          axisTick: { show: false },
          axisLine: {
            lineStyle: {
              color: '#fff'
            }
          },
          axisLabel: {
            color: '#fff',
            formatter: '{value}'
          }
        }
      ],
      series: [
        {
          name: '正面',
          type: 'line',
          data: this.data.ji
        },
        {
          name: '负面',
          type: 'line',
          data: this.data.xiao
        }
      ]
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