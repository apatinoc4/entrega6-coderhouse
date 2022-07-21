const socket = io.connect();
const today = new Date();

const renderProducts = (products) => {
  let html = products
    .map(function (elem) {
      return `<tr>
                    <td>${elem.title}</td>
					<td>${elem.price}</td>
					<td><img src=${elem.thumbnail}></td>
					</tr>`;
    })
    .join(" ");

  document.querySelector("#ptable-products").innerHTML = html;
};

socket.on("products", function (products) {
  renderProducts(products);
});

const addProduct = (e) => {
  const newProduct = {
    title: document.querySelector("#title").value,
    price: document.querySelector("#price").value,
    thumbnail: document.querySelector("#thumbnail").value,
  };

  console.log(newProduct);
  socket.emit("new-product", newProduct);
  document.querySelector("#create-product").reset();

  return false;
};

const renderMessages = (data) => {
  let html = data
    .map(function (elem, index) {
      return `<div><strong style="color:blue">${
        elem.email
      }</strong> <span style="color:brown">[${today.toLocaleString("en-US")}]</span>:
				${elem.text}</div>`;
    })
    .join(" ");
  document.querySelector("#messages").innerHTML = html;
};
socket.on("messages", function (data) {
  renderMessages(data);
});

function addMessage(e) {
  let mensaje = {
    email: document.querySelector("#email").value,
    text: document.querySelector("#text").value,
  };
  socket.emit("new-message", mensaje);
  document.querySelector("#chat-form").reset();
  return false;
}
