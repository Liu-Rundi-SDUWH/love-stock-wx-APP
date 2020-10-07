# -*- coding: utf-8 -*-
from flask import Flask, json, request,jsonify
import numpy as np
# import joblib
import baostock as bs
import pandas as pd
import time
import datetime
import pandas_datareader.data as web
import requests,re,json,time,os
import lxml #一个Python库,使用它可以轻松处理XML和HTML文件,还可以用于web爬取
from lxml import etree
from aip import AipNlp #百度AI情感函数(用pip install baidu-aip 安装)
from sklearn.preprocessing import MinMaxScaler
from keras.models import Sequential
from keras.layers import Dense, LSTM

app = Flask(__name__)

def jingzichshouyi(stock_code,myyear,myquarter):
    list1 = []
    rs1 = bs.query_profit_data(code=stock_code, year=myyear, quarter=myquarter)
    while (rs1.error_code == '0') & rs1.next():
         list1.append(rs1.get_row_data())
    result1 = pd.DataFrame(list1, columns=rs1.fields)
    return result1[['roeAvg']]
def getstock(stocknumber):
    rep1 = requests.get('https://api.doctorxiong.club/v1/stock'+'?code='+stocknumber)
    rep1.encoding = 'utf-8'
    indistock={'price':rep1.json()['data'][0]['price'],'changePercent':rep1.json()['data'][0]['changePercent'],'volume':rep1.json()['data'][0]['volume'],'turnover':rep1.json()['data'][0]['turnover']}
    return indistock
def tostockcode(info):
    rep = requests.get('https://api.doctorxiong.club/v1/stock/all')
    rep.encoding = 'utf-8'
    for item in rep.json()['data']:
        if info==item[0] or info==item[1]:
            return item[0]
    return 0
#######传入股票代码"sz000001"形式，返回近3年3*4+今年2个季度的净资产收益率
@app.route('/jingzichan', methods=['GET', 'POST'])
def JingziC():
    info = request.values.get("data")
    print(info)
    jiduarr = {'股票存在状态': 1, '第一季度': [], '第二季度': [], '第三季度': [], '第四季度': []}
    stocknumber = tostockcode(info)
    if stocknumber == 0:
        jiduarr['股票存在状态'] = 0
    else:
        stock_code = stocknumber[0:2] + '.' + stocknumber[2:]
        today = datetime.datetime.today()
        year = today.year
        month = today.month
        # 登陆系统
        lg = bs.login()
        ####获取净资产收益率
        jingzi = []
        jidu1 = []
        jidu2 = []
        jidu3 = []
        jidu4 = []

        jidu = int(month / 3) - 1
        # for i in range(4):
        #     jingzi.append(np.array(jingzichshouyi(stock_code, year-3, i + 1))[0, 0])
        for i in range(4):
            jingzi.append(np.array(jingzichshouyi(stock_code, year - 2, i + 1))[0, 0])
        for i in range(4):
            jingzi.append(np.array(jingzichshouyi(stock_code, year - 1, i + 1))[0, 0])
        if jidu > 0:
            for i in range(jidu):
                jingzi.append(np.array(jingzichshouyi(stock_code, year, i + 1))[0, 0])
        jingzi = list(map(eval, jingzi))
        # 登出系统
        bs.logout()
        for i in range(len(jingzi)):
            if (i + 1) % 4 == 1:
                jidu1.append(jingzi[i])
            elif (i + 1) % 4 == 2:
                jidu2.append(jingzi[i])
            elif (i + 1) % 4 == 3:
                jidu3.append(jingzi[i])
            else:
                jidu4.append(jingzi[i])
        jiduarr['第一季度'] = list(map(lambda x: eval('%.4f' % x), jidu1))
        jiduarr['第二季度'] = list(map(lambda x: eval('%.4f' % x), jidu2))
        jiduarr['第三季度'] = list(map(lambda x: eval('%.4f' % x), jidu3))
        jiduarr['第四季度'] = list(map(lambda x: eval('%.4f' % x), jidu4))
    return json.dumps(jiduarr, ensure_ascii=False)


