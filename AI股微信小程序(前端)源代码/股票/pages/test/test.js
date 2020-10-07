function getlength(obj){
  var num = 0
  for(var i in obj){
    　num++;
    }
    return num;
}

Page({
  data: {
    areaInfo: true,
    showans: true,
    radar:[2,1,3,4,2],
    checkValue4: null,
    checkboxArr1: [{
      name: '还信用卡等消费贷',
      checked: false
    }, {
      name: '还车贷',
      checked: false
    }, {
      name: '还房贷',
      checked: false
    }, {
      name: '日常花销',
      checked: false
    }],
    checkboxArr2: [{
      name: '定期',
      checked: false
    }, {
      name: '基金',
      checked: false
    }, {
      name: '股票',
      checked: false
    }, {
      name: '黄金、原油等',
      checked: false
    }],

    checkboxArr3: [{
      name: '除银行储蓄外，基本没有其他投资经验',
      checked: false
    }, {
      name: '购买过债券、保险等理财产品',
      checked: false
    }, {
      name: '参与过股票、基金等产品的交易',
      checked: false
    }, {
      name: '参与过权证、期货、期权等产品的交易',
      checked: false
    },{
      name: '有金融学习或工作经验',
      checked: false
    }],


  },
  // 获取点击的当前value值
  radioChange1: function (e) {
    var checkValue1 = e.detail.value;
    console.log("当前value1值-->",e.detail.value)
    this.setData({
      checkValue1: checkValue1
    });
  },

  radioChange2: function (e) {
    var checkValue2 = e.detail.value;
    console.log("当前value2值-->",e.detail.value)
    this.setData({
      checkValue2: checkValue2
    });
  },

  radioChange3: function (e) {
    var checkValue3 = e.detail.value;
    console.log("当前value3值-->",e.detail.value)
    this.setData({
      checkValue3: checkValue3
    });
  },

  radioChange5: function (e) {
    var checkValue5 = e.detail.value;
    console.log("当前value5值-->",e.detail.value)
    this.setData({
      checkValue5: checkValue5
    }); 
  },

  radioChange6: function (e) {
    var checkValue6 = e.detail.value;
    console.log("当前value6值-->",e.detail.value)
    this.setData({
      checkValue6: checkValue6
    }); 
  },

  radioChange7: function (e) {
    var checkValue7 = e.detail.value;
    console.log("当前value7值-->",e.detail.value)
    this.setData({
      checkValue7: checkValue7
    }); 
  },

  radioChange9: function (e) {
    var checkValue9 = e.detail.value;
    console.log("当前value7值-->",e.detail.value)
    this.setData({
      checkValue9: checkValue9
    }); 
  },

  // 点击 其他，影藏其他，显示输入框,  并且聚焦
  areaTap: function () {
    this.setData({
      areaInfo: false,
      focusInfo: true, //聚焦
    })
  },
  // from表单提交之后里面的数据
  formSubmit: function (e) {
    console.log('输入框的数据 -->', e.detail.value)
    console.log("选择的数据 -->", this.data.checkValue)
    this.setData({
      other_orea: e.detail.value,
      checkValue: this.data.checkValue
    })
  },

  checkbox: function (e) {
    var index = e.currentTarget.dataset.index;//获取当前点击的下标
    var checkboxArr1 = this.data.checkboxArr1;//选项集合
    checkboxArr1[index].checked = !checkboxArr1[index].checked;//改变当前选中的checked值
    this.setData({
      checkboxArr1: checkboxArr1
    });
  },
  checkboxChange: function (e) {
    var checkValue4 = e.detail.value;
    this.setData({
      checkValue4: checkValue4
    });
    console.log(this.data.checkValue4)
  },

  checkbox2: function (e) {
    var index = e.currentTarget.dataset.index;//获取当前点击的下标
    var checkboxArr2 = this.data.checkboxArr2;//选项集合
    checkboxArr2[index].checked = !checkboxArr2[index].checked;//改变当前选中的checked值
    this.setData({
      checkboxArr2: checkboxArr2
    });
  },
  checkboxChange2: function (e) {
    var checkValue8 = e.detail.value;
    this.setData({
      checkValue8: checkValue8
    });
    console.log(this.data.checkValue8)
  },

  checkbox3: function (e) {
    var index = e.currentTarget.dataset.index;//获取当前点击的下标
    var checkboxArr3 = this.data.checkboxArr3;//选项集合
    checkboxArr3[index].checked = !checkboxArr3[index].checked;//改变当前选中的checked值
    this.setData({
      checkboxArr3: checkboxArr3
    });
  },
  checkboxChange3: function (e) {
    var checkValue10 = e.detail.value;
    this.setData({
      checkValue10: checkValue10
    });
    console.log(this.data.checkValue10)
  },

  formSubmit: function (e) {
    if(getlength(this.data.checkValue4) == 0 || getlength(this.data.checkValue4) == 1){
      this.setData({
        radar2:1
      })
      console.log('负债水平',this.data.radar2)
    } else if(getlength(this.data.checkValue4) == 2){
      this.setData({
        radar2:2
      })
      console.log('负债水平',this.data.radar2)
    } else if(getlength(this.data.checkValue4) == 3){
      this.setData({
        radar2:3
      })
      console.log('负债水平',this.data.radar2)
    } else if(getlength(this.data.checkValue4.length) == 4){
      this.setData({
        radar2:4
      })
      console.log('负债水平',this.data.radar2)
    }
    if(this.data.checkValue1 == null || this.data.checkValue2 == null || this.data.checkValue3 == null|| this.data.checkValue4 == null || this.data.checkValue5 == null|| this.data.checkValue6 == null|| this.data.checkValue7 == null|| this.data.checkValue8 == null|| this.data.checkValue9 == null|| this.data.checkValue10 == null){
      wx.showToast({
        icon:"none",
        title: '请完成所有题目',
      })
    } else{
      this.setData({
        showans:false,
        radar:[this.data.radar1,this.data.radar2,this.data.radar3,this.data.radar4,this.data.radar5]
      })
      console.log('雷达图依次为（收入稳定、负债水平、财富水平、风险偏好、理财经验）：',this.data.radar)
      //作雷达图
      var options = {
        data: [{ value: this.data.radar, color: "#FFFF00" }],
        xLabel: ['收入稳定', '负债水平', '财富水平', '风险偏好', '理财经验'],
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
  },
  radar11: function(e){
    this.setData({
      radar1:1
    })
    console.log('收入稳定',this.data.radar1)
  },
  radar12: function(e){
    this.setData({
      radar1:2
    })
    console.log('收入稳定',this.data.radar1) 
  },
  radar13: function(e){
    this.setData({
      radar1:3
    })
    console.log('收入稳定',this.data.radar1)
  },
  radar14: function(e){
    this.setData({
      radar1:4
    })
    console.log('收入稳定',this.data.radar1)
  },
  radar31: function(e){
    this.setData({
      radar3:1
    })
    console.log('财富水平',this.data.radar3)
  },
  radar32: function(e){
    this.setData({
      radar3:2
    })
    console.log('财富水平',this.data.radar3)
  },
  radar33: function(e){
    this.setData({
      radar3:3
    })
    console.log('财富水平',this.data.radar3)
  },
  radar34: function(e){
    this.setData({
      radar3:4
    })
    console.log('财富水平',this.data.radar3)
  },
  radar41: function(e){
    this.setData({
      radar4:1
    })
    console.log('风险偏好',this.data.radar4)
  },
  radar42: function(e){
    this.setData({
      radar4:2
    })
    console.log('风险偏好',this.data.radar4)
  },
  radar43: function(e){
    this.setData({
      radar4:3
    })
    console.log('风险偏好',this.data.radar4)
  },
  radar44: function(e){
    this.setData({
      radar4:4
    })
    console.log('风险偏好',this.data.radar4)
  },
  radar51: function(e){
    this.setData({
      radar5:1
    })
    console.log('理财经验',this.data.radar5)
  },
  radar52: function(e){
    this.setData({
      radar5:2
    })
    console.log('理财经验',this.data.radar5)
  },
  radar53: function(e){
    this.setData({
      radar5:3
    })
    console.log('理财经验',this.data.radar5)
  },
  radar54: function(e){
    this.setData({
      radar5:4
    })
    console.log('理财经验',this.data.radar5)
  }
  

})
