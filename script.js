const loginForm = document.getElementById("loginForm");
const loginScreen = document.getElementById("loginScreen");
const mainContent = document.getElementById("mainContent");
const userDisplay = document.getElementById("userDisplay");

const theoryForm = document.getElementById("theoryForm");
const postsContainer = document.getElementById("postsContainer");

let currentUser = null; // Nick do usuário logado
let posts = []; // Array para armazenar posts

// Função para salvar posts no localStorage
function savePosts() {
  localStorage.setItem("theoryPosts", JSON.stringify(posts));
}

// Função para carregar posts do localStorage
function loadPosts() {
  const savedPosts = localStorage.getItem("theoryPosts");
  if (savedPosts) {
    posts = JSON.parse(savedPosts);
    posts.forEach((postData) => {
      createPostElement(postData, false);
    });
  }
}

// Função para criar um post no DOM (postData: {title, content, nick, score, comments})
function createPostElement(postData, save = true) {
  const post = document.createElement("div");
  post.classList.add("post");

  post.innerHTML = `
    <div class="vote">
      <button class="upvote" aria-label="Upvote">▲</button>
      <span class="score">${postData.score || 0}</span>
      <button class="downvote" aria-label="Downvote">▼</button>
    </div>
    <div class="post-content">
      <h3>${postData.title}</h3>
      <small>Publicado por <strong>${postData.nick}</strong></small>
      <p>${postData.content}</p>
      <div class="comment-section">
        <input
          type="text"
          class="commentInput"
          placeholder="Comente algo..."
          autocomplete="off"
        />
        <button class="addCommentBtn">Comentar</button>
        <div class="comments"></div>
      </div>
    </div>
  `;

  postsContainer.prepend(post);
  setupPostEvents(post, postData);

  if (save) {
    posts.unshift(postData);
    savePosts();
  }
}

// Eventos para votos e comentários do post
function setupPostEvents(post, postData) {
  const upvoteBtn = post.querySelector(".upvote");
  const downvoteBtn = post.querySelector(".downvote");
  const scoreSpan = post.querySelector(".score");

  let score = postData.score || 0;

  upvoteBtn.addEventListener("click", () => {
    score++;
    scoreSpan.textContent = score;
    postData.score = score;
    savePosts();
  });

  downvoteBtn.addEventListener("click", () => {
    score--;
    scoreSpan.textContent = score;
    postData.score = score;
    savePosts();
  });

  const commentBtn = post.querySelector(".addCommentBtn");
  const commentInput = post.querySelector(".commentInput");
  const commentsDiv = post.querySelector(".comments");

  // Carregar comentários existentes
  if (postData.comments && postData.comments.length) {
    postData.comments.forEach((comment) => {
      const commentEl = document.createElement("p");
      commentEl.textContent = comment;
      commentsDiv.appendChild(commentEl);
    });
  } else {
    postData.comments = [];
  }

  commentBtn.addEventListener("click", () => {
    const comment = commentInput.value.trim();
    if (comment !== "") {
      const commentEl = document.createElement("p");
      commentEl.textContent = comment;
      commentsDiv.appendChild(commentEl);
      postData.comments.push(comment);
      savePosts();
      commentInput.value = "";
    }
  });

  // Comentar com Enter
  commentInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      commentBtn.click();
    }
  });
}

// Login e persistência do usuário
loginForm.addEventListener("submit", function (e) {
  e.preventDefault();

  const nick = document.getElementById("nick").value.trim();
  const password = document.getElementById("password").value.trim();

  if (nick === "" || password === "") {
    alert("Por favor, preencha nick e senha.");
    return;
  }

  // Salvar usuário no localStorage para persistir login
  localStorage.setItem("theoryUser", nick);
  currentUser = nick;
  updateUserDisplay();

  loginScreen.style.display = "none";
  mainContent.style.display = "block";
  loginForm.reset();

  loadPosts(); // Carregar posts quando logar
});

// Verifica se já tem usuário logado ao carregar a página
function checkLogin() {
  const savedUser = localStorage.getItem("theoryUser");
  if (savedUser) {
    currentUser = savedUser;
    updateUserDisplay();
    loginScreen.style.display = "none";
    mainContent.style.display = "block";
    loadPosts();
  }
}

// Atualiza a exibição do usuário logado no header
function updateUserDisplay() {
  userDisplay.textContent = `Logado como: ${currentUser}`;
}

// Evento para criar nova teoria
theoryForm.addEventListener("submit", function (e) {
  e.preventDefault();

  if (!currentUser) {
    alert("Você precisa estar logado para postar.");
    return;
  }

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
    score: 0,
    comments: [],
  };

  createPostElement(newPost);

  theoryForm.reset();
});

// Ao carregar a página, checar login
checkLogin();