#########传入股票代码"sz000001"形式，返回滚动市盈率，滚动市销率，滚动市现率，滚动市净率，所属行业，
# 行业信息（行业板块代码，板块名称，平均价，涨跌额，涨跌幅度，成交量，成交额，该行业股票数，领涨股），
# 股票信息（实时价格，涨跌百分比，成交量，成交额）
@app.route('/', methods=['GET', 'POST'])
def basic_mian():
    info = request.values.get("data")
    stocknumber = tostockcode(info)
    stock_code = stocknumber[0:2] + '.' + stocknumber[2:]
    startdate = time.strftime('%Y-%m-%d', time.localtime(time.time() - 20 * 24 * 60 * 60))#获取近20天的那些率
    enddate = time.strftime('%Y-%m-%d', time.localtime(time.time()))
    # 登陆系统
    lg = bs.login()
    rs2 = bs.query_history_k_data_plus(stock_code,
                                      "date,code,close,peTTM,pbMRQ,psTTM,pcfNcfTTM",
                                      start_date=startdate, end_date=enddate,
                                      frequency="d", adjustflag="3")
    list2 = []
    while (rs2.error_code == '0') & rs2.next():
        # 获取一条记录，将记录合并在一起
        list2.append(rs2.get_row_data())
    result2 = pd.DataFrame(list2, columns=rs2.fields)
    peTTM=result2[['peTTM']]#每天的滚动市盈率
    psTTM = result2[['psTTM']]  # 每天的滚动市销率
    pcfNcfTTM = result2[['pcfNcfTTM']]  # 每天的滚动市现率
    pbMRQ=result2[['pbMRQ']]#每天的滚动市净率
    ###获取行业分类数据
    rs3 = bs.query_stock_industry(code=stock_code)
    list3 = []
    while (rs3.error_code == '0') & rs3.next():
        # 获取一条记录，将记录合并在一起
        list3.append(rs3.get_row_data())
    result3 = pd.DataFrame(list3, columns=rs3.fields)
    hangye=result3
    ####添加
    #industryinfo=getindustry(str(np.array(hangye)[0,3]))
    stockinfo=getstock(stocknumber)
    # 登出系统
    bs.logout()

    dic = { 'peTTM': [],'psTTM': [],'pcfNcfTTM': [],'pbMRQ': [],'hangye': [],'stockinfo':{}}
    dic['peTTM'] = np.array(peTTM).reshape(1,len(np.array(peTTM))).tolist()[0]
    dic['peTTM']= list(map(lambda x: eval('%.4f' % x), map(eval, dic['peTTM'])))          #list(map(eval, dic['peTTM']))
    dic['psTTM'] = np.array(psTTM).reshape(1,len(np.array(psTTM))).tolist()[0]
    dic['psTTM'] = list(map(lambda x: eval('%.4f' % x), map(eval, dic['psTTM'])))  #list(map(eval, dic['psTTM']))
    dic['pcfNcfTTM'] = np.array(pcfNcfTTM).reshape(1,len(np.array(pcfNcfTTM))).tolist()[0]
    dic['pcfNcfTTM'] =  list(map(lambda x: eval('%.4f' % x), map(eval, dic['pcfNcfTTM'])))    #list(map(eval, dic['pcfNcfTTM']))
    dic['pbMRQ'] = np.array(pbMRQ).reshape(1,len(np.array(pbMRQ))).tolist()[0]
    dic['pbMRQ'] = list(map(lambda x: eval('%.4f' % x), map(eval, dic['pbMRQ'])))     #list(map(eval, dic['pbMRQ']))
    dic['hangye'] = np.array(hangye).tolist()[0]

    dic['stockinfo'] = np.array(stockinfo).tolist()
    dic['stockinfo']['price'] = float(dic['stockinfo']['price'])
    dic['stockinfo']['changePercent'] = float(dic['stockinfo']['changePercent'])
    dic['stockinfo']['volume'] = float(dic['stockinfo']['volume'])
    dic['stockinfo']['turnover'] = float(dic['stockinfo']['turnover'])
    return json.dumps(dic,ensure_ascii=False)
