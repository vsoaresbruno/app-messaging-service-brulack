document.addEventListener("DOMContentLoaded", () => {
  loadCurrentChannel();
  localStorage.setItem("user", document.querySelector("#username").textContent);
  var socket = io.connect(
    location.protocol + "//" + document.domain + ":" + location.port
  );

  socket.on("connect", () => {
    document
      .getElementById("create_channel")
      .addEventListener("submit", (evt) => {
        evt.preventDefault();
        const alert = document.getElementById("alert");
        alert.style.display = "none";
    
        const channel_name = document.getElementById("channel_name").value;
        socket.emit("create channel", channel_name);
        document.getElementById("create_channel").reset();
      });

      document
      .getElementById("new_message")
      .addEventListener("submit", (evt) => {
        evt.preventDefault();
        const message_channel = document.getElementById("message_channel").value;
        const message = document.getElementById("message").value;

        socket.emit("send message", {
          channel_name: message_channel,
          message: message,
        });
        document.getElementById("new_message").reset();
      });    
      dispatchDeleteMessages()
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
      data.forEach(initialChatMessages);
    };
    const data = new FormData();
    request.send(data);
  }

  function initialChatMessages(message) {
    const messages = document.getElementById("chat-js");
    const item = templateNewMessage(message)
  
    messages.appendChild(item);
    dispatchDeleteMessages();
  }

  function dispatchChannels() {
    document.querySelectorAll(".list-group-item").forEach(loadChannel);
  }

  function loadChannel(channel) {
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

/**
 * Chat content
 */
  function templateNewMessage(message){

    const item = document.createElement("div");
    const user = localStorage.getItem("user");
    var deleteMsg = '<span></span>';

    if (user == message.user) {
      deleteMsg = "<span class='delete_message' data-id='"+ message.id +"'>X</span>"
    }

    item.className = "message-item";
    item.dataset.hash = message.id;
    item.innerHTML =
      "<b>" +
      message.user +
      "</b> <span class='message-hour'>" +
      message.timestamp +
      "</span><p>" +
      message.message +
      "</p>"+ deleteMsg;

    return item;
  }

  socket.on("new message", (message) => {
    const message_item = document.querySelectorAll(".message-item");
    const messages = document.querySelector("#chat-js");
    const item = templateNewMessage(message)

    if (message.channel != messages.className) {
      return;
    }

    if (message_item.length > 99) {
      messages.removeChild(messages.childNodes[0]);
    }
    messages.appendChild(item)
    dispatchDeleteMessages()
  });

  socket.on("deleted message", (id) => {
    const remove_item = document.querySelector('[data-hash="'+ id +'"]');
    console.log(remove_item, "message to deleted")
    remove_item.remove()
  });

  function dispatchDeleteMessages() {
    document.querySelectorAll(".delete_message").forEach(deleteMessage);
  }

  function deleteMessage(message) {
    message.onclick = () => {
      const message_channel = document.getElementById("message_channel").value;
      const message_id = message.getAttribute('data-id');

      socket.emit("delete message", {
        message_id: message_id,
        channel_name: message_channel,
      });
    };
  }

});
