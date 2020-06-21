// Check if user is connected
// if not connected, redirect to log or sign
// /api/signup

document.querySelector('.inscription--btn').addEventListener("click", function(e) {
  e.preventDefault();

  fetch("http://localhost:3000/api/signup", {
    headers: {
    "Content-type": "application/json",
    },
    method: "POST",
    body: JSON.stringify({
      pseudo: document.querySelector('.pseudo--user').value,
      pswd: document.querySelector('.pswd--user').value
    })
  })
  .then(response => response.json())
  .then(dataParsed => {
    sessionStorage.setItem("tokenUser", dataParsed.token);
    sessionStorage.setItem("userName", document.querySelector$('.pseudo--user').value);
    window.location.href = `https://localhost:3000/${document.querySelector('.pseudo--user').value}/feed`;
  })
})

if (sessionStorage.tokenUser) {
  window.location.href = `http://localhost:3000/feed/${sessionStorage.getItem('userName')} `;
}