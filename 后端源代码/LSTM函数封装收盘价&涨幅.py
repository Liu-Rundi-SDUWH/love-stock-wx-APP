
import pandas as pd
import pandas_datareader.data as web
import time
import numpy as np
from sklearn.preprocessing import MinMaxScaler
from keras.models import Sequential
from keras.layers import Dense, LSTM
# from keras.utils.vis_utils import plot_model
# from IPpython.display import Image

def LSTM_predict_close(stock_code):
    ####################获取股票历史数据（近365天的交易记录,获取的是每天的数据）
    start_date = time.strftime('%Y-%m-%d', time.localtime(time.time() - 365 * 24 * 60 * 60))
    end_date = time.strftime('%Y-%m-%d', time.localtime(time.time()))  ##获取的今日时间
    if stock_code[-2:] != 'ss':
        stock_code = str(stock_code) + '.ss'
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
    model.fit(x_train, y_train, epochs=1, batch_size=1, verbose=2)

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

    # plot_model(model, to_file='model.png', show_shapes=True)
    # Image('model.png')
    return prediction,zhangfu

stock_code = '600797'
close_predict,zhangfu_predict = LSTM_predict_close(stock_code)
print(close_predict)
print(zhangfu_predict)
