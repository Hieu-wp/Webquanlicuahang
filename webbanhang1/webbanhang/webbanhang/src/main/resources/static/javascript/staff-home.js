document.addEventListener("DOMContentLoaded", () => {

  const user = JSON.parse(localStorage.getItem("user"));
  if (!user) return window.location.replace("/login");
  if (user.vaitro === "admin") return window.location.replace("/admin");
  const nameDisplay = user.hoten && user.hoten.trim() !== "" ? user.hoten : user.tendangnhap;
  document.getElementById("welcomeUser").textContent = nameDisplay;
  document.getElementById("staffFooterName").textContent = nameDisplay;
  const logout = () => {
    localStorage.removeItem("user");
    fetch("/api/auth/logout", { method: "POST" });
    window.location.replace("/login");
  };
  document.getElementById("logoutBtn")?.addEventListener("click", logout);
  document.getElementById("menuChangePass")?.addEventListener("click", () => {
    document.getElementById("oldPass").value = "";
    document.getElementById("newPass").value = "";
    document.getElementById("confirmPass").value = "";
    new bootstrap.Modal(document.getElementById("changePassModal")).show();
  });
  document.getElementById("btnSavePass")?.addEventListener("click", async () => {
    const oldPass = document.getElementById("oldPass").value.trim();
    const newPass = document.getElementById("newPass").value.trim();
    const confirm = document.getElementById("confirmPass").value.trim();

    if (!oldPass || !newPass || !confirm)
      return alert("Vui lòng nhập đầy đủ thông tin!");
    if (newPass.length < 6)
      return alert("Mật khẩu mới phải từ 6 ký tự!");
    if (newPass !== confirm)
      return alert("Xác nhận mật khẩu không khớp!");

    try {
      const res = await fetch("/api/auth/change-password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ oldPass, newPass })
      });

      const data = await res.json();
      if (!res.ok) return alert(data.message || "Đổi mật khẩu thất bại!");

      alert("Đổi mật khẩu thành công!");
      bootstrap.Modal.getInstance(document.getElementById("changePassModal")).hide();
    }
    catch {
      alert("Không thể kết nối server!");
    }
  });

});