#####返回2015年1月至今的货币供应量
@app.route('/huobiliang', methods=['GET', 'POST'])
def Zijinmian():
    today = datetime.datetime.today()
    year = today.year
    month = today.month
    dic={'m2':[]}
    # 登陆系统
    lg = bs.login()
    # 获取货币供应量
    if month < 10:
        enddate = str(year) + '-' + '0' + str(month)
    else:
        enddate = str(year) + '-' + str(month)
    rs5 = bs.query_money_supply_data_month(start_date="2020-01", end_date=enddate)
    # 打印结果集
    data_list = []
    while (rs5.error_code == '0') & rs5.next():
        # 获取一条记录，将记录合并在一起
        data_list.append(rs5.get_row_data())
    result = pd.DataFrame(data_list, columns=rs5.fields)
    print(np.array(result['m2Month']))
    # 登出系统
    bs.logout()
    dic['m2']=np.array(result['m2Month']).tolist()
    dic['m2'] = list(map(eval, dic['m2']))
    return json.dumps(dic,ensure_ascii=False)
#####返回2010年1月1日至今的贷款利率（随政策变化，不是等时间间隔的）
###依次是：6个月贷款利率,6个月至1年贷款利率,1年至3年贷款利率,3年至5年贷款利率,5年以上贷款利率,
@app.route('/lilv', methods=['GET', 'POST'])
def Lilv():
    # 登陆系统
    lg = bs.login()
    # 获取贷款利率
    rs6 = bs.query_loan_rate_data(start_date="2010-01-01", end_date="2020-12-31")
    # 打印结果集
    data_list = []
    while (rs6.error_code == '0') & rs6.next():
        # 获取一条记录，将记录合并在一起
        data_list.append(rs6.get_row_data())
    result2 = pd.DataFrame(data_list, columns=rs6.fields)
    # 登出系统
    bs.logout()
    lilv = {'loanRate6Month': [], 'loanRate6MonthTo1Year': [], 'loanRate1YearTo3Year': [], 'loanRate3YearTo5Year': [],
            'loanRateAbove5Year': []}
    lilv['loanRate6Month'] = np.array(result2['loanRate6Month']).tolist()
    lilv['loanRate6MonthTo1Year'] = np.array(result2['loanRate6MonthTo1Year']).tolist()
    lilv['loanRate1YearTo3Year'] = np.array(result2['loanRate1YearTo3Year']).tolist()
    lilv['loanRate3YearTo5Year'] = np.array(result2['loanRate3YearTo5Year']).tolist()
    lilv['loanRateAbove5Year'] = np.array(result2['loanRateAbove5Year']).tolist()
    lilv['loanRate6Month'] = list(map(eval, lilv['loanRate6Month']))
    lilv['loanRate6MonthTo1Year'] = list(map(eval, lilv['loanRate6MonthTo1Year']))
    lilv['loanRate1YearTo3Year'] = list(map(eval, lilv['loanRate1YearTo3Year']))
    lilv['loanRate3YearTo5Year'] = list(map(eval, lilv['loanRate3YearTo5Year']))
    lilv['loanRateAbove5Year'] = list(map(eval, lilv['loanRateAbove5Year']))
    return json.dumps(lilv,ensure_ascii=False)
####返回4个热门股票名称
@app.route('/hot', methods=['GET', 'POST'])
def Hot():
    rep1 = requests.get('https://api.doctorxiong.club/v1/stock/hot')
    rep1.encoding = 'utf-8'
    hot=[]
    hot.append(rep1.json()['data'][0]['name'])
    hot.append(rep1.json()['data'][1]['name'])
    hot.append(rep1.json()['data'][2]['name'])
    hot.append(rep1.json()['data'][3]['name'])
    return json.dumps(hot,ensure_ascii=False)
