document.addEventListener("DOMContentLoaded", () => {
    const userJson = localStorage.getItem("user");
    if (!userJson) {
        return window.location.replace("/login");
    }
    const user = JSON.parse(userJson);
    if (user.vaitro !== "admin") {
        return window.location.replace("/login");
    }

    const welcomeUser = document.getElementById("welcomeUser");
    if (welcomeUser) {
        welcomeUser.textContent = user.hoten ?? user.tendangnhap ?? "Admin";
    }

    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", async () => {
            try {
                await fetch("/api/auth/logout", { method: "POST" });
            } catch {}
            localStorage.removeItem("user");
            window.location.replace("/login");
        });
    }

    // ===== FOOTER TÊN NHÂN VIÊN =====
    const staffFooterName = document.getElementById("staffFooterName");
    if (staffFooterName) {
        staffFooterName.textContent = user.hoten ?? user.tendangnhap ?? "";
    }

    // ===== ELEMENTS =====
    const tbody        = document.getElementById("staffTbody");
    const btnAddStaff  = document.getElementById("btnAddStaff");
    const staffModalEl = document.getElementById("staffModal");
    const staffModal   = staffModalEl ? new bootstrap.Modal(staffModalEl) : null;
    const staffForm    = document.getElementById("staffForm");

    // ===== ALERT CUSTOM =====
    window.closeAlertStaff = function () {
        const box = document.getElementById("alertBoxStaff");
        if (box) box.classList.remove("show");
    };

    function showAlertStaff(message, type = "error") {
        const modal = document.getElementById("alertBoxStaff");
        const msg   = document.getElementById("alertMessageStaff");
        const icon  = document.getElementById("alertIconStaff");

        if (!modal || !msg || !icon) {
            return alert(message);
        }
        msg.textContent = message;
        icon.textContent = type === "success" ? "✔" : "✖";
        icon.style.color = type === "success" ? "green" : "red";
        modal.classList.add("show");
    }

    // ===== CONFIRM DELETE =====
    const confirmBox       = document.getElementById("confirmDeleteBoxStaff");
    const btnConfirmOK     = document.getElementById("confirmDeleteOKStaff");
    const btnConfirmCancel = document.getElementById("confirmDeleteCancelStaff");
    let deleteId = null;

    function openDeleteConfirm(id) {
        deleteId = id;
        if (confirmBox) {
            confirmBox.classList.add("show");
        } else {
            if (window.confirm("Bạn có chắc muốn xóa nhân viên này?")) {
                deleteStaff(id);
            }
        }
    }

    function closeDeleteConfirm() {
        deleteId = null;
        if (confirmBox) {
            confirmBox.classList.remove("show");
        }
    }

    if (btnConfirmCancel) {
        btnConfirmCancel.addEventListener("click", closeDeleteConfirm);
    }
    if (btnConfirmOK) {
        btnConfirmOK.addEventListener("click", async () => {
            if (!deleteId) return;
            const id = deleteId;
            closeDeleteConfirm();
            await deleteStaff(id);
        });
    }

    // ===== FORMAT DATE =====
    function formatDateDisplay(isoDate) {
        if (!isoDate) return "";
        const d = new Date(isoDate);
        if (isNaN(d)) return isoDate;
        const day   = String(d.getDate()).padStart(2, "0");
        const month = String(d.getMonth() + 1).padStart(2, "0");
        const year  = d.getFullYear();
        return `${day}/${month}/${year}`;
    }

    function toInputDate(isoDate) {
        if (!isoDate) return "";
        if (/^\d{4}-\d{2}-\d{2}$/.test(isoDate)) return isoDate;
        const d = new Date(isoDate);
        if (isNaN(d)) return "";
        const y   = d.getFullYear();
        const m   = String(d.getMonth() + 1).padStart(2, "0");
        const day = String(d.getDate()).padStart(2, "0");
        return `${y}-${m}-${day}`;
    }

    function mapStatusToText(status) {
        switch (status) {
            case 1: return '<span class="badge bg-success">Đang làm</span>';
            case 0: return '<span class="badge bg-secondary">Đã nghỉ</span>';
            default: return '<span class="badge bg-light text-dark">Không rõ</span>';
        }
    }

    // ===== DATA =====
    let staffList = [];

    // ===== LOAD STAFF =====
    async function loadStaff() {
        if (!tbody) return;
        try {
            const res = await fetch("/api/admin-staff-manager");
            if (!res.ok) {
                return showAlertStaff("Không thể tải danh sách nhân viên!");
            }
            staffList = await res.json();
            renderTable(staffList);
        } catch (e) {
            console.error(e);
            showAlertStaff("Không thể kết nối server!");
        }
    }

    // ===== RENDER TABLE =====
    function renderTable(data) {
        if (!tbody) return;
        tbody.innerHTML = "";

        data.forEach(staff => {
            tbody.innerHTML += `
                <tr>
                    <td>${staff.idnhanvien}</td>
                    <td>${staff.hoten || ""}</td>
                    <td>${staff.chucvu || ""}</td>
                    <td>${staff.sodienthoai || ""}</td>
                    <td>${staff.email || ""}</td>
                    <td>${formatDateDisplay(staff.ngayvaolam)}</td>
                    <td>${mapStatusToText(staff.trangthai)}</td>
                    <td>
                        <button class="btn btn-sm btn-primary me-1 btn-edit" data-id="${staff.idnhanvien}">
                            <i class="bi bi-pencil"></i>
                        </button>
                        <button class="btn btn-sm btn-danger btn-delete" data-id="${staff.idnhanvien}">
                            <i class="bi bi-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
        });

        bindRowEvents();
    }

    function bindRowEvents() {
        if (!tbody) return;

        tbody.querySelectorAll(".btn-edit").forEach(btn => {
            btn.addEventListener("click", () => openEditStaff(btn.dataset.id));
        });

        tbody.querySelectorAll(".btn-delete").forEach(btn => {
            btn.addEventListener("click", () => openDeleteConfirm(btn.dataset.id));
        });
    }

    // ===== MỞ MODAL THÊM NHÂN VIÊN =====
    if (btnAddStaff && staffModal) {
        btnAddStaff.addEventListener("click", () => {
            const title = document.getElementById("staffModalTitle");
            if (title) title.textContent = "Thêm nhân viên mới";

            if (staffForm) staffForm.reset();
            const staffIdEl = document.getElementById("staffId");
            if (staffIdEl) staffIdEl.value = "";

            const staffStatus = document.getElementById("staffStatus");
            if (staffStatus) staffStatus.value = "1";

            staffModal.show();
        });
    }

    // ===== MỞ MODAL SỬA NHÂN VIÊN =====
    function openEditStaff(id) {
        const staff = staffList.find(s => String(s.idnhanvien) === String(id));
        if (!staff) return showAlertStaff("Không tìm thấy nhân viên!");

        const title = document.getElementById("staffModalTitle");
        if (title) title.textContent = "Cập nhật nhân viên";

        const staffId        = document.getElementById("staffId");
        const staffCode      = document.getElementById("staffCode");
        const staffName      = document.getElementById("staffName");
        const staffRole      = document.getElementById("staffRole");
        const staffGender    = document.getElementById("staffGender");
        const staffCCCD      = document.getElementById("staffCCCD");
        const staffPhone     = document.getElementById("staffPhone");
        const staffEmail     = document.getElementById("staffEmail");
        const staffStartDate = document.getElementById("staffStartDate");
        const staffBirthDate = document.getElementById("staffBirthDate");
        const staffStatus    = document.getElementById("staffStatus");

        if (staffId)        staffId.value        = staff.idnhanvien;
        if (staffCode)      staffCode.value      = staff.idnhanvien;
        if (staffName)      staffName.value      = staff.hoten || "";
        if (staffRole)      staffRole.value      = staff.chucvu || "";
        if (staffGender)    staffGender.value    = staff.gioitinh || "";
        if (staffCCCD)      staffCCCD.value      = staff.cccd ?? "";
        if (staffPhone)     staffPhone.value     = staff.sodienthoai || "";
        if (staffEmail)     staffEmail.value     = staff.email || "";
        if (staffStartDate) staffStartDate.value = toInputDate(staff.ngayvaolam);
        if (staffBirthDate) staffBirthDate.value = toInputDate(staff.ngaysinh);
        if (staffStatus)    staffStatus.value    =
            (staff.trangthai != null ? String(staff.trangthai) : "1");

        if (staffModal) staffModal.show();
    }

    // ===== SUBMIT FORM (THÊM + SỬA) =====
    if (staffForm) {
        staffForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            const staffId        = document.getElementById("staffId");
            const staffName      = document.getElementById("staffName");
            const staffRole      = document.getElementById("staffRole");
            const staffGender    = document.getElementById("staffGender");
            const staffCCCD      = document.getElementById("staffCCCD");
            const staffPhone     = document.getElementById("staffPhone");
            const staffEmail     = document.getElementById("staffEmail");
            const staffStartDate = document.getElementById("staffStartDate");
            const staffBirthDate = document.getElementById("staffBirthDate");
            const staffStatus    = document.getElementById("staffStatus");

            const id = staffId ? staffId.value : "";

            const hoten        = staffName ? staffName.value.trim()      : "";
            const chucvu       = staffRole ? staffRole.value.trim()      : "";
            const gioitinh     = staffGender ? staffGender.value         : "";
            const cccdStr      = staffCCCD ? staffCCCD.value.trim()      : "";
            const sodienthoai  = staffPhone ? staffPhone.value.trim()    : "";
            const email        = staffEmail ? staffEmail.value.trim()    : "";
            const ngayvaolam   = staffStartDate ? staffStartDate.value   : "";
            const ngaysinh     = staffBirthDate ? staffBirthDate.value   : "";
            const trangthai    = staffStatus ? Number(staffStatus.value) : 1;

            // validate cơ bản
            if (!hoten)       return showAlertStaff("Họ tên không được để trống!");
            if (!sodienthoai) return showAlertStaff("Số điện thoại không được để trống!");
            if (!chucvu)      return showAlertStaff("Chức vụ không được để trống!");
            if (!ngayvaolam)  return showAlertStaff("Ngày vào làm không được để trống!");

            // ===== XỬ LÝ CCCD =====
            let cccd = null;
            if (cccdStr) {
                // chỉ cho phép số
                if (!/^\d+$/.test(cccdStr)) {
                    return showAlertStaff("CCCD phải là số!");
                }
                cccd = cccdStr;   // <-- gán vào biến bên ngoài, không khai báo lại
            }

            // Nếu đang sửa thì tìm lại staff hiện tại để giữ idtaikhoan
            let current = null;
            if (id) {
                current = staffList.find(s => String(s.idnhanvien) === String(id));
            }

            const payload = {
                hoten,
                gioitinh,
                ngaysinh,              // "YYYY-MM-DD"
                sodienthoai,
                email,
                cccd,
                idtaikhoan: current ? current.idtaikhoan : null,
                chucvu,
                ngayvaolam,
                trangthai
            };

            const url    = id ? `/api/admin-staff-manager/${id}` : "/api/admin-staff-manager";
            const method = id ? "PUT" : "POST";

            try {
                const res = await fetch(url, {
                    method,
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload)
                });

                const data = await res.json().catch(() => null);
                if (!res.ok) {
                    return showAlertStaff(
                        (data && data.message) ||
                        (id ? "Cập nhật nhân viên thất bại!" : "Thêm nhân viên thất bại!")
                    );
                }

                showAlertStaff(
                    id ? "Cập nhật nhân viên thành công!" : "Thêm nhân viên thành công!",
                    "success"
                );
                if (staffModal) staffModal.hide();
                await loadStaff();
            } catch (e) {
                console.error(e);
                showAlertStaff("Không thể kết nối server!");
            }
        });
    }

    // ===== XOÁ NHÂN VIÊN =====
    async function deleteStaff(id) {
        try {
            const res = await fetch(`/api/admin-staff-manager/${id}`, {
                method: "DELETE"
            });
            if (!res.ok) {
                const data = await res.json().catch(() => null);
                return showAlertStaff((data && data.message) || "Xóa nhân viên thất bại!");
            }
            showAlertStaff("Xóa nhân viên thành công!", "success");
            await loadStaff();
        } catch (e) {
            console.error(e);
            showAlertStaff("Không thể kết nối server!");
        }
    }
    loadStaff();
});
