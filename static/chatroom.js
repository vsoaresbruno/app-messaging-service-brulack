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
  });

  socket.on("new message", (data) => {
    const message_item = document.querySelectorAll(".message-item");
    const messages = document.querySelector("#chat-js");
    const item = document.createElement("div");

    item.className = "message-item";
    item.innerHTML =
      "<p><b>" +
      data.user +
      "</b> <span>" +
      data.timestamp +
      "</span><p>" +
      data.message +
      "</p>";

    if (data.channel != messages.className) {
      return;
    }
    if (message_item.length > 99) {
      messages.removeChild(messages.childNodes[0]);
    }
    messages.appendChild(item);
  });
});
