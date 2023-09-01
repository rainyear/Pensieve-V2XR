from flask import Flask, request
from flask import render_template
import requests as req
import time

application = Flask(__name__, template_folder="./", static_folder="./", static_url_path="/")
AIGC_HOST = "http://192.168.0.112:7860"

@application.route("/")
def hello():
    return render_template('index.html')

@application.route("/aigc")
def aigc():
    return render_template('aigc/index.html')

@application.route("/api/get_loras")
def get_loras():
    api = f"{AIGC_HOST}/sdapi/v1/loras"
    res = req.get(api)
    time.sleep(1.5)
    return res.text
@application.route("/api/txt2img", methods=['POST'])
def txt2img():
    prompt = request.json['prompt']
    api = f"{AIGC_HOST}/sdapi/v1/txt2img"
    payload = {"prompt":prompt, "style": ["360Diffusion_v1"], "steps": 25}

    res = req.post(api, json=payload)
    print(res.json())
    return {"prompt":prompt, "res":res.json()}




if __name__ == "__main__":
    application.run(host="0.0.0.0",port=8888,ssl_context=('sec/localhost+2.pem', 'sec/localhost+2-key.pem'), debug=True)