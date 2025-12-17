document.getElementById("login").addEventListener("submit", async (e) => {
  e.preventDefault();

  const username = document.getElementById("login-username").value.trim();
  const password = document.getElementById("login-password").value.trim();

  function showAlert(message, type = "error") {
    const modal = document.getElementById("alertBox");
    const msg = document.getElementById("alertMessage");
    const icon = document.getElementById("alertIcon");

    msg.textContent = message;

    if (type === "success") {
      icon.textContent = "✔";
      icon.style.color = "green";
    } else {
      icon.textContent = "✖";
      icon.style.color = "red";
    }

    modal.classList.add("show");
  }

  window.closeAlertLogin = function () {
    document.getElementById("alertBox").classList.remove("show");
  };

  if (!username || !password) {
    showAlert("Vui lòng nhập đầy đủ thông tin!");
    return;
  }

  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      tendangnhap: username,
      matkhau: password,
    }),
  });

  const user = await res.json();

  if (!res.ok || !user) {
    showAlert("Sai tên đăng nhập hoặc mật khẩu!");
    return;
  }
  localStorage.setItem("user", JSON.stringify(user));

  showAlert("Đăng nhập thành công!", "success");

  setTimeout(() => {
    if (user.vaitro === "admin") {
      window.location.href = "admin";
    } else {
      window.location.href = "staff-home";
    }
  }, 1500);
});
