document.addEventListener("DOMContentLoaded", () => {
  loadCurrentChannel();
  var socket = io.connect(
    location.protocol + "//" + document.domain + ":" + location.port
  );

  socket.on("connect", () => {
    document
      .getElementById("create_channel")
      .addEventListener("submit", (evt) => {
        evt.preventDefault();
        const channel_name = document.getElementById("channel_name").value;
        socket.emit("create channel", channel_name);
        document.getElementById("create_channel").reset();
      });
  });

  socket.on("new channel", (data) => {
    const list_channels = document.querySelector("#channels");
    const li = document.createElement("li");

    li.innerHTML = "#" + data.channel_name.toLowerCase();
    li.classList = "list-group-item";
    li.dataset.channel = data.channel_name.toLowerCase();
    list_channels.appendChild(li);
    dispatchChannels();
  });

  socket.on("channel already taken", (data) => {
    const alert = document.getElementById("alert");
    alert.innerHTML = data;
    alert.style.display = "block";
  });

  function loadChat(channel_name) {
    const request = new XMLHttpRequest();
    request.open("GET", "/channel/" + channel_name);
    request.onload = () => {
      const data = JSON.parse(request.responseText);
      data.forEach(templateChatText);
    };
    const data = new FormData();
    request.send(data);
  }

  function templateChatText(element) {
    const messages = document.getElementById("chat-js");
    const item = document.createElement("div");

    item.className = "message-item";
    item.innerHTML +=
      "<b>" +
      element.user +
      "</b> <span>" +
      element.timestamp +
      "</span><p>" +
      element.message +
      "</p>";

    messages.appendChild(item);
  }

  function dispatchChannels() {
    document.querySelectorAll(".list-group-item").forEach(callClickChannel);
  }

  function callClickChannel(channel) {
    channel.onclick = () => {
      const chat = document.getElementById("chat-js");
      const message_channel = document.getElementById("message_channel");
      const title_channel = document.getElementById("title_channel");
      const channel_name = channel.dataset.channel;

      chat.className = channel_name;
      title_channel.innerHTML = "#" + channel_name;
      localStorage.setItem("lastChannel", channel_name);
      message_channel.value = channel_name;
      chat.innerHTML = "";

      loadChat(channel_name);
    };
  }
  function loadCurrentChannel() {
    const lastChannel = localStorage.getItem("lastChannel");
    const message_channel = document.getElementById("message_channel");
    const chat = document.getElementById("chat-js");

    if (lastChannel != null) {
      document.getElementById("title_channel").innerHTML = "#" + lastChannel;
      message_channel.value = lastChannel;
      chat.className = lastChannel;
      loadChat(lastChannel);
    }
  }
  dispatchChannels();
});
