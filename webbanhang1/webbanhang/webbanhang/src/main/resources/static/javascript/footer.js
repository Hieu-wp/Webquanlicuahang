document.addEventListener("DOMContentLoaded", () => {
  const user = JSON.parse(localStorage.getItem("user"));
  if (!user) return;

  const welcome = document.getElementById("welcomeUser");
  const footer = document.getElementById("staffFooterName");
  const adminFooter = document.getElementById("adminFooterName");

  welcome && (welcome.textContent = `Xin chào, ${user.hoten ?? user.tendangnhap}`);
  footer && (footer.textContent = `Nhân viên ${user.hoten ?? user.tendangnhap}`);
  adminFooter && (adminFooter.textContent = ` Admin ${user.hoten ?? user.tendangnhap}`);
});
