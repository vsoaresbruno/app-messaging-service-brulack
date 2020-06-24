import os, time, datetime

from flask import Flask, render_template, session, request, redirect, url_for, jsonify
from flask_socketio import SocketIO, emit

app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
socketio = SocketIO(app)

channels = {"general":[]}

@app.route("/", methods=["GET", "POST"])
def index():
    if 'name' not in session:
        return redirect(url_for('login'))

    username = session['name']
    return render_template("index.html", username=username, channels=channels)

@app.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        name = request.form.get("name")
        session['name'] = name
        print(session['name'])

        return redirect(url_for('index'))

    return render_template("login.html")

@app.route("/channel/<string:channel_name>", methods=["GET"])
def channel(channel_name):
    name = f'{channel_name}'
    chats = channels[name]

    if len(channels[name]) > 0 :
        chats = channels[name]
    return jsonify(chats)

@socketio.on("send message")
def send_message(data):
    name = session['name']
    message = data["message"]
    channel_name = data["channel_name"]
    ts = time.time()
    timestamp = datetime.datetime.fromtimestamp(ts).strftime('%Y-%m-%d %H:%M:%S')
    m = {'message': message, 'user': name, 'timestamp': timestamp, 'channel': channel_name}
    list_messages = channels[f'{channel_name}']

    if len(list_messages) == 100:
        list_messages.pop(0)

    list_messages.append(m)

    emit("new message", m, broadcast=True)

@socketio.on("create channel")
def create_channel(channel_name):
    channel_name = str(channel_name)
    if channel_name not in channels:
        channels[channel_name]=[]
        return emit("new channel", {'channel_name':channel_name}, broadcast=True)

    print("NOUP")
    message = "That name is already taken by a channel."
    emit("channel already taken", message)


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