#####获取近20天的涨幅（除去不交易日）
@app.route('/zhangfu', methods=['GET', 'POST'])
def get_stock_history():
    info = request.values.get("data")
    stocknumber = tostockcode(info)
    content='Close'
    start_date = time.strftime('%Y-%m-%d', time.localtime(time.time() - 20 * 24 * 60 * 60))
    end_date = time.strftime('%Y-%m-%d', time.localtime(time.time()))  ##获取的今日时间
    if stocknumber[0:2] == 'sz':
        stock_code = stocknumber[2:] + '.' + 'SZ'
    else:
        stock_code = stocknumber[2:] + '.' + 'SS'
    df = web.DataReader(stock_code, data_source='yahoo', start=start_date, end=end_date)
    Closeprice=np.array(df[[content]]).reshape(1,np.array(df[[content]]).shape[0])[0]
    zf=[]
    for i in range(len(Closeprice)-1):
        zf.append((Closeprice[i+1]-Closeprice[i])/Closeprice[i]*100)
    zf=list(map(lambda x: eval('%.4f' % x), zf))
    return json.dumps(zf,ensure_ascii=False)
# #####预测
@app.route('/prediction', methods=['GET', 'POST'])
def LSTM_predict_close():
    #info ='sz000001'
    info=request.values.get("data")
    stocknumber = tostockcode(info)
    ####################获取股票历史数据（近365天的交易记录,获取的是每天的数据）
    start_date = time.strftime('%Y-%m-%d', time.localtime(time.time() - 365 * 24 * 60 * 60))
    end_date = time.strftime('%Y-%m-%d', time.localtime(time.time()))  ##获取的今日时间
    if stocknumber[0:2] == 'sz':
        stock_code = stocknumber[2:] + '.' + 'SZ'
    else:
        stock_code = stocknumber[2:] + '.' + 'SS'
    df = web.DataReader(stock_code, data_source='yahoo', start=start_date, end=end_date)

    # 创建数据框
    data = df.sort_index(ascending=True, axis=0)
    new_data = pd.DataFrame(index=range(0, len(df)), columns=['Close'])
    for i in range(0, len(data)):
        new_data['Close'][i] = data['Close'][i]
    # 创建训练集和验证集
    dataset = new_data.values
    train = dataset

    # 将数据集转换为x_train和y_train
    scaler = MinMaxScaler(feature_range=(0, 1))
    scaled_data = scaler.fit_transform(dataset)

    x_train, y_train = [], []
    for i in range(60, len(train)):
        x_train.append(scaled_data[i - 60:i, 0])
        y_train.append(scaled_data[i, 0])
    x_train, y_train = np.array(x_train), np.array(y_train)

    x_train = np.reshape(x_train, (x_train.shape[0], x_train.shape[1], 1))

    # 创建和拟合LSTM网络
    model = Sequential()
    model.add(LSTM(units=50, return_sequences=True, input_shape=(x_train.shape[1], 1)))
    model.add(LSTM(units=50))
    model.add(Dense(1))

    model.compile(loss='mean_squared_error', optimizer='adam')
    model.fit(x_train, y_train, epochs=4, batch_size=1, verbose=2)

    # 使用过去值来预测
    inputs = new_data.values
    inputs = inputs.reshape(-1, 1)
    inputs = scaler.transform(inputs)

    X_test = []
    for i in range(60):
        a = len(inputs) - (60 - i)
        X_test.append(inputs[a - 60:a, 0])

    X_test = np.array(X_test)
    X_test = np.reshape(X_test, (X_test.shape[0], X_test.shape[1], 1))
    closing_price = model.predict(X_test)
    closing_price = scaler.inverse_transform(closing_price)
    #收盘价预测
    prediction = []
    for i in range(len(closing_price)):
        prediction.append(closing_price[i][0])
    #涨幅预测
    zhangfu = list()
    for i in range(1, len(closing_price)):
        zf = (closing_price[i][0] - closing_price[i - 1][0]) / closing_price[i - 1][0] * 100
        zhangfu.append(zf)
    prediction=np.array(prediction).tolist()
    zhangfu = np.array(zhangfu).tolist()
    dic={'收盘价预测':list(map(lambda x: eval('%.4f' % x), prediction)),'涨幅预测':list(map(lambda x: eval('%.4f' % x), zhangfu))}
    #print('ok')
    return json.dumps(dic,ensure_ascii=False)

