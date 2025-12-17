const API_URL = "/api/admin-promotion-manager";
const PRODUCT_API = "/api/adminproducts";
const CATEGORY_API = "/api/admin-categories";

let currentDeleteId = null;
let voucherModal, deleteModal;

let allProducts = [];
let allCategories = [];

function showAlert(message, type = "error") {
  const box = document.getElementById("alertBoxCustomer");
  const msgEl = document.getElementById("alertMessageCustomer");
  const icon = document.getElementById("alertIconCustomer");

  if (!box || !msgEl || !icon) {
    window.alert(message);
    return;
  }

  msgEl.textContent = message || "Thông báo";

  if (type === "success") {
    icon.innerHTML = '<i class="bi bi-check-circle-fill"></i>';
    icon.style.color = "#28a745";
  } else {
    icon.innerHTML = '<i class="bi bi-x-circle-fill"></i>';
    icon.style.color = "#c8102e";
  }

  box.classList.add("show");
}

function hideAlert() {
  const box = document.getElementById("alertBoxCustomer");
  if (box) box.classList.remove("show");
}

document.addEventListener("DOMContentLoaded", () => {
  voucherModal = new bootstrap.Modal(document.getElementById("voucherModal"));
  deleteModal = new bootstrap.Modal(document.getElementById("confirmDeleteModal"));

  loadVouchers();
  loadProductsAndCategories();

  const btnOpenCreate = document.getElementById("btnOpenCreateModal");
  if (btnOpenCreate) {
    btnOpenCreate.addEventListener("click", openCreateModal);
  }

  const voucherForm = document.getElementById("voucherForm");
  if (voucherForm) {
    voucherForm.addEventListener("submit", (e) => handleSubmitForm(e, false));
  }

  const btnConfirmDelete = document.getElementById("btnConfirmDelete");
  if (btnConfirmDelete) {
    btnConfirmDelete.addEventListener("click", confirmDelete);
  }

  const promoType = document.getElementById("promoType");
  if (promoType) {
    promoType.addEventListener("change", handleTypeChange);
  }

  const btnSaveDraft = document.getElementById("btnSaveDraft");
  if (btnSaveDraft) {
    btnSaveDraft.addEventListener("click", (e) => handleSubmitForm(e, true));
  }

  ["applyProduct", "applyCategory", "applyAll"].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener("change", () => renderTargetOptions());
  });

  const alertOk = document.getElementById("alertOkCustomer");
  if (alertOk) {
    alertOk.addEventListener("click", hideAlert);
  }
});

async function loadProductsAndCategories() {
  try {
    const [prodRes, cateRes] = await Promise.all([
      fetch(PRODUCT_API),
      fetch(CATEGORY_API)
    ]);

    if (!prodRes.ok) throw new Error("Không load được sản phẩm");
    if (!cateRes.ok) throw new Error("Không load được danh mục");

    allProducts = await prodRes.json();

    const cateData = await cateRes.json();
    allCategories = cateData.filter(c =>
      c.trangthai === 1 || c.trangthai == null
    );

    renderTargetOptions();
  } catch (e) {
    console.error("Lỗi tải sản phẩm / danh mục cho khuyến mãi:", e);
    const container = document.getElementById("targetContainer");
    if (container) {
      container.innerHTML = `
        <p class="text-danger small mb-0">
          Lỗi tải danh sách sản phẩm / danh mục.
        </p>`;
    }
  }
}

