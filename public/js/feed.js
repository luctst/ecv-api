fetch(`http://localhost:3000/api${window.location.pathname}`, {
  headers: {
    "Authorization": `Bearer ${sessionStorage.getItem('tokenUser')}`
    }
})
.then(response => response.json())
.then(dataParsed => dataParsed.posts.map((post, index) => {
  let htmlDiv = document.createElement('div');
  htmlDiv.setAttribute('class', 'feed--cards--infos');

  htmlDiv.innerHTML = `
    <h2>${post.author}</h2>
    <p>${post.content}</p>
  `;

  document.querySelector('.feed--cards').appendChild(htmlDiv);
}))

document.querySelector('.btn--logout').addEventListener("click", function() {
  sessionStorage.clear();
  window.location.href = "http://localhost:3000/connexion";
});

document.querySelector('.btn--add--status').addEventListener("click", function () {
  if (document.getElementById('user--status').value.length === 0) {
    return false;
  }

  fetch(`http://localhost:3000/api${window.location.pathname}`, {
    headers: {
      "Authorization": `Bearer ${sessionStorage.getItem('tokenUser')}`,
      'Content-type': 'application/json'
      },
      method: "POST",
      body: JSON.stringify({
        content: document.getElementById('user--status').value
      })
  })
  .then(response => response.json())
  .then(dataParsed => dataParsed.posts.map((post, index) => {
    document.querySelector('.feed--cards').innerHTML = '';

    let htmlDiv = document.createElement('div');
    htmlDiv.setAttribute('class', 'feed--cards--infos');

    htmlDiv.innerHTML = `
      <h2>${post.author}</h2>
      <p>${post.content}</p>
    `;

    document.querySelector('.feed--cards').appendChild(htmlDiv);
  }))
})