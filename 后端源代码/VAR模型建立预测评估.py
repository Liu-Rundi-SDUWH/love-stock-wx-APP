#coding:utf-8
import matplotlib.pyplot as plt
import pandas_datareader.data as web
import time
import statsmodels.tsa.stattools as stat
import pandas as pd
import numpy as np



####################获取股票历史数据（从datalen天之前到现今天,获取的是每天的数据）
def get_stock_history( stock_code,datalen,content):
    start_date = time.strftime('%Y-%m-%d', time.localtime(time.time() - datalen * 24 * 60 * 60))
    end_date = time.strftime('%Y-%m-%d', time.localtime(time.time()))  ##获取的今日时间
    if stock_code[-2:] != 'ss':
        stock_code = str(stock_code) + '.ss'
    df = web.DataReader(stock_code, data_source='yahoo', start=start_date, end=end_date)
    return df

# stock_code='000001'   #股票代码平安银行
# stock_code='600519'   #股票代码贵州茅台
stock_code='600522'   #股票代码中天科技
datalen=365
content='Close'
data=get_stock_history(stock_code,datalen,content)
print(data)

subdata = data.iloc[:,:4]
# print(subdata.shape)

#平稳性检验
pvalue = stat.adfuller(subdata.values[:,3], 1)[1]
print("指标 ",data.columns[3]," 单位根检验的p值为：",pvalue)

#一阶差分并进行平稳性检验
subdata_diff1 = subdata.iloc[1:,:].values - subdata.iloc[:-1,:].values
pvalue = stat.adfuller(subdata_diff1[:,3], 1)[1]
print("指标 ",data.columns[3]," 单位根检验的p值为：",pvalue)

#  模型阶数从1开始逐一增加
rows, cols = subdata_diff1.shape
aicList = []
lmList = []

for p in range(1,11):
    baseData = None
    for i in range(p, rows):
        tmp_list = list(subdata_diff1[i,:]) + list(subdata_diff1[i-p:i].flatten())
        if baseData is None:
            baseData = [tmp_list]
        else:
            baseData = np.r_[baseData, [tmp_list]]
    X = np.c_[[1] * baseData.shape[0], baseData[:, cols:]]
    Y = baseData[:, 0:cols]
    coefMatrix = np.matmul(np.matmul(np.linalg.inv(np.matmul(X.T, X)), X.T), Y)
    aic = np.log(np.linalg.det(np.cov(Y - np.matmul(X, coefMatrix), rowvar=False))) + 2 * (coefMatrix.shape[0] - 1) ** 2 * p / baseData.shape[0]
    aicList.append(aic)
    lmList.append(coefMatrix)

#对比查看阶数和AIC
ac=pd.DataFrame({"P":range(1,11),"AIC":aicList})
print('阶数查看',ac)

p = np.argmin(aicList) + 1
n = rows

preddf = None
newdata = np.array(subdata.iloc[:,:].values)

#预测未来60天的情况
for i in range(60):
    predData = list(subdata_diff1[n + i - p:n + i].flatten())
    predVals = np.matmul([1] + predData, lmList[p - 1])

    #  使用逆差分运算，还原预测值
    predVals = newdata[n+i,:] + predVals

    if preddf is None:
        preddf = [predVals]
    else:
        preddf = np.r_[preddf,[predVals]]

    newdata = np.r_[newdata, preddf]

    #  为subdata_diff1增加一条新记录
    subdata_diff1 = np.r_[subdata_diff1, [newdata[-2]-newdata[-1]]]
print('未来60天的预测情况',preddf)


#画图来看（更直观）
#解决中文显示问题
plt.rcParams['font.sans-serif']=['SimHei']
plt.rcParams['axes.unicode_minus'] = False

#选择后160天进行画图
plt.plot(range(160),subdata.iloc[-160:data.shape[0],3].values,'b')
plt.plot(range(100,100+60),preddf[:,3],'r')
plt.ylabel("$"+data.columns[3]+"$")
plt.title('股票代码'+stock_code+'预测情况')
plt.show()


