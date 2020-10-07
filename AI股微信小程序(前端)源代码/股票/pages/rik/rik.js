import * as echarts from '../../ec-canvas/echarts';
const app = getApp()

var upColor = '#ec0000';
var upBorderColor = '#8A0000';
var downColor = '#00da3c';
var downBorderColor = '#008F28';

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

  
 splitData(rawData) {
    var categoryData = [];
    var values = []
    for (var i = 0; i < this.getlength(rawData); i++) {
        categoryData.push(rawData[i].splice(0, 1)[0]);
        values.push(rawData[i])
    }
    return {
        categoryData: categoryData,
        values: values
    };
  },

    calculateMA(dayCount) {
        var result = [];
        for (var i = 0, len = this.getlength(this.data.rik.values); i < len; i++) {
            if (i < dayCount) {
                result.push('-');
                continue;
            }
            var sum = 0;
            for (var j = 0; j < dayCount; j++) {
                sum += this.data.values[i - j][1];
            }
            result.push(sum / dayCount);
        }
        return result;
    },

    onLoad(){
        wx.request({
            url: 'https://www.action-recognition-wy.cn/dayk', 
            data: { 
              data:app.globalData.text
            },
            method: "POST",
            header: {
            'content-type': 'application/x-www-form-urlencoded',
            'chartset': 'utf-8'
            },
            success:res => {
                app.globalData.day_k = res.data
                this.setData({rik:res.data})
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

  getoption(){
    var data0 = this.splitData(this.data.rik)
    return{
        backgroundColor:'', //设置无背景色 
        tooltip: {
            trigger: 'axis',
        },
        legend: {
            data: ['日K', 'MA5', 'MA10', 'MA20', 'MA30'],
            textStyle: { //图例文字的样式
                color: '#fff',
                fontSize: 12
              },
        },
        grid: {
            left: '10%',
            right: '10%',
            bottom: '22%'
        },
        xAxis: {
            type: 'category',
            data: data0.categoryData,
            scale: true,
            boundaryGap: false,
            axisLine: {onZero: false},
            splitLine: {show: false},
            splitNumber: 20,
            min: 'dataMin',
            max: 'dataMax',
            axisLine: {
                lineStyle: {
                  color: '#fff'
                }
              },
              axisLabel: {
                color: '#fff'
              },
        },
        yAxis: {
            scale: true,
            axisLine: {
                lineStyle: {
                  color: '#fff'
                }
              },
              axisLabel: {
                color: '#fff'
              },
            splitArea: {
                show: true
            }
        },
        dataZoom: [
            {
                type: 'inside',
                start: 50,
                end: 100
            },
            {
                show: true,
                type: 'slider',
                top: '90%',
                start: 50,
                end: 100
            }
        ],
        series: [
            {
                name: '日K',
                type: 'candlestick',
                data: data0.values,
                itemStyle: {
                    color: upColor,
                    color0: downColor,
                    borderColor: upBorderColor,
                    borderColor0: downBorderColor
                },
                markPoint: {
                    label: {
                        normal: {
                            formatter: function (param) {
                                return param != null ? Math.round(param.value) : '';
                            }
                        }
                    },
                    data: [
                        {
                            name: 'XX标点',
                            coord: ['2013/5/31', 2300],
                            value: 2300,
                            itemStyle: {
                                color: 'rgb(41,60,85)'
                            }
                        },
                        {
                            name: 'highest value',
                            type: 'max',
                            valueDim: 'highest'
                        },
                        {
                            name: 'lowest value',
                            type: 'min',
                            valueDim: 'lowest'
                        },
                        {
                            name: 'average value on close',
                            type: 'average',
                            valueDim: 'close'
                        }
                    ],
                    tooltip: {
                        formatter: function (param) {
                            return param.name + '<br>' + (param.data.coord || '');
                        }
                    }
                },
                markLine: {
                    symbol: ['none', 'none'],
                    data: [
                        [
                            {
                                name: 'from lowest to highest',
                                type: 'min',
                                valueDim: 'lowest',
                                symbol: 'circle',
                                symbolSize: 10,
                                label: {
                                    show: false
                                },
                                emphasis: {
                                    label: {
                                        show: false
                                    }
                                }
                            },
                            {
                                type: 'max',
                                valueDim: 'highest',
                                symbol: 'circle',
                                symbolSize: 10,
                                label: {
                                    show: false
                                },
                                emphasis: {
                                    label: {
                                        show: false
                                    }
                                }
                            }
                        ],
                        {
                            name: 'min line on close',
                            type: 'min',
                            valueDim: 'close'
                        },
                        {
                            name: 'max line on close',
                            type: 'max',
                            valueDim: 'close'
                        }
                    ]
                }
            },
            {
                name: 'MA5',
                type: 'line',
                data: this.calculateMA(5),
                smooth: true,
                lineStyle: {
                    opacity: 0.5
                }
            },
            {
                name: 'MA10',
                type: 'line',
                data: this.calculateMA(10),
                smooth: true,
                lineStyle: {
                    opacity: 0.5
                }
            },
            {
                name: 'MA20',
                type: 'line',
                data: this.calculateMA(20),
                smooth: true,
                lineStyle: {
                    opacity: 0.5
                }
            },
            {
                name: 'MA30',
                type: 'line',
                data: this.calculateMA(30),
                smooth: true,
                lineStyle: {
                    opacity: 0.5
                }
            },
    
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