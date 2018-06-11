from flask import Flask, request, jsonify
from model_test import response
from flask_cors import CORS,cross_origin
import json
import requests
import gpxpy.geo
import re


api_key = '' # enter your api key here
app = Flask(__name__)
CORS(app,resources=r'/*')

@app.route("/")
@app.route("/response", methods = ['POST','GET'])
def bot_reply():
    data=request.get_json()
    data['msg']=re.sub("\n","",data['msg'])
    res=response(data['msg'],show_details=True)
    if res['tag']=='category':
        name,category=get_category()
        r=jsonify({"tag":'category',"response":res['response'],"category":name})
        return r
    elif res['tag']=='restaurants':
        name,category=get_category()
        temp=data['msg'].lower()
        category_id = category[temp]
        print("hey after category")
        result=get_all_json(lat=data['lat'],lon=data['lon'],category=category_id)
        r= jsonify({"tag":'restaurants',"response":res['response'],"restaurants":result})
        return r
    else:
        return jsonify({"tag":'regular',"response":res['response']})


#res=get_all_json(lat=22.506396,lon=88.3949995,category=2)

def get_all(lat,lon,sort,category):
    print("hey in get all funt")
    url='https://developers.zomato.com/api/v2.1/search?count=5&radius=3500&sort=%s&order=desc&lat=%s&lon=%s&category=%s'%(sort,lat,lon,category)
    headers = {'user-key': api_key}
    r = requests.get(url, headers=headers)
    data = r.json()
    return data

def get_all_json(lat,lon,category):
    temp={}
    search={}
    res=get_all(lat=lat,lon=lon,sort="rating",category=category)
    print("hey in get alll json")
    count=0
    for i in res['restaurants']:
        temp={}
        temp['name']=i['restaurant']['name']
        temp['address']=i['restaurant']['location']['address']
        temp['rating']=i['restaurant']['user_rating']['aggregate_rating']
        temp['image_url']=i['restaurant']['featured_image']
        temp['view_more']=i['restaurant']['url']
        temp['cuisines']=i['restaurant']['cuisines']
        temp['currency']=i['restaurant']['currency']
        temp['average_cost_for_two']=i['restaurant']['average_cost_for_two']        
        temp['distance']=str(round(gpxpy.geo.haversine_distance(lat, lon,float(i['restaurant']['location']['latitude']),float(i['restaurant']['location']['longitude']))/1000,2))+" kms"
        temp['id']=i['restaurant']['id']
        search[str(count)]=temp
        count=count+1
    #search=json.dumps(search)
    return search




def get_category():
    zomato_api_key=api_key
    url='https://developers.zomato.com/api/v2.1/categories'
    headers = {'user-key': api_key}
    r = requests.get(url, headers=headers)
    data = r.json()
    category={}
    temp={}
    count=0
    for i in data['categories']:
        category[i['categories']['name'].lower()]=i['categories']['id']
        temp[str(count)]=i['categories']['name']
        count=count+1
    #return json file
    return temp,category




if __name__ == '__main__':
    app.run(debug=True,port=5000)
