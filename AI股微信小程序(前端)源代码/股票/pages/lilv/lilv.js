import * as echarts from '../../ec-canvas/echarts';

//np.arange
function arange(n, step){
  var result = [];
  for (var i = 1; step > 0 ? i < n+1 : i > n+1; i += step)
  {
    result.push(String(i));
  }
  return result;
}

//获取对象的长度
function getlength(obj){
  var num = 0
  for(var i in obj){
    　num++;
    }
    return num;
}

const app = getApp()

function getBarOption(){
  return {
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
        data: ['6个月', '6个月至1年','1年至3年', '3年至5年','5年以上'],
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
        data: arange(getlength(app.globalData.lilv1),1),
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
        name: '利率',
        scale:true,
        axisTick: { show: false },
        axisLine: {
          lineStyle: {
            color: '#fff'
          }
        },
        axisLabel: {
          color: '#fff',
          formatter: '{value}%'
        }
      }
    ],
    series: [
      {
        name: '6个月',
        type: 'line',
        data: app.globalData.lilv1
      },
      {
        name: '6个月至1年',
        type: 'line',
        data: app.globalData.lilv2
      },
      {
        name: '1年至3年',
        type: 'line',
        data: app.globalData.lilv3
      },
      {
        name: '3年至5年',
        type: 'line',
        data: app.globalData.lilv4
      },
      {
        name: '5年以上',
        type: 'line',
        data: app.globalData.lilv5
      },
    ]
  }
}


Page({
  data: {
    list: [      //动画
      {
        name: 'scale-down',
        color: 'orange'
      },
    ],
    ecBar: {   //净资产
      onInit: function (canvas, width, height, dpr) {
        const barChart = echarts.init(canvas, null, {
          width: width,
          height: height,
          devicePixelRatio: dpr // new
        });
        canvas.setChart(barChart);
        barChart.setOption(getBarOption());

        return barChart;
      }
    },
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