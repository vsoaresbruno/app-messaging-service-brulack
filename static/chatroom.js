document.addEventListener("DOMContentLoaded", () => {
  var socket = io.connect(
    location.protocol + "//" + document.domain + ":" + location.port
  );

  socket.on("connect", () => {
    document.getElementById("new_message").addEventListener("submit", (evt) => {
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
  })

  socket.on("new message", (data) => {
    const message_item = document.querySelectorAll(".message-item");
    const messages = document.querySelector("#chat-js");
    const item = document.createElement("div");

    item.className = "message-item";
    item.dataset.id = data.id;
    item.innerHTML =
      "<b>" +
      data.user +
      "</b> <span>" +
      data.timestamp +
      "</span><p>" +
      data.message;

    if (data.channel != messages.className) {
      return;
    }

    if (message_item.length > 99) {
      messages.removeChild(messages.childNodes[0]);
    }
    messages.appendChild(item)
    dispatchDeleteMessages()
  });

  socket.on("deleted message", (id) => {
    const remove_item = document.querySelector('[data-id="'+ id +'"]');
    console.log(remove_item, "message to deleted")
    remove_item.parentNode.removeChild(remove_item);
  });

  function dispatchDeleteMessages() {
    document.querySelectorAll(".message-item").forEach(deleteMessage);
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
