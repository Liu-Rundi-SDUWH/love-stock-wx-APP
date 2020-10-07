#coding:utf-8
import matplotlib.pyplot as plt
import pandas_datareader.data as web
import time
import datetime
import numpy as np
from sklearn import preprocessing
from sklearn.linear_model import LinearRegression
from sklearn.neighbors import KNeighborsRegressor
from sklearn.linear_model import Ridge
from sklearn.preprocessing import PolynomialFeatures
from sklearn.pipeline import make_pipeline

####################获取股票历史数据（从datalen天之前到现今天,获取的是每天的数据）
def get_stock_history( stock_code,datalen):
    start_date = time.strftime('%Y-%m-%d', time.localtime(time.time() - datalen * 24 * 60 * 60))
    end_date = time.strftime('%Y-%m-%d', time.localtime(time.time()))  ##获取的今日时间
    if stock_code[-2:] != 'ss':
        stock_code = str(stock_code) + '.ss'
    df = web.DataReader(stock_code, data_source='yahoo', start=start_date, end=end_date)
    return df



stock_code='000001'   #股票代码
# stock_code='600519'   #股票代码
# stock_code='600522'   #股票代码
datalen=365  #近365天的股票数据
data=get_stock_history(stock_code,datalen)
print(data)

close_px = data['Adj Close']
#获得滚动平均值
mavg = close_px.rolling(window=10).mean()

#数据预处理

# 提取特征：高-低百分比和百分比变化。
dfreg = data.loc[:, ['Adj Close', 'Volume']]
#高-低百分比
dfreg['HL_PCT'] = (data['High'] - data['Low']) / data['Close'] * 100.0
#百分比变化
dfreg['PCT_change'] = (data['Close'] - data['Open']) / data['Open'] * 100.0
print(dfreg)

# 删除缺失值
dfreg.fillna(value=-99999, inplace=True)

# 确定预测的个数
# forecast_out = 14
forecast_out = 60

forecast_col = 'Adj Close'
dfreg['label'] = dfreg[forecast_col].shift(-forecast_out)  #把数据移动指定的位数
X = np.array(dfreg.drop(['label'], 1))
# 将数据标准化
X = preprocessing.scale(X)  #沿着某个轴标准化数据集，以均值为中心(X)

#分离出训练集和测试集
X_lately = X[-forecast_out:]
X = X[:-forecast_out]

y = np.array(dfreg['label'])
y = y[:-forecast_out]
y_lately = y[-forecast_out:]

# 模型建立
X_train = X
y_train = y


# Quadratic Regression 2
clfpoly2 = make_pipeline(PolynomialFeatures(2), Ridge())
clfpoly2.fit(X_train, y_train)

# Quadratic Regression 3
clfpoly3 = make_pipeline(PolynomialFeatures(3), Ridge())
clfpoly3.fit(X_train, y_train)

for i in [clfpoly2, clfpoly3]:
    forecast_set = i.predict(X_lately)
    print(forecast_set)
    dfreg['Forecast'] = np.nan
    print(dfreg)

    #画一个预测图

    last_date = dfreg.iloc[-1].name
    last_unix = last_date

    next_unix = last_unix + datetime.timedelta(days=1)


    dataset = list(dfreg['Adj Close'])

    # 解决中文显示问题
    plt.rcParams['font.sans-serif'] = ['SimHei']
    plt.rcParams['axes.unicode_minus'] = False

    plt.plot(dataset,'b')
    plt.plot(range(len(dataset)-len(forecast_set), len(dataset)),forecast_set,'r')
    plt.title('股票代码' + stock_code + '预测情况（60天）')
    plt.show()
    print(forecast_set)