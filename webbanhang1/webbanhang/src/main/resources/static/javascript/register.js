document.getElementById("register").addEventListener("submit", async (e) => {
  e.preventDefault();

  const fullname = document.getElementById("reg-name").value.trim();
  const email = document.getElementById("reg-email").value.trim();
  const username = document.getElementById("reg-username").value.trim();
  const password = document.getElementById("reg-password").value.trim();
  const passwordConfirm = document.getElementById("reg-password2").value.trim();
  const role = document.querySelector('input[name="role"]:checked').value;

  function showAlert(message, type = "error") {
    const modal = document.getElementById("alertBoxRegister");
    const msg = document.getElementById("alertMessageRegister");
    const icon = document.getElementById("alertIconRegister");

    msg.textContent = message;
    icon.textContent = type === "success" ? "✔" : "✖";
    icon.style.color = type === "success" ? "green" : "red";

    modal.classList.add("show");
  }

  window.closeAlertRegister = function () {
    document.getElementById("alertBoxRegister").classList.remove("show");
  };

  // ===== VALIDATION =====
  if (!fullname || !email || !username || !password || !passwordConfirm) {
    showAlert("Vui lòng nhập đầy đủ thông tin!");
    return;
  }
  if (password.length < 8) {
    showAlert("Mật khẩu phải từ 8 ký tự trở lên!");
    return;
  }
  if (password !== passwordConfirm) {
    showAlert("Mật khẩu xác nhận không khớp!");
    return;
  }

  // ===== SEND API =====
  try {
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        hoten: fullname,
        email: email,
        tendangnhap: username,
        matkhau: password,
        vaitro: role,
        trangthai: 1,
        ngaytao: new Date().toISOString().split("T")[0],
      }),
    });

    const msg = await res.json();

    if (res.ok) {
      showAlert("Đăng ký thành công!", "success");
      setTimeout(() => window.location.replace("/login"), 1500);
    } else {
      showAlert(msg.message || "Đăng ký thất bại!");
    }
  } catch (error) {
    showAlert("Lỗi kết nối server!");
  }
});
