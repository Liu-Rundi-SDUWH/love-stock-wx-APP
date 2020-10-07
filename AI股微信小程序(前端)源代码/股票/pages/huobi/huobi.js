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
    color: ["#37A2DA", "#8B0A50"],
    tooltip: {
      trigger: 'axis',
      axisPointer: {
          crossStyle: {
              color: '#999'
          }
      }
    },
    legend: {
        data: ['货币供应量'],
        textStyle: { //图例文字的样式
          color: '#fff',
          fontSize: 12
        },
    },
    grid: {
      top: 40,
      bottom: 30,
      right: 20,
      left:70
    },
    xAxis: [
      {
        type: 'category',
        data: arange(getlength(app.globalData.huobiliang),1),
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
        name: '货币供应量',
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
        name: '货币供应量',
        type: 'line',
        data: app.globalData.huobiliang
      }
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