// /javascript/edit-profile.js
document.addEventListener("DOMContentLoaded", async () => {
  // Lấy user từ localStorage
  const userJson = localStorage.getItem("user");
  if (!userJson) {
    return location.replace("/login");
  }
  const user = JSON.parse(userJson);

  // Lấy các phần tử trong DOM
  const fullName = document.getElementById("fullName");
  const gender = document.getElementById("gender");
  const dob = document.getElementById("dob");
  const phone = document.getElementById("phone");
  const cccd = document.getElementById("cccd");      // <--- thêm dòng này
  const email = document.getElementById("email");
  const btnSaveProfile = document.getElementById("btnSaveProfile");

  const alertBoxProfile = document.getElementById("alertBoxProfile");
  const alertIconProfile = document.getElementById("alertIconProfile");
  const alertMessageProfile = document.getElementById("alertMessageProfile");
  const alertConfirmProfile = document.getElementById("alertConfirmProfile");

  // Lưu lại profile ban đầu để so sánh
  let originalProfile = null;

  function showAlert(msg, ok = false) {
    alertMessageProfile.textContent = msg;
    alertIconProfile.textContent = ok ? "✔" : "✖";
    alertIconProfile.style.color = ok ? "green" : "red";
    alertBoxProfile.classList.add("show");
  }

  alertConfirmProfile.onclick = () => {
    alertBoxProfile.classList.remove("show");
  };

  // 1. Load thông tin hồ sơ ban đầu
  try {
    const res = await fetch(`/api/profile/${user.id}`);
    if (!res.ok) {
      showAlert("Không tải được thông tin!");
      return;
    }

    const p = await res.json();
    originalProfile = p;

    fullName.value = p.hoten || "";
    gender.value = p.gioitinh || "";
    dob.value = p.ngaysinh ? p.ngaysinh.substring(0, 10) : "";
    phone.value = p.sodienthoai || "";
    email.value = p.email || "";
    cccd.value = p.cccd != null ? p.cccd : "";   // <--- GÁN GIÁ TRỊ CCCD
  } catch (e) {
    showAlert("Không thể kết nối server!");
    return;
  }

  // 2. Khi bấm Lưu thay đổi
  btnSaveProfile.onclick = async () => {
    const hotenNew       = fullName.value.trim();
    const emailNew       = email.value.trim();
    const gioitinhNew    = gender.value;
    const ngaysinhNew    = dob.value;
    const sodienthoaiNew = phone.value.trim();
    const cccdNew        = cccd.value.trim();

    if (!hotenNew || !emailNew) {
      showAlert("Họ tên và email không được để trống!");
      return;
    }

    const dto = {};

    // So sánh với profile ban đầu; khác mới gửi
    if (!originalProfile || hotenNew !== (originalProfile.hoten || "")) {
      dto.hoten = hotenNew;
    }
    if (!originalProfile || emailNew !== (originalProfile.email || "")) {
      dto.email = emailNew;
    }
    if (!originalProfile || gioitinhNew !== (originalProfile.gioitinh || "")) {
      dto.gioitinh = gioitinhNew || null;
    }

    const origDob = originalProfile && originalProfile.ngaysinh
      ? originalProfile.ngaysinh.substring(0, 10)
      : "";
    if (!originalProfile || ngaysinhNew !== origDob) {
      dto.ngaysinh = ngaysinhNew || null;
    }

    if (!originalProfile || sodienthoaiNew !== (originalProfile.sodienthoai || "")) {
      dto.sodienthoai = sodienthoaiNew;
    }

    // *** CCCD ***
    const origCccdStr = originalProfile && originalProfile.cccd != null
      ? String(originalProfile.cccd)
      : "";
    if (!originalProfile || cccdNew !== origCccdStr) {
      dto.cccd = cccdNew || null;
    }

    // Không có gì thay đổi
    if (Object.keys(dto).length === 0) {
      showAlert("Bạn chưa thay đổi thông tin nào!");
      return;
    }

    try {
      const res = await fetch(`/api/profile/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dto),
      });

      let data = null;
      try {
        data = await res.json();
      } catch (_) {}

      if (!res.ok) {
        showAlert((data && data.message) || "Cập nhật thất bại!");
        return;
      }

      // Cập nhật lại localStorage cho đồng bộ
      user.hoten = hotenNew;
      user.email = emailNew;
      localStorage.setItem("user", JSON.stringify(user));

      // Cập nhật lại originalProfile
      if (!originalProfile) originalProfile = {};
      originalProfile.hoten       = hotenNew;
      originalProfile.email       = emailNew;
      originalProfile.gioitinh    = gioitinhNew;
      originalProfile.ngaysinh    = ngaysinhNew || null;
      originalProfile.sodienthoai = sodienthoaiNew;
      originalProfile.cccd        = cccdNew || null;   // <--- nhớ lưu lại

      showAlert("Cập nhật thông tin thành công!", true);
    } catch (e) {
      showAlert("Không thể kết nối server!");
    }
  };
});
