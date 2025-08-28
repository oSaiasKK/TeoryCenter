const loginForm = document.getElementById("loginForm");
const loginScreen = document.getElementById("loginScreen");
const mainContent = document.getElementById("mainContent");
const userDisplay = document.getElementById("userDisplay");
const logoutBtn = document.getElementById("logoutBtn");

const theoryForm = document.getElementById("theoryForm");
const postsContainer = document.getElementById("postsContainer");

let currentUser = null; // usuário logado em memória
let posts = []; // posts armazenados no localStorage

// -------- Persistência de POSTS --------
function savePosts() {
  localStorage.setItem("theoryPosts", JSON.stringify(posts));
}

function loadPosts() {
  const savedPosts = localStorage.getItem("theoryPosts");
  if (savedPosts) {
    posts = JSON.parse(savedPosts);
    postsContainer.innerHTML = ""; // evita duplicação
    posts.forEach((postData) => createPostElement(postData, false));
  }
}

// -------- Criação de posts --------
function createPostElement(postData, save = true) {
  const post = document.createElement("div");
  post.classList.add("post");

  if (!postData.votes) postData.votes = {};
  if (!postData.comments) postData.comments = [];

  function calculateScore(votes) {
    return Object.values(votes).reduce((a, b) => a + b, 0);
  }

  post.innerHTML = `
    <div class="vote">
      <button class="upvote" aria-label="Upvote">▲</button>
      <span class="score">${calculateScore(postData.votes)}</span>
      <button class="downvote" aria-label="Downvote">▼</button>
    </div>
    <div class="post-content">
      <h3>${postData.title}</h3>
      <small>Publicado por <strong>${postData.nick}</strong></small>
      <p>${postData.content}</p>
      <div class="comment-section">
        <input type="text" class="commentInput" placeholder="Comente algo..." autocomplete="off"/>
        <button class="addCommentBtn">Comentar</button>
        <div class="comments"></div>
      </div>
    </div>
  `;

  postsContainer.prepend(post);
  setupPostEvents(post, postData, calculateScore);

  if (save) {
    posts.unshift(postData);
    savePosts();
  }
}

// -------- Eventos de votos e comentários --------
function setupPostEvents(post, postData, calculateScore) {
  const upvoteBtn = post.querySelector(".upvote");
  const downvoteBtn = post.querySelector(".downvote");
  const scoreSpan = post.querySelector(".score");

  // Upvote
  upvoteBtn.addEventListener("click", () => {
    const currentVote = postData.votes[currentUser] || 0;
    postData.votes[currentUser] = currentVote === 1 ? 0 : 1;
    if (postData.votes[currentUser] === 0) delete postData.votes[currentUser];
    scoreSpan.textContent = calculateScore(postData.votes);
    savePosts();
  });

  // Downvote
  downvoteBtn.addEventListener("click", () => {
    const currentVote = postData.votes[currentUser] || 0;
    postData.votes[currentUser] = currentVote === -1 ? 0 : -1;
    if (postData.votes[currentUser] === 0) delete postData.votes[currentUser];
    scoreSpan.textContent = calculateScore(postData.votes);
    savePosts();
  });

  // Comentários
  const commentBtn = post.querySelector(".addCommentBtn");
  const commentInput = post.querySelector(".commentInput");
  const commentsDiv = post.querySelector(".comments");

  postData.comments.forEach((comment) => {
    const commentEl = document.createElement("p");
    commentEl.innerHTML = `<strong>${currentUser}:</strong> ${comment}`;
    commentsDiv.appendChild(commentEl);
  });

  commentBtn.addEventListener("click", () => {
    const comment = commentInput.value.trim();
    if (comment !== "") {
      const commentEl = document.createElement("p");
      commentEl.innerHTML = `<strong>${currentUser}:</strong> ${comment}`;
      commentsDiv.appendChild(commentEl);
      postData.comments.push(comment);
      savePosts();
      commentInput.value = "";
    }
  });

  commentInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      commentBtn.click();
    }
  });
}

// -------- Login com validação de senha --------
loginForm.addEventListener("submit", function (e) {
  e.preventDefault();

  const nick = document.getElementById("nick").value.trim();
  const password = document.getElementById("password").value.trim();

  if (nick === "" || password === "") {
    alert("Por favor, preencha nick e senha.");
    return;
  }

  const savedUsers = JSON.parse(localStorage.getItem("theoryUsers") || "{}");

  if (savedUsers[nick] && savedUsers[nick] !== password) {
    alert("Esse nick já existe com outra senha!");
    loginForm.reset();
    return;
  } else {
    savedUsers[nick] = password;
    localStorage.setItem("theoryUsers", JSON.stringify(savedUsers));
  }

  currentUser = nick;
  updateUserDisplay();

  loginScreen.style.display = "none";
  mainContent.style.display = "block";
  loginForm.reset();

  loadPosts();
});

// -------- Atualizar header --------
function updateUserDisplay() {
  userDisplay.textContent = `Logado como: ${currentUser}`;
  logoutBtn.style.display = "inline-block";
}

// -------- Logout --------
logoutBtn.addEventListener("click", () => {
  currentUser = null;
  userDisplay.textContent = "";
  logoutBtn.style.display = "none";

  theoryForm.reset();
  postsContainer.innerHTML = "";

  mainContent.style.display = "none";
  loginScreen.style.display = "flex";
});

// -------- Criar nova teoria --------
theoryForm.addEventListener("submit", function (e) {
  e.preventDefault();

  const title = document.getElementById("title").value.trim();
  const content = document.getElementById("content").value.trim();

  if (title === "" || content === "") {
    alert("Por favor, preencha título e conteúdo.");
    return;
  }

  const newPost = {
    title,
    content,
    nick: currentUser,
    votes: {},
    comments: []
  };

  createPostElement(newPost);
  theoryForm.reset();
});