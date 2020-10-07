import * as echarts from '../../ec-canvas/echarts';

const app = getApp()
function getBarOption(){
  return {
    color: ['#ffff33', '#990099', '#67e0e3', '#e5323e'],
    legend: {
      data: ['第一季度', '第二季度', '第三季度', '第四季度'],
      textStyle: { //图例文字的样式
        color: '#fff',
        fontSize: 10
      },
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {            // 坐标轴指示器，坐标轴触发有效
        type: 'shadow'        // 默认为直线，可选为：'line' | 'shadow'
      },
      confine: true
    },
    grid: {
      top: 50,
      bottom: 30,
      right: 20,
      left:40
    },
    xAxis: [
      {
        type: 'category',
        axisTick: {show: false},
        data: ['2018', '2019', '2020'],
        axisLine: {
          lineStyle: {
            color: '#fff'
          }
        },
        axisLabel: {
          color: '#fff'
        }
      }
    ],
    yAxis: [
      {
        type: 'value',
        scale:true,
        axisTick: { show: false },
        axisLine: {
          lineStyle: {
            color: '#fff'
          }
        },
        axisLabel: {
          color: '#fff'
        }
      }
    ],
    series: [{name: '第一季度',type: 'bar',barGap:'0%', data:app.globalData.season_1},
    {name: '第二季度',type: 'bar', data:app.globalData.season_2},
    {name: '第三季度',type: 'bar', data:app.globalData.season_3},
    {name: '第四季度',type: 'bar', data:app.globalData.season_4},
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
    setTimeout(() => {
      wx.navigateBack({
         delta: 2   //默认值是1
      })
    }, 700)
  }
})