#coding:utf-8
import matplotlib.pyplot as plt
import pandas as pd
import pandas_datareader.data as web
import time
import numpy as np
from sklearn.preprocessing import MinMaxScaler
from keras.models import Sequential
from keras.layers import Dense, LSTM

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

datalen=365  #近180天的股票数据
content='Close'
data=get_stock_history(stock_code,datalen,content)
print(data)

df = data



# 创建数据框
data = df.sort_index(ascending=True, axis=0)
new_data = pd.DataFrame(index=range(0,len(df)),columns=['Close'])
for i in range(0,len(data)):
    # new_data['Date'][i] = data['Date'][i]
    new_data['Close'][i] = data['Close'][i]

# 创建训练集和验证集
dataset = new_data.values

train = dataset[0:200,:]
valid = dataset[200:,:]

# 将数据集转换为x_train和y_train
scaler = MinMaxScaler(feature_range=(0, 1))
scaled_data = scaler.fit_transform(dataset)

x_train, y_train = [], []

for i in range(60,len(train)):
    x_train.append(scaled_data[i-60:i,0])
    y_train.append(scaled_data[i,0])
x_train, y_train = np.array(x_train), np.array(y_train)

x_train = np.reshape(x_train, (x_train.shape[0],x_train.shape[1],1))

# 创建和拟合LSTM网络
model = Sequential()
model.add(LSTM(units=50, return_sequences=True, input_shape=(x_train.shape[1],1)))
model.add(LSTM(units=50))
model.add(Dense(1))

model.compile(loss='mean_squared_error', optimizer='adam')
model.fit(x_train, y_train, epochs=5, batch_size=1, verbose=2)

# 预测
inputs = new_data[len(new_data) - len(valid) - 60:].values
inputs = inputs.reshape(-1,1)
inputs  = scaler.transform(inputs)

X_test = []
for i in range(60,inputs.shape[0]):
    X_test.append(inputs[i-60:i,0])
X_test = np.array(X_test)


X_test = np.reshape(X_test, (X_test.shape[0],X_test.shape[1],1))
closing_price = model.predict(X_test)
closing_price = scaler.inverse_transform(closing_price)

rms = np.sqrt(np.mean(np.power((valid-closing_price),2)))
print(rms)

train = new_data[:200]
valid = new_data[200:]
#解决中文显示问题
plt.rcParams['font.sans-serif']=['SimHei']
plt.rcParams['axes.unicode_minus'] = False

valid['Predictions'] = closing_price
plt.plot(new_data['Close'])
plt.plot(valid[['Close','Predictions']])
plt.title('股票代码'+stock_code+'预测情况')
plt.show()

