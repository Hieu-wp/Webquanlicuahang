document.addEventListener("DOMContentLoaded", async () => {
  const userJson = localStorage.getItem("user");
  if (!userJson) return location.replace("/login");
  const user = JSON.parse(userJson);

  try {
    const res = await fetch(`/api/profile/${user.id}`);
    if (!res.ok) throw new Error("Không tải profile");
    const p = await res.json();

    document.getElementById("viewFullName").textContent    = p.hoten || "";
    document.getElementById("viewSex").textContent         = p.gioitinh || "";
    document.getElementById("viewBirthday").textContent    = p.ngaysinh || "";
    document.getElementById("viewPhoneNumber").textContent = p.sodienthoai || "";
    document.getElementById("viewCCCD").textContent        = p.cccd != null ? p.cccd : "";
    document.getElementById("viewEmail").textContent       = p.email || "";
    document.getElementById("viewUsername").textContent    = p.tendangnhap || user.tendangnhap;
    document.getElementById("viewRole").textContent        =
      (p.vaitro || user.vaitro) === "admin" ? "Quản trị viên" : "Nhân viên";
  } catch (e) {
    console.error("Lỗi tải profile", e);
  }
});