function renderTargetOptions(selectedCategoryIds = [], selectedProductIds = []) {
  const container = document.getElementById("targetContainer");
  if (!container) return;

  const applyTo = document.querySelector('input[name="applyTo"]:checked')?.value || "product";

  container.innerHTML = "";

  if (applyTo === "product") {
    if (!allProducts.length) {
      container.innerHTML = `
        <p class="text-muted small mb-0">
          Chưa có sản phẩm nào để áp dụng khuyến mãi.
        </p>`;
      return;
    }

    const selectedSet = new Set((selectedProductIds || []).map(Number));

    allProducts.forEach(p => {
      const wrap = document.createElement("div");
      wrap.className = "form-check";

      const cb = document.createElement("input");
      cb.type = "checkbox";
      cb.className = "form-check-input target-item";
      cb.value = p.idsanpham;
      cb.id = "target_product_" + p.idsanpham;
      cb.dataset.type = "product";

      if (selectedSet.has(Number(p.idsanpham))) cb.checked = true;

      const label = document.createElement("label");
      label.className = "form-check-label";
      label.htmlFor = cb.id;
      label.textContent = `${p.tensanpham} (ID: ${p.idsanpham})`;

      wrap.appendChild(cb);
      wrap.appendChild(label);
      container.appendChild(wrap);
    });

    return;
  }

  if (applyTo === "category") {
    if (!allCategories.length) {
      container.innerHTML = `
        <p class="text-muted small mb-0">
          Chưa có danh mục nào để áp dụng khuyến mãi.
        </p>`;
      return;
    }

    const selectedSet = new Set((selectedCategoryIds || []).map(Number));

    allCategories.forEach(c => {
      const wrap = document.createElement("div");
      wrap.className = "form-check";

      const cb = document.createElement("input");
      cb.type = "checkbox";
      cb.className = "form-check-input target-item";
      cb.value = c.iddanhmuc;
      cb.id = "target_category_" + c.iddanhmuc;
      cb.dataset.type = "category";

      if (selectedSet.has(Number(c.iddanhmuc))) cb.checked = true;

      const label = document.createElement("label");
      label.className = "form-check-label";
      label.htmlFor = cb.id;
      label.textContent = c.tendanhmuc;

      wrap.appendChild(cb);
      wrap.appendChild(label);
      container.appendChild(wrap);
    });

    return;
  }

  container.innerHTML = `
    <p class="text-success small mb-0">
      Áp dụng cho toàn bộ sản phẩm. Không cần chọn thêm.
    </p>`;
}

function handleTypeChange() {
  const type = document.getElementById("promoType").value;
  const unitSpan = document.getElementById("unit");
  unitSpan.textContent = (type === "percent") ? "%" : "₫";
}