#########获取日K线图所需数据
@app.route('/dayk', methods=['GET', 'POST'])
def get_Dkinfo():
    info = request.values.get("data")
    stocknumber = tostockcode(info)
    content='Close'
    start_date = time.strftime('%Y-%m-%d', time.localtime(time.time() - 180 * 24 * 60 * 60))
    end_date = time.strftime('%Y-%m-%d', time.localtime(time.time()))  ##获取的今日时间
    # if stocknumber[-2:] != 'ss':
    #     stock_code = str(stocknumber) + '.ss'
    if stocknumber[0:2] == 'sz':
        stock_code = stocknumber[2:] + '.' + 'SZ'
    else:
        stock_code = stocknumber[2:] + '.' + 'SS'
    df = web.DataReader(stock_code, data_source='yahoo', start=start_date, end=end_date)
    kinfo=[]
    for i in range(len(df.index.values)):
        kinfo.append([])
        if str(df.index.values[i])[5]=='0':
            mydate=str(df.index.values[i])[0:4]+'/'+str(df.index.values[i])[6]+'/'+str(df.index.values[i])[8:10]
        else:
            mydate = str(df.index.values[i])[0:4] + '/' + str(df.index.values[i])[5:7] + '/' + str(df.index.values[i])[8:10]
        kinfo[i].append(mydate)
        kinfo[i].append(eval('%.2f' % df['Open'][i]))
        kinfo[i].append(eval('%.2f' % df['Close'][i]))
        kinfo[i].append(eval('%.2f' % df['Low'][i]))
        kinfo[i].append(eval('%.2f' % df['High'][i]))
    return json.dumps(kinfo,ensure_ascii=False)
#########获取周K线图所需数据
@app.route('/weekk', methods=['GET', 'POST'])
def get_Wkinfo():
    info = request.values.get("data")
    stocknumber = tostockcode(info)
    stock_code = stocknumber[0:2] + '.' + stocknumber[2:]
    # 登陆系统
    lg = bs.login()
    # 获取沪深A股历史K线数据
    startdate = time.strftime('%Y-%m-%d', time.localtime(time.time() - 365 * 24 * 60 * 60))
    enddate = time.strftime('%Y-%m-%d', time.localtime(time.time()))
    rs = bs.query_history_k_data_plus(stock_code,
        "date,open,close,low,high",
        start_date=startdate, end_date=enddate,
        frequency="w", adjustflag="3")
    # 输出结果
    data_list = []
    while (rs.error_code == '0') & rs.next():
        # 获取一条记录，将记录合并在一起
        data_list.append(rs.get_row_data())
    result = pd.DataFrame(data_list, columns=rs.fields)
    weekkinfo=[]
    for i in range(len(result['date'])):
        weekkinfo.append([])
        if result['date'][i][5]=='0':
            mydate=result['date'][i][0:4]+'/'+result['date'][i][6]+'/'+result['date'][i][8:10]
        else:
            mydate = result['date'][i][0:4] + '/' + result['date'][i][5:7] + '/' + result['date'][i][8:10]
        weekkinfo[i].append(mydate)
        weekkinfo[i].append(eval('%.2f' % float(result['open'][i])))
        weekkinfo[i].append(eval('%.2f' % float(result['close'][0])))
        weekkinfo[i].append(eval('%.2f' % float(result['low'][0])))
        weekkinfo[i].append(eval('%.2f' % float(result['high'][0])))
    return json.dumps(weekkinfo,ensure_ascii=False)

