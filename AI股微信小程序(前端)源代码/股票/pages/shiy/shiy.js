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
    color: ["#37A2DA", "#ffff33"],
    tooltip: {
      trigger: 'axis',
      axisPointer: {
          crossStyle: {
              color: '#999'
          }
      }
    },
    legend: {
        data: ['市盈率', '市净率'],
        textStyle: { //图例文字的样式
          color: '#fff',
          fontSize: 12
        },
    },
    grid: {
      top: 50,
      bottom: 30,
      right: 40,
      left:40
    },
    xAxis: [
      {
        type: 'category',
        data: arange(getlength(app.globalData.shi_y),1),
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
        name: '市盈率',
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
      },
      {
        type: 'value',
        name: '市净率',
        scale:true,
        axisTick: { show: false },
        axisLine: {
          lineStyle: {
            color: '#fff',
            formatter: '{value}'
          }
        },
        axisLabel: {
          color: '#fff'
        }
      }
    ],
    series: [
      {
        name: '市盈率',
        type: 'line',
        data: app.globalData.shi_y
      },
      {
        name: '市净率',
        type: 'bar',
        barWidth:8,
        yAxisIndex: 1,
        data: app.globalData.shi_j
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