async function loadVouchers() {
  const tbody = document.getElementById("voucherList");
  tbody.innerHTML = `
    <tr>
      <td colspan="7" class="text-center text-muted">
        Đang tải dữ liệu...
      </td>
    </tr>
  `;

  try {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error("Không load được dữ liệu");
    const data = await res.json();

    if (!data || data.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7" class="text-center text-muted">
            Chưa có khuyến mãi nào.
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = "";
    data.forEach(km => tbody.appendChild(createVoucherRow(km)));
  } catch (e) {
    console.error(e);
    tbody.innerHTML = `
      <tr>
        <td colspan="7" class="text-center text-danger">
          Lỗi tải khuyến mãi.
        </td>
      </tr>
    `;
  }
}

function createVoucherRow(km) {
  const tr = document.createElement("tr");
  tr.dataset.id = km.idkhuyenmai;

  const statusInfo = getStatus(km);

  const valueText = km.loai === "percent"
    ? `${km.mucgiamgia}%`
    : km.loai === "fixed"
      ? formatCurrency(km.mucgiamgia)
      : (km.loai === "buy1get1" ? "Mua 1 Tặng 1" : formatCurrency(km.mucgiamgia));

  const typeLabel = {
    percent: "Giảm theo %",
    fixed: "Giảm cố định",
    buy1get1: "Mua 1 tặng 1",
    combo: "Combo khuyến mãi"
  }[km.loai] || "Khuyến mãi";

  const minOrderText = km.dontoithieu && km.dontoithieu > 0
    ? `Đơn từ ${formatCurrency(km.dontoithieu)}`
    : "Không giới hạn";

  const targetText = (() => {
    if (km.apdungcho === "all")      return "Toàn cửa hàng";
    if (km.apdungcho === "category") return "Theo danh mục";
    if (km.tenSanPham && km.tenSanPham.length > 0) {
      const first = km.tenSanPham[0];
      const more  = km.tenSanPham.length - 1;
      return more > 0 ? `${first} +${more} SP khác` : first;
    }
    return "Sản phẩm cụ thể";
  })();

  tr.innerHTML = `
    <td>
      <div class="fw-bold text-danger">
        <i class="bi bi-tag-fill"></i> ${km.tenkhuyenmai}
      </div>
      <div class="small text-muted">${km.mota || ""}</div>
    </td>

    <td class="text-center">
      <div class="${km.loai === "buy1get1" ? "text-primary" : "text-success"} fw-bold">
        ${valueText}
      </div>
      <div class="small text-muted">${typeLabel}</div>
    </td>

    <td class="text-center">
      ${targetText}
    </td>

    <td class="text-center">
      <div><i class="bi bi-calendar-check"></i> ${formatDate(km.ngaybatdau)}</div>
      <div class="small text-muted">→ ${formatDate(km.ngayketthuc)}</div>
    </td>

    <td class="text-center">
      <span class="badge bg-light text-dark border">
        ${minOrderText}
      </span>
    </td>

    <td class="text-center">
      <span class="${statusInfo.className} px-3 py-1 rounded-pill">
        ${statusInfo.label}
      </span>
    </td>

    <td class="text-center">
      <button class="btn btn-outline-warning btn-sm me-1" onclick="openEditModal(${km.idkhuyenmai})">
        <i class="bi bi-pencil-square"></i>
      </button>
      <button class="btn btn-outline-danger btn-sm" onclick="openDeleteModal(${km.idkhuyenmai})">
        <i class="bi bi-trash3"></i>
      </button>
    </td>
  `;

  return tr;
}

function formatCurrency(v) {
  return Number(v || 0).toLocaleString("vi-VN", {
    style: "currency",
    currency: "VND"
  });
}

/**
 * HIỂN THỊ NGÀY: cắt chuỗi, KHÔNG dùng Date => không bao giờ lệch 1 ngày
 * Input: "2025-12-09T00:00"
 * Output: "09/12/2025"
 */
function formatDate(str) {
  if (!str) return "";
  const [datePart] = str.split("T");   // "2025-12-09"
  const [y, m, d] = datePart.split("-");
  return `${d}/${m}/${y}`;
}

/**
 * Parse string yyyy-MM-ddTHH:mm (hoặc có .ss) sang Date để so sánh logic
 * (dùng cho validate & trạng thái, không dùng cho hiển thị)
 */
function parseLocalDateTime(str) {
  if (!str) return null;

  const [datePart, timeFull = "00:00"] = str.split("T");
  const [timePart] = timeFull.split(".");
  const [y, m, d] = datePart.split("-").map(Number);
  const [hh = 0, mm = 0] = timePart.split(":").map(Number);

  if (!y || !m || !d) return null;

  return new Date(y, m - 1, d, hh, mm);
}

function getStatus(km) {
  if (km.trangthai == null || km.trangthai === 0) {
    return { label: "Tạm tắt / Nháp", className: "status-draft" };
  }

  const now = new Date();
  const s   = parseLocalDateTime(km.ngaybatdau);
  const e   = parseLocalDateTime(km.ngayketthuc);

  if (s && now < s) return { label: "Sắp diễn ra", className: "status-upcoming" };
  if (e && now > e) return { label: "Đã hết hạn",  className: "status-expired" };
  return               { label: "Đang hoạt động", className: "status-active" };
}

function openCreateModal() {
  document.getElementById("voucherModalTitle").innerHTML =
    '<i class="bi bi-plus-circle-fill"></i> Tạo voucher mới';

  resetForm();
  voucherModal.show();
}

async function openEditModal(id) {
  try {
    const res = await fetch(`${API_URL}/${id}`);
    if (!res.ok) throw new Error("Không tìm thấy khuyến mãi");
    const km = await res.json();

    document.getElementById("voucherModalTitle").innerHTML =
      '<i class="bi bi-pencil-square"></i> Cập nhật voucher';

    document.getElementById("voucherId").value      = km.idkhuyenmai;
    document.getElementById("promoName").value      = km.tenkhuyenmai || "";
    document.getElementById("promoType").value      = km.loai || "";
    document.getElementById("discountValue").value  = km.mucgiamgia || 0;
    handleTypeChange();

    if (km.apdungcho === "category") {
      document.getElementById("applyCategory").checked = true;
    } else if (km.apdungcho === "all") {
      document.getElementById("applyAll").checked = true;
    } else {
      document.getElementById("applyProduct").checked = true;
    }

    // DÙNG THẲNG STRING, KHÔNG QUA Date
    document.getElementById("startDate").value = toInputDateTime(km.ngaybatdau);
    document.getElementById("endDate").value   = toInputDateTime(km.ngayketthuc);
    document.getElementById("minAmount").value = km.dontoithieu || "";
    document.getElementById("description").value = km.mota || "";

    const categoryIds = km.iddanhmuc || [];
    const productIds  = km.idsanpham || [];

    renderTargetOptions(categoryIds, productIds);

    voucherModal.show();
  } catch (e) {
    console.error(e);
    showAlert("Lỗi tải dữ liệu khuyến mãi để sửa.", "error");
  }
}

/**
 * CHO INPUT datetime-local:
 * backend gửi "2025-12-09T00:00" hoặc "2025-12-09T00:00:00.000"
 * -> chuẩn hóa thành "2025-12-09T00:00"
 */
function toInputDateTime(str) {
  if (!str) return "";
  const [datePart, timeFull = "00:00"] = str.split("T");
  const [timePart] = timeFull.split(".");
  const [hh = "00", mm = "00"] = timePart.split(":");
  const pad = n => n.toString().padStart(2, "0");
  return `${datePart}T${pad(hh)}:${pad(mm)}`;
}

function resetForm() {
  const form = document.getElementById("voucherForm");
  if (form) form.reset();
  document.getElementById("voucherId").value = "";
  document.getElementById("unit").textContent = "%";

  const applyProduct = document.getElementById("applyProduct");
  if (applyProduct) applyProduct.checked = true;

  const container = document.getElementById("targetContainer");
  if (container) {
    container.innerHTML = `
      <p class="text-muted mb-0 small">
        Chọn "Sản phẩm" hoặc "Danh mục" bên trên để hiển thị danh sách.
      </p>`;
  }
}

async function handleSubmitForm(e, isDraft) {
  e.preventDefault();

  const id        = document.getElementById("voucherId").value;
  const ten       = document.getElementById("promoName").value.trim();
  const loai      = document.getElementById("promoType").value;
  const giatri    = Number(document.getElementById("discountValue").value || 0);
  const startDate = document.getElementById("startDate").value;
  const endDate   = document.getElementById("endDate").value;
  const minAmount = Number(document.getElementById("minAmount").value || 0);
  const mota      = document.getElementById("description").value.trim();
  const applyTo   = document.querySelector('input[name="applyTo"]:checked')?.value || "product";

  if (!ten) {
    showAlert("Tên khuyến mãi không được trống!", "error");
    return;
  }
  if (!loai) {
    showAlert("Vui lòng chọn loại khuyến mãi.", "error");
    return;
  }
  if (!startDate || !endDate) {
    showAlert("Vui lòng chọn đầy đủ ngày bắt đầu và ngày kết thúc.", "error");
    return;
  }

  const start = parseLocalDateTime(startDate);
  const end   = parseLocalDateTime(endDate);

  if (!start || !end) {
    showAlert("Ngày giờ không hợp lệ. Vui lòng nhập đúng định dạng.", "error");
    return;
  }

  if (end <= start) {
    showAlert("Ngày kết thúc phải sau ngày bắt đầu.", "error");
    return;
  }

  if (loai === "percent" && (giatri <= 0 || giatri > 100)) {
    showAlert("Giá trị phần trăm phải lớn hơn 0 và nhỏ hơn hoặc bằng 100.", "error");
    return;
  }

  let idsanpham  = [];
  let iddanhmuc  = [];

  const checkedItems = document.querySelectorAll("#targetContainer .target-item:checked");

  if (applyTo === "product") {
    idsanpham = Array.from(checkedItems)
      .map(cb => Number(cb.value))
      .filter(v => !Number.isNaN(v));
  } else if (applyTo === "category") {
    iddanhmuc = Array.from(checkedItems)
      .map(cb => Number(cb.value))
      .filter(v => !Number.isNaN(v));
  }

  const dto = {
    tenkhuyenmai: ten,
    loai: loai,
    mucgiamgia: giatri,
    apdungcho: applyTo,
    dontoithieu: minAmount,
    ngaybatdau: startDate,
    ngayketthuc: endDate,
    mota: mota,
    trangthai: isDraft ? 0 : 1,
    idsanpham,
    iddanhmuc
  };

  console.log("DTO gửi lên:", dto);

  try {
    let res;
    if (id) {
      res = await fetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dto)
      });
    } else {
      res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dto)
      });
    }

    if (!res.ok) {
      let msg = "Lưu khuyến mãi thất bại.";
      try {
        const text = await res.text();
        try {
          const obj = JSON.parse(text);
          if (obj.message) msg = obj.message;
        } catch {
          if (text) msg = text;
        }
      } catch {}

      console.error("Lỗi lưu:", msg);
      showAlert(msg, "error");
      return;
    }

    showAlert(id ? "Cập nhật khuyến mãi thành công." : "Tạo khuyến mãi thành công.", "success");

    voucherModal.hide();
    await loadVouchers();
  } catch (e2) {
    console.error(e2);
    showAlert("Không thể kết nối server.", "error");
  }
}

function openDeleteModal(id) {
  currentDeleteId = id;
  deleteModal.show();
}

async function confirmDelete() {
  if (!currentDeleteId) return;
  try {
    const res = await fetch(`${API_URL}/${currentDeleteId}`, { method: "DELETE" });
    if (!res.ok) {
      showAlert("Xóa khuyến mãi thất bại.", "error");
      return;
    }
    deleteModal.hide();
    currentDeleteId = null;
    await loadVouchers();
  } catch (e) {
    console.error(e);
    showAlert("Không thể kết nối server.", "error");
  }
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