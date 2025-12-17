const CUSTOMER_API = "/api/staff-customer-manager";
const INVOICE_API  = "/api/staff-invoice";
const STAFF_API    = "/api/admin-staff-manager";

document.addEventListener("DOMContentLoaded", () => {
  // ==== CHECK LOGIN ====
  const userJson = localStorage.getItem("user");
  if (!userJson) {
    window.location.replace("/login");
    return;
  }
  const user = JSON.parse(userJson);

  const welcomeUser = document.getElementById("welcomeUser");
  if (welcomeUser) {
    welcomeUser.textContent = `Xin chào, ${user.hoten ?? user.tendangnhap}`;
  }
  const staffFooterName = document.getElementById("staffFooterName");
  if (staffFooterName) {
    staffFooterName.textContent = user.hoten ?? user.tendangnhap;
  }

  const logout = document.getElementById("logoutBtn");
  if (logout) {
    logout.addEventListener("click", async () => {
      try {
        await fetch("/api/auth/logout", { method: "POST" });
      } catch {}
      localStorage.removeItem("user");
      window.location.href = "/login";
    });
  }

  // ==== ALERT ====
  function closeAlertCustomer() {
    const box = document.getElementById("alertBoxCustomer");
    if (box) box.classList.remove("show");
  }
  window.closeAlertCustomer = closeAlertCustomer;

  function showAlertCustomer(message, type = "error") {
    const modal = document.getElementById("alertBoxCustomer");
    const msg   = document.getElementById("alertMessageCustomer");
    const icon  = document.getElementById("alertIconCustomer");
    if (!modal || !msg || !icon) {
      alert(message);
      return;
    }
    msg.textContent = message;
    icon.textContent = type === "success" ? "✔" : "✖";
    icon.style.color = type === "success" ? "green" : "red";
    modal.classList.add("show");
  }
  window.showAlertCustomer = showAlertCustomer;

  const alertOk = document.getElementById("alertOkCustomer");
  if (alertOk) {
    alertOk.addEventListener("click", closeAlertCustomer);
  }

  // ==== ELEMENTS ====
  const tbody        = document.getElementById("customerTbody");
  const searchInput  = document.querySelector(".search-input");
  const historyTbody = document.getElementById("historyTbody");

  const addModalEl      = document.getElementById("addCustomerModal");
  const editModalEl     = document.getElementById("editCustomerModal");
  const viewModalEl     = document.getElementById("viewCustomerModal");
  const historyModalEl  = document.getElementById("historyModal");
  const orderDetailEl   = document.getElementById("orderDetailModal");

  const addModal      = addModalEl ? new bootstrap.Modal(addModalEl) : null;
  const editModal     = editModalEl ? new bootstrap.Modal(editModalEl) : null;
  const viewModal     = viewModalEl ? new bootstrap.Modal(viewModalEl) : null;
  const historyModal  = historyModalEl ? new bootstrap.Modal(historyModalEl) : null;
  const orderDetailMd = orderDetailEl ? new bootstrap.Modal(orderDetailEl) : null;

  const addForm  = document.getElementById("addCustomerForm");
  const editForm = document.getElementById("editCustomerForm");

  let customers = [];
  let staffMap  = {};

  function formatDateForInput(d) {
    if (!d) return "";
    if (/^\d{4}-\d{2}-\d{2}$/.test(d)) return d;
    const date = new Date(d);
    if (isNaN(date)) return "";
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  }

  async function loadStaffs() {
    try {
      const res = await fetch(STAFF_API);
      if (!res.ok) return;
      const data = await res.json();
      staffMap = {};
      (data || []).forEach(s => {
        if (s.idnhanvien) {
          staffMap[s.idnhanvien] =
            s.hoten || s.tennhanvien || ("NV#" + s.idnhanvien);
        }
      });
    } catch {
      console.error("Cannot load staff list");
    }
  }

  // ==== LOAD LIST KHÁCH ====
  async function loadCustomers() {
    if (!tbody) return;
    try {
      const res = await fetch(CUSTOMER_API);
      if (!res.ok) {
        showAlertCustomer("Không thể tải danh sách khách hàng!");
        return;
      }
      customers = await res.json();
      renderTable(customers);
    } catch {
      showAlertCustomer("Không thể kết nối server!");
    }
  }

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
              <i class="fa-solid fa-pen"></i>
            </button>
            <button class="btn btn-sm btn-info text-white me-1 btn-view" data-id="${c.idkhachhang}">
              <i class="fa-solid fa-eye"></i>
            </button>
            <button class="btn btn-sm btn-primary text-white me-1 btn-history" data-id="${c.idkhachhang}">
              <i class="fa-solid fa-clock-rotate-left"></i>
            </button>
            <button class="btn btn-sm btn-danger btn-delete" data-id="${c.idkhachhang}">
              <i class="fa-solid fa-trash"></i>
            </button>
          </td>
        </tr>
      `;
    });
    bindRowButtons();
  }

  // SEARCH
  if (searchInput && tbody) {
    searchInput.addEventListener("input", () => {
      const kw = searchInput.value.trim().toLowerCase();
      if (!kw) {
        renderTable(customers);
        return;
      }
      const filtered = customers.filter(c =>
        (c.hoten || "").toLowerCase().includes(kw) ||
        (c.email || "").toLowerCase().includes(kw) ||
        (c.sodienthoai || "").toLowerCase().includes(kw) ||
        (c.diachi || "").toLowerCase().includes(kw)
      );
      renderTable(filtered);
    });
  }

  // ADD
  if (addForm) {
    addForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const hoten       = document.getElementById("addFullName").value.trim();
      const email       = document.getElementById("addEmail").value.trim();
      const sodienthoai = document.getElementById("addPhone").value.trim();
      const gioitinh    = document.getElementById("addGender").value;
      const ngaysinh    = document.getElementById("addDob").value;
      const diachi      = document.getElementById("addAddress").value.trim();

      if (!hoten) return showAlertCustomer("Họ tên không được để trống!");
      if (!sodienthoai) return showAlertCustomer("Số điện thoại không được để trống!");

      try {
        const res = await fetch(CUSTOMER_API, {
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
        addModal && addModal.hide();
        await loadCustomers();
      } catch {
        showAlertCustomer("Không thể kết nối server!");
      }
    });
  }

  // BIND BUTTONS
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

  // EDIT
  function openEditCustomer(id) {
    const c = customers.find(x => String(x.idkhachhang) === String(id));
    if (!c) return showAlertCustomer("Không tìm thấy khách hàng!");

    document.getElementById("editId").value        = c.idkhachhang;
    document.getElementById("editFullName").value  = c.hoten || "";
    document.getElementById("editEmail").value     = c.email || "";
    document.getElementById("editPhone").value     = c.sodienthoai || "";
    document.getElementById("editGender").value    = c.gioitinh || "Nam";
    document.getElementById("editDob").value       = formatDateForInput(c.ngaysinh);
    document.getElementById("editAddress").value   = c.diachi || "";

    editModal && editModal.show();
  }

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
        const res = await fetch(`${CUSTOMER_API}/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ hoten, email, sodienthoai, gioitinh, ngaysinh, diachi })
        });
        const data = await res.json().catch(() => null);
        if (!res.ok) {
          return showAlertCustomer((data && data.message) || "Cập nhật thất bại!");
        }
        showAlertCustomer("Cập nhật khách hàng thành công!", "success");
        editModal && editModal.hide();
        await loadCustomers();
      } catch {
        showAlertCustomer("Không thể kết nối server!");
      }
    });
  }

  // VIEW
  function openViewCustomer(id) {
    const c = customers.find(x => String(x.idkhachhang) === String(id));
    if (!c) return showAlertCustomer("Không tìm thấy khách hàng!");

    document.getElementById("modalName").textContent    = c.hoten || "";
    document.getElementById("modalEmail").textContent   = c.email || "";
    document.getElementById("modalPhone").textContent   = c.sodienthoai || "";
    document.getElementById("modalAddress").textContent = c.diachi || "";
    document.getElementById("modalGender").textContent  = c.gioitinh || "";
    document.getElementById("modalDob").textContent     = c.ngaysinh || "";

    viewModal && viewModal.show();
  }

  // HISTORY: lấy toàn bộ hóa đơn rồi filter theo idkhachhang
  async function openHistory(customerId) {
    if (!historyTbody) return;
    try {
      const res = await fetch(INVOICE_API);
      if (!res.ok) throw new Error();
      const allInvoices = await res.json();

      const orders = allInvoices.filter(o =>
        String(o.idkhachhang) === String(customerId)
      );

      historyTbody.innerHTML = "";
      if (!orders.length) {
        historyTbody.innerHTML = `
          <tr>
            <td colspan="4" class="text-muted">Khách hàng chưa có hóa đơn nào.</td>
          </tr>
        `;
      } else {
        orders.forEach(o => {
          historyTbody.innerHTML += `
            <tr>
              <td>#HD${o.idhoadon}</td>
              <td>${o.ngaygiaodich || ""}</td>
              <td>${Number(o.tongthanhtoan || 0).toLocaleString("vi-VN")}đ</td>
              <td>
                <button class="btn btn-sm btn-info text-white btn-detail" data-id="${o.idhoadon}">Xem chi tiết</button>
              </td>
            </tr>
          `;
        });
      }

      historyTbody.querySelectorAll(".btn-detail").forEach(btn => {
        btn.addEventListener("click", () => openOrderDetail(btn.dataset.id));
      });

      historyModal && historyModal.show();
    } catch {
      showAlertCustomer("Không thể tải lịch sử mua hàng!");
    }
  }

  // CHI TIẾT HÓA ĐƠN – dùng API staff-invoices/{id}
  async function openOrderDetail(orderId) {
    try {
      const res = await fetch(`${INVOICE_API}/${orderId}`);
      if (!res.ok) throw new Error();
      const o = await res.json();

      document.getElementById("detailOrderId").textContent   = o.idhoadon;
      document.getElementById("detailOrderDate").textContent = o.ngaygiaodich || "";

      // Tên nhân viên
      let tenNV = o.tennhanvien || "";
      if (!tenNV && o.idnhanvien && staffMap[o.idnhanvien]) {
        tenNV = staffMap[o.idnhanvien];
      }
      if (!tenNV) {
        tenNV = user.hoten || user.tendangnhap || "";
      }
      document.getElementById("detailOrderStaff").textContent = tenNV;

      // Tính giá gốc & giảm giá
      let giaGoc = 0;
      if (o.chitiet && o.chitiet.length) {
        o.chitiet.forEach(item => {
          giaGoc += Number(item.thanhtien || 0);
        });
      }
      const tong = Number(o.tongthanhtoan || 0);
      let giamGia = giaGoc - tong;
      if (giamGia < 0) giamGia = 0;

      if (typeof o.giagoc === "number") giaGoc = o.giagoc;
      if (typeof o.giamgia === "number") giamGia = o.giamgia;

      const voucherCode =
        o.voucherCode || (giamGia > 0 ? "Voucher" : "không áp dụng");

      document.getElementById("detailGiaGoc").textContent =
        giaGoc.toLocaleString("vi-VN") + "đ";
      document.getElementById("detailGiamGia").textContent =
        giamGia.toLocaleString("vi-VN") + "đ";
      document.getElementById("detailVoucherCode").textContent = voucherCode;
      document.getElementById("detailOrderTotal").textContent =
        tong.toLocaleString("vi-VN") + "đ";

      const container = document.getElementById("detailOrderProducts");
      container.innerHTML = "";

      if (o.chitiet && o.chitiet.length) {
        const table = document.createElement("table");
        table.className = "table table-sm align-middle text-center";
        table.innerHTML = `
          <thead>
            <tr>
              <th>Sản phẩm</th>
              <th>SL</th>
              <th>Đơn giá</th>
              <th>Thành tiền</th>
            </tr>
          </thead>
          <tbody></tbody>
        `;
        const tb = table.querySelector("tbody");
        o.chitiet.forEach(item => {
          const tr = document.createElement("tr");
          tr.innerHTML = `
            <td>${item.tensanpham || ("SP#" + item.idsanpham)}</td>
            <td>${item.soluong}</td>
            <td>${Number(item.dongia).toLocaleString("vi-VN")}đ</td>
            <td>${Number(item.thanhtien).toLocaleString("vi-VN")}đ</td>
          `;
          tb.appendChild(tr);
        });
        container.appendChild(table);
      } else {
        container.textContent = "Không có sản phẩm.";
      }

      orderDetailMd && orderDetailMd.show();
    } catch {
      showAlertCustomer("Không thể tải chi tiết hóa đơn!");
    }
  }

  // CONFIRM DELETE
  const confirmBox = document.getElementById("confirmDeleteBox");
  const btnYes     = document.getElementById("btnConfirmDeleteYes");
  const btnNo      = document.getElementById("btnConfirmDeleteNo");
  let deleteId = null;

  function openDeleteConfirm(id) {
    deleteId = id;
    if (confirmBox) confirmBox.classList.add("show");
    else if (window.confirm("Bạn có chắc muốn xóa khách hàng này?")) {
      deleteCustomer(id);
    }
  }

  function closeDeleteConfirm() {
    deleteId = null;
    if (confirmBox) confirmBox.classList.remove("show");
  }

  if (btnNo)  btnNo.addEventListener("click", closeDeleteConfirm);
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
      const res = await fetch(`${CUSTOMER_API}/${id}`, { method: "DELETE" });
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

  (async () => {
    await loadStaffs();
    await loadCustomers();
  })();
});
