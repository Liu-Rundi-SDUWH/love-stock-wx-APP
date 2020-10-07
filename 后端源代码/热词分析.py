
import requests,re,json,time,os
import lxml #一个Python库,使用它可以轻松处理XML和HTML文件,还可以用于web爬取
from lxml import etree
from aip import AipNlp #百度AI情感函数(用pip install baidu-aip 安装)
import matplotlib.pyplot as plt

#传入股票代号number
def newsNLP(number):
    print('这是传入的股票代码',number)

    url = "http://stock.jrj.com.cn/share,"+number+",ggxw.shtml"
    flag = 0 #设置这个地方是为了每次初次调用可以覆盖掉原来的文件，但是在调用过程中是一直往txt文件里加内容的
    for i in range(1, 3):  # 获取前三页的新闻
        try:
            if i == 1:
                url = "http://stock.jrj.com.cn/share," + number + ",ggxw.shtml"
            else:
                url = "http://stock.jrj.com.cn/share," + number + ",ggxw_" + str(i) + ".shtml"
        except:
            pass

        # 得到页面的内容并保存
        try:  #解决服务器延时的问题try
            pagedata = requests.get(url).content.decode("gbk")
            mytree = lxml.etree.HTML(pagedata)
            # 取所有的内容
            datas = mytree.xpath("//*[@class = \"newlist\"]//li/span/a/text()")
            print('datas',datas)
            for data in datas:
                data= data+"\r\n"
                if flag == 0:
                    with open(number + ".txt", "w") as file:
                        file.write(data)
                        file.flush()
                    flag = 1
                    print('内容0', datas)
                else:
                    with open(number+".txt","a") as file:
                        file.write(data)
                        file.flush()
            print('内容',datas)
        except:
            print("服务器超时")

    #调用百度云自然语言处理接口，进行情感倾向分析

    #输入百度云账号(这是迪迪迪的百度云账号）<-就不展示了
    APP_ID = '*************'
    API_KEY = '************'
    SECRET_KEY = '*************'
    pos = 0  #正向情感初值设为0
    nav = 0  #负向情感初值设为0
    posans = 0 #正向情感总和
    navans = 0 #负向情感总和
    i = 0

    posarr = list()  #设置一个列表，可以存放情感数值的时间序列值（这是正向情感的）
    navarr = list()  #设置一个列表，可以存放情感数值的时间序列值（这是负向情感的）
    aipNlp = AipNlp(APP_ID, API_KEY, SECRET_KEY)  #开始调用百度云API
    for line in open(number+".txt","r",encoding="gbk"):   #读文件
        aline = line.replace("\r\n","").strip()
        if len(aline) != 0:
            try:
                result = aipNlp.sentimentClassify(aline) #调用百度接口
                positive = result['items'][0]['positive_prob']
                nagative = result['items'][0]['negative_prob']
                i += 1
                if positive >= nagative:
                    pos += 1
                else:
                    nav += 1
                avgpos = pos / i
                navavg = nav/i

                posarr.append(float(format(avgpos,".4f")))
                navarr.append(float(format(navavg,".4f")))
                print(i, format(avgpos,".4f"),format(navavg,".4f"))   #打印出每一条新闻对应的情感值得分

            except:
                pass
    for p in range(len(posarr)):
        posans += posarr[p]
    posav = posans/(len(posarr))

    for n in range(len(navarr)):
        navans += navarr[n]
    navavg = navans/len(navarr)

    print('新闻的积极数值变化',posarr)
    print('新闻的消极数值变化',navarr)
    print('新闻的平均积极数值',posav)
    print('新闻的平均消极数值',navavg)
    print('目前来看新闻的情感分析数值（正数为积极，负数为消极）',posav-navavg)
    print(flag)
    flag = 0
    print(flag)

    return posarr,navarr,posav,navavg,(posav-navavg)

number = '000007'
# number = '600210'
a,b,c,d,e = newsNLP(number)

print(a)
print(b)
a.reverse()
b.reverse()
plt.plot(a,'g')
plt.plot(b,'r')
plt.show()

