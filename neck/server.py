from flask import Flask, request
from flask import render_template
import requests as req
import time

application = Flask(__name__, template_folder="./", static_folder="./", static_url_path="")

@application.route("/")
def hello():
    return render_template('index.html')


if __name__ == "__main__":
    application.run(host="0.0.0.0",port=8080,ssl_context=('sec/localhost+2.pem', 'sec/localhost+2-key.pem'), debug=True)