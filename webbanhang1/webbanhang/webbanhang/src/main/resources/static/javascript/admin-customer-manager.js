document.addEventListener("DOMContentLoaded", () => {
    // ===== CHECK LOGIN + ROLE =====
    const userJson = localStorage.getItem("user");
    if (!userJson) return window.location.replace("/login");
    const user = JSON.parse(userJson);
    if (user.vaitro !== "admin") return window.location.replace("/staff");

    const welcomeUser = document.getElementById("welcomeUser");
    if (welcomeUser) {
        welcomeUser.textContent = `Xin chào, ${user.hoten ?? user.tendangnhap}`;
    }

    // LOGOUT
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

    // ===== ALERT BOX =====
    window.closeAlertCustomer = () =>
        document.getElementById("alertBoxCustomer")?.classList.remove("show");

    function showAlertCustomer(message, type = "error") {
        const modal = document.getElementById("alertBoxCustomer");
        const msg   = document.getElementById("alertMessageCustomer");
        const icon  = document.getElementById("alertIconCustomer");
        if (!modal || !msg || !icon) {
            return alert(message);
        }
        msg.textContent = message || "Thông báo";
        icon.textContent = type === "success" ? "✔" : "✖";
        icon.style.color = type === "success" ? "green" : "red";
        modal.classList.add("show");
    }

    // ===== DATA & ELEMENTS =====
    const tbody        = document.getElementById("customerTbody");
    const searchInput  = document.querySelector(".search-input");
    const historyTbody = document.getElementById("historyTbody");

    const addModalEl       = document.getElementById("addCustomerModal");
    const editModalEl      = document.getElementById("editCustomerModal");
    const viewModalEl      = document.getElementById("viewCustomerModal");
    const historyModalEl   = document.getElementById("historyModal");
    const orderDetailModalEl = document.getElementById("orderDetailModal");

    const addModal       = addModalEl ? new bootstrap.Modal(addModalEl) : null;
    const editModal      = editModalEl ? new bootstrap.Modal(editModalEl) : null;
    const viewModal      = viewModalEl ? new bootstrap.Modal(viewModalEl) : null;
    const historyModal   = historyModalEl ? new bootstrap.Modal(historyModalEl) : null;
    const orderDetailModal = orderDetailModalEl ? new bootstrap.Modal(orderDetailModalEl) : null;

    const addForm  = document.getElementById("addCustomerForm");
    const editForm = document.getElementById("editCustomerForm");

    let customers = [];

    // ===== FORMAT DATE FOR INPUT =====
    function formatDateForInput(d) {
        if (!d) return "";
        if (/^\d{4}-\d{2}-\d{2}$/.test(d)) return d;
        const date = new Date(d);
        if (isNaN(date)) return "";
        const y   = date.getFullYear();
        const m   = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${y}-${m}-${day}`;
    }

    // ===== LOAD LIST =====
    async function loadCustomers() {
        if (!tbody) return;
        try {
            const res = await fetch("/api/admin-customer-manager");
            if (!res.ok) return showAlertCustomer("Không thể tải danh sách khách hàng!");
            customers = await res.json();
            renderTable(customers);
        } catch {
            showAlertCustomer("Không thể kết nối server!");
        }
    }

    // ===== RENDER TABLE =====
    function renderTable(data) {
        if (!tbody) return;
        tbody.innerHTML = "";
        data.forEach(c => {
            tbody.innerHTML += `
                <tr>
                    <td>${c.idkhachhang}</td>
                    <td>${c.hoten || ""}</td>
                    <td>${c.email || ""}</td>
                    <td>${c.sodienthoai || ""}</td>
                    <td>${c.diachi || ""}</td>
                    <td class="text-center">
                        <button class="btn btn-sm btn-warning me-1 btn-edit" data-id="${c.idkhachhang}">
                            <i class="bi bi-pencil-fill"></i>
                        </button>
                        <button class="btn btn-sm btn-info text-white me-1 btn-view" data-id="${c.idkhachhang}">
                            <i class="bi bi-eye-fill"></i>
                        </button>
                        <button class="btn btn-sm btn-primary text-white me-1 btn-history" data-id="${c.idkhachhang}">
                            <i class="bi bi-arrow-counterclockwise"></i>
                        </button>
                        <button class="btn btn-sm btn-danger btn-delete" data-id="${c.idkhachhang}">
                            <i class="bi bi-trash-fill"></i>
                        </button>
                    </td>
                </tr>
            `;
        });
        bindRowButtons();
    }

    // ===== SEARCH =====
    if (searchInput && tbody) {
        searchInput.addEventListener("input", () => {
            const kw = searchInput.value.trim().toLowerCase();
            if (!kw) return renderTable(customers);
            const filtered = customers.filter(c =>
                (c.hoten || "").toLowerCase().includes(kw) ||
                (c.email || "").toLowerCase().includes(kw) ||
                (c.sodienthoai || "").toLowerCase().includes(kw) ||
                (c.diachi || "").toLowerCase().includes(kw)
            );
            renderTable(filtered);
        });
    }

    // ===== ADD CUSTOMER =====
    if (addForm) {
        addForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            const hoten       = document.getElementById("addFullName").value.trim();
            const email       = document.getElementById("addEmail").value.trim();
            const sodienthoai = document.getElementById("addPhone").value.trim();
            const gioitinh    = document.getElementById("addGender").value;
            const ngaysinh    = document.getElementById("addDob").value;
            const diachi      = document.getElementById("addAddress").value.trim();

            if (!hoten)       return showAlertCustomer("Họ tên không được để trống!");
            if (!sodienthoai) return showAlertCustomer("Số điện thoại không được để trống!");

            try {
                const res = await fetch("/api/admin-customer-manager", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ hoten, email, sodienthoai, gioitinh, ngaysinh, diachi })
                });
                const data = await res.json().catch(() => null);
                if (!res.ok) {
                    return showAlertCustomer((data && data.message) || "Thêm khách hàng thất bại!");
                }
                showAlertCustomer("Thêm khách hàng thành công!", "success");
                addForm.reset();
                addModal?.hide();
                await loadCustomers();
            } catch {
                showAlertCustomer("Không thể kết nối server!");
            }
        });
    }

    // ===== BIND BUTTONS TRONG BẢNG =====
    function bindRowButtons() {
        if (!tbody) return;
        tbody.querySelectorAll(".btn-edit").forEach(btn =>
            btn.addEventListener("click", () => openEditCustomer(btn.dataset.id))
        );
        tbody.querySelectorAll(".btn-view").forEach(btn =>
            btn.addEventListener("click", () => openViewCustomer(btn.dataset.id))
        );
        tbody.querySelectorAll(".btn-history").forEach(btn =>
            btn.addEventListener("click", () => openHistory(btn.dataset.id))
        );
        tbody.querySelectorAll(".btn-delete").forEach(btn =>
            btn.addEventListener("click", () => openDeleteConfirm(btn.dataset.id))
        );
    }

    // ===== OPEN EDIT MODAL =====
    function openEditCustomer(id) {
        const c = customers.find(x => String(x.idkhachhang) === String(id));
        if (!c) return showAlertCustomer("Không tìm thấy khách hàng!");

        document.getElementById("editId").value       = c.idkhachhang;
        document.getElementById("editFullName").value = c.hoten || "";
        document.getElementById("editEmail").value    = c.email || "";
        document.getElementById("editPhone").value    = c.sodienthoai || "";
        document.getElementById("editGender").value   = c.gioitinh || "Nam";
        document.getElementById("editDob").value      = formatDateForInput(c.ngaysinh);
        document.getElementById("editAddress").value  = c.diachi || "";

        editModal?.show();
    }

    // ===== SUBMIT EDIT =====
    if (editForm) {
        editForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            const id          = document.getElementById("editId").value;
            const hoten       = document.getElementById("editFullName").value.trim();
            const email       = document.getElementById("editEmail").value.trim();
            const sodienthoai = document.getElementById("editPhone").value.trim();
            const gioitinh    = document.getElementById("editGender").value;
            const ngaysinh    = document.getElementById("editDob").value;
            const diachi      = document.getElementById("editAddress").value.trim();

            if (!hoten) return showAlertCustomer("Họ tên không được để trống!");

            try {
                const res = await fetch(`/api/admin-customer-manager/${id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ hoten, email, sodienthoai, gioitinh, ngaysinh, diachi })
                });
                const data = await res.json().catch(() => null);
                if (!res.ok) {
                    return showAlertCustomer((data && data.message) || "Cập nhật thất bại!");
                }
                showAlertCustomer("Cập nhật khách hàng thành công!", "success");
                editModal?.hide();
                await loadCustomers();
            } catch {
                showAlertCustomer("Không thể kết nối server!");
            }
        });
    }

    // ===== VIEW MODAL =====
    function openViewCustomer(id) {
        const c = customers.find(x => String(x.idkhachhang) === String(id));
        if (!c) return showAlertCustomer("Không tìm thấy khách hàng!");

        document.getElementById("modalName").textContent   = c.hoten || "";
        document.getElementById("modalEmail").textContent  = c.email || "";
        document.getElementById("modalPhone").textContent  = c.sodienthoai || "";
        document.getElementById("modalAddress").textContent = c.diachi || "";
        document.getElementById("modalGender").textContent  = c.gioitinh || "";
        document.getElementById("modalDob").textContent     = c.ngaysinh || "";

        viewModal?.show();
    }

    // ===== HISTORY (HÓA ĐƠN THEO KHÁCH) =====
    async function openHistory(customerId) {
        if (!historyTbody) return;
        try {
            const res = await fetch(`/api/admin-invoice-manager/customer/${customerId}`);
            if (!res.ok) throw new Error();
            const orders = await res.json();

            historyTbody.innerHTML = "";
            orders.forEach(o => {
                historyTbody.innerHTML += `
                    <tr>
                        <td>${o.idhoadon}</td>
                        <td>${o.ngaygiaodich || ""}</td>
                        <td>${Number(o.tongthanhtoan || 0).toLocaleString()}₫</td>
                        <td>
                            <button class="btn btn-sm btn-info text-white btn-detail" data-id="${o.idhoadon}">
                                Xem chi tiết
                            </button>
                        </td>
                    </tr>
                `;
            });

            historyTbody.querySelectorAll(".btn-detail").forEach(btn => {
                btn.addEventListener("click", () => openOrderDetail(btn.dataset.id));
            });

            historyModal?.show();
        } catch {
            showAlertCustomer("Không thể tải lịch sử mua hàng!");
        }
    }

    // ===== CHI TIẾT HÓA ĐƠN =====
    async function openOrderDetail(orderId) {
        try {
            const res = await fetch(`/api/admin-invoice-manager/${orderId}`);
            if (!res.ok) throw new Error();
            const o = await res.json();

            document.getElementById("detailOrderId").textContent    = o.idhoadon;
            document.getElementById("detailOrderDate").textContent  = o.ngaygiaodich || "";
            document.getElementById("detailOrderTotal").textContent =
                Number(o.tongthanhtoan || 0).toLocaleString() + "₫";

            const container = document.getElementById("detailOrderProducts");
            container.innerHTML = "";
            if (o.chitiet && o.chitiet.length) {
                const ul = document.createElement("ul");
                ul.classList.add("list-unstyled", "mb-0");
                o.chitiet.forEach(item => {
                    const li = document.createElement("li");
                    li.textContent =
                        `${item.tensanpham} - SL: ${item.soluong} - ` +
                        `Đơn giá: ${Number(item.dongia).toLocaleString()}₫ - ` +
                        `Thành tiền: ${Number(item.thanhtien).toLocaleString()}₫`;
                    ul.appendChild(li);
                });
                container.appendChild(ul);
            } else {
                container.textContent = "Không có sản phẩm.";
            }

            orderDetailModal?.show();
        } catch {
            showAlertCustomer("Không thể tải chi tiết hóa đơn!");
        }
    }

    // ===== CONFIRM DELETE =====
    const confirmBox = document.getElementById("confirmDeleteBox");
    const btnYes     = document.getElementById("btnConfirmDeleteYes");
    const btnNo      = document.getElementById("btnConfirmDeleteNo");
    let deleteId     = null;

    function openDeleteConfirm(id) {
        deleteId = id;
        if (confirmBox) {
            confirmBox.classList.add("show");
        } else {
            if (window.confirm("Bạn có chắc muốn xóa khách hàng này?")) {
                deleteCustomer(id);
            }
        }
    }

    function closeDeleteConfirm() {
        deleteId = null;
        confirmBox?.classList.remove("show");
    }

    if (btnNo) {
        btnNo.addEventListener("click", closeDeleteConfirm);
    }
    if (btnYes) {
        btnYes.addEventListener("click", async () => {
            if (!deleteId) return;
            const id = deleteId;
            closeDeleteConfirm();
            await deleteCustomer(id);
        });
    }
    async function deleteCustomer(id) {
        try {
            const res = await fetch(`/api/admin-customer-manager/${id}`, { method: "DELETE" });
            if (!res.ok) {
                const data = await res.json().catch(() => null);
                return showAlertCustomer((data && data.message) || "Xóa khách hàng thất bại!");
            }
            showAlertCustomer("Xóa khách hàng thành công!", "success");
            await loadCustomers();
        } catch {
            showAlertCustomer("Không thể kết nối server!");
        }
    }

    loadCustomers();
});