#######传入股票代号number
@app.route('/emotion', methods=['GET', 'POST'])
def newsNLP(): # 或者是"sz000001"
    #info ='sh600519'
    info = request.values.get("data")
    print(info)
    stocknumber = tostockcode(info)
    if stocknumber[0:2] == 'sz':
        number = stocknumber[2:]
    else:
        number = stocknumber[2:]
    # print('这是传入的股票代码',number)

    url = "http://stock.jrj.com.cn/share," + number + ",ggxw.shtml"  ###http://stock.jrj.com.cn/share,sh000001.shtml
    flag = 0  # 设置这个地方是为了每次初次调用可以覆盖掉原来的文件，但是在调用过程中是一直往txt文件里加内容的
    for i in range(1, 3):  # 获取前三页的新闻
        try:
            if i == 1:
                url = "http://stock.jrj.com.cn/share," + number + ",ggxw.shtml"
            else:
                url = "http://stock.jrj.com.cn/share," + number + ",ggxw_" + str(i) + ".shtml"
        except:
            pass

        # 得到页面的内容并保存
        try:  # 解决服务器延时的问题try
            pagedata = requests.get(url).content.decode("gbk")
            mytree = lxml.etree.HTML(pagedata)
            # 取所有的内容
            datas = mytree.xpath("//*[@class = \"newlist\"]//li/span/a/text()")
            # print('datas',datas)
            for data in datas:
                data = data + "\r\n"
                if flag == 0:
                    with open(number + ".txt", "w") as file:
                        file.write(data)
                        file.flush()
                    flag = 1
                    # print('内容0', datas)
                else:
                    with open(number + ".txt", "a") as file:
                        file.write(data)
                        file.flush()
            # print('内容',datas)
        except:
            print("服务器超时")

    # 调用百度云自然语言处理接口，进行情感倾向分析

    # 输入百度云账号(这是迪迪迪的百度云账号）
    APP_ID = '22782727'
    API_KEY = 'UPtBOAie355KzGq3aRZnTY5Y'
    SECRET_KEY = '82LQOlhGB2U133X5rPBHtL7Avpbl8sT7'
    pos = 0  # 正向情感初值设为0
    nav = 0  # 负向情感初值设为0
    posans = 0  # 正向情感总和
    navans = 0  # 负向情感总和
    i = 0

    posarr = list()  # 设置一个列表，可以存放情感数值的时间序列值（这是正向情感的）
    navarr = list()  # 设置一个列表，可以存放情感数值的时间序列值（这是负向情感的）
    aipNlp = AipNlp(APP_ID, API_KEY, SECRET_KEY)  # 开始调用百度云API
    for line in open(number + ".txt", "r", encoding="UTF-8"):  # 读文件
        aline = line.replace("\r\n", "").strip()
        if len(aline) != 0:
            try:
                result = aipNlp.sentimentClassify(aline)  # 调用百度接口
                positive = result['items'][0]['positive_prob']
                nagative = result['items'][0]['negative_prob']
                i += 1
                if positive >= nagative:
                    pos += 1
                else:
                    nav += 1
                avgpos = pos / i
                navavg = nav / i

                posarr.append(float(format(avgpos, ".4f")))
                navarr.append(float(format(navavg, ".4f")))
                # print(i, format(avgpos,".4f"),format(navavg,".4f"))   #打印出每一条新闻对应的情感值得分

            except:
                pass
    for p in range(len(posarr)):
        posans += posarr[p]
    posav = posans / (len(posarr))

    for n in range(len(navarr)):
        navans += navarr[n]
    navavg = navans / len(navarr)

    # print('新闻的积极数值变化',posarr)
    # print('新闻的消极数值变化',navarr)
    # print('新闻的平均积极数值',posav)
    # print('新闻的平均消极数值',navavg)
    # print('目前来看新闻的情感分析数值（正数为积极，负数为消极）',posav-navavg)
    news={'积极数值变化':posarr,'消极数值变化':navarr,'平均积极数值':posav,'平均消极数值':navavg,'情感分析数值':posav-navavg}
    return json.dumps(news,ensure_ascii=False)
if __name__ == '__main__':
    app.run(debug=True,host='0.0.0.0', port=5000)

