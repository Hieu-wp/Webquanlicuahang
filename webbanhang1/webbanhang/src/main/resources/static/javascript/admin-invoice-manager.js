const INVOICE_API   = "/api/staff-invoice";
const PRODUCT_API   = "/api/adminproducts";
const CUSTOMER_API  = "/api/admin-customer-manager";
const PROMOTION_API = "/api/admin-promotion-manager/active";
const STAFF_API     = "/api/admin-staff-manager";

let allInvoices   = [];
let allProducts   = [];
let allCustomers  = [];
let allPromotions = [];
let staffMap      = {};

let currentItems         = [];
let currentDiscountValue = 0;
let currentDiscountType  = null;
let currentInvoiceId     = null;
let currentUser          = null;
let currentCustomerId    = null; // id khách hàng đang chọn (autocomplete)

let invoiceModal, productModal, voucherModal, invoiceDetailModal;

/* ========== ALERT BOX ========== */
function closeAlertInvoice() {
  const box = document.getElementById("alertBoxInvoice");
  if (box) box.classList.remove("show");
}

function showAlertInvoice(message, type = "error") {
  const modal = document.getElementById("alertBoxInvoice");
  const msg   = document.getElementById("alertMessageInvoice");
  const icon  = document.getElementById("alertIconInvoice");
  if (!modal || !msg || !icon) {
    alert(message);
    return;
  }
  msg.textContent = message || "Thông báo";

  icon.textContent = type === "success" ? "✔" : "✖";
  icon.style.color = type === "success" ? "green" : "red";

  modal.classList.add("show");
}

/* ========== HELPER ĐỌC LỖI TỪ BE ========== */
async function getErrorMessage(res, defaultMsg = "Đã xảy ra lỗi") {
  try {
    const data = await res.clone().json();
    if (data && typeof data.message === "string" && data.message.trim() !== "") {
      return data.message;
    }
  } catch (e) {}

  try {
    const text = await res.text();
    if (!text) return defaultMsg;

    try {
      const obj = JSON.parse(text);
      if (obj && typeof obj.message === "string" && obj.message.trim() !== "") {
        return obj.message;
      }
    } catch {
      return text;
    }
  } catch (e) {}

  return defaultMsg;
}

/* ========== UTILITIES ========== */
function chonTatCaSP(cb) {
  const list = document.querySelectorAll(".chonSP");
  list.forEach(c => (c.checked = cb.checked));
}

function dinhDangTien(v) {
  return Number(v || 0).toLocaleString("vi-VN");
}

/* ========== TÍNH TỔNG TIỀN ========== */
function capNhatTongTien() {
  let giaGoc = 0;
  currentItems.forEach(it => (giaGoc += it.thanhtien));

  let giamGia = 0;
  if (currentDiscountType === "percent") {
    giamGia = Math.floor((giaGoc * currentDiscountValue) / 100);
  } else if (currentDiscountType === "fixed") {
    giamGia = currentDiscountValue;
  }
  if (giamGia > giaGoc) giamGia = giaGoc;

  const tong = giaGoc - giamGia;

  document.getElementById("giaGoc").textContent   = dinhDangTien(giaGoc);
  document.getElementById("giamGia").textContent  = dinhDangTien(giamGia);
  document.getElementById("tongTien").textContent = dinhDangTien(tong);
}

/* ========== RENDER ITEMS TRONG HÓA ĐƠN ========== */
function renderItems() {
  const tbody = document.getElementById("dsSanPham");
  tbody.innerHTML = "";
  currentItems.forEach((it, index) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${it.idsanpham}</td>
      <td>${it.tensanpham}</td>
      <td style="width:90px">
        <input type="number" min="1" class="form-control form-control-sm"
               value="${it.soluong}" data-index="${index}">
      </td>
      <td class="text-end">${dinhDangTien(it.dongia)}</td>
      <td class="text-end">${dinhDangTien(it.thanhtien)}</td>
      <td class="text-center">
        <button type="button" class="btn btn-sm btn-outline-danger" data-index="${index}">
          <i class="bi bi-trash3"></i>
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  tbody.querySelectorAll('input[type="number"]').forEach(input => {
    input.addEventListener("change", function () {
      const idx = Number(this.dataset.index);
      let sl = Number(this.value);
      if (Number.isNaN(sl) || sl <= 0) sl = 1;
      currentItems[idx].soluong = sl;
      currentItems[idx].thanhtien = sl * currentItems[idx].dongia;
      renderItems();
      capNhatTongTien();
    });
  });

  tbody.querySelectorAll("button[data-index]").forEach(btn => {
    btn.addEventListener("click", function () {
      const idx = Number(this.dataset.index);
      currentItems.splice(idx, 1);
      renderItems();
      capNhatTongTien();
    });
  });
}

/* ========== MỞ / ĐÓNG MODAL HÓA ĐƠN ========== */
function moModalHoaDon() {
  currentInvoiceId = null;
  const titleEl = document.getElementById("invoiceModalTitle");
  if (titleEl) titleEl.textContent = "Thêm Hóa Đơn Mới";

  const maHDInput = document.getElementById("maHD");
  if (maHDInput) maHDInput.value = "";

  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  document.getElementById("ngayTao").value = `${yyyy}-${mm}-${dd}`;

  document.getElementById("dsSanPham").innerHTML = "";
  currentItems = [];
  currentDiscountType  = null;
  currentDiscountValue = 0;
  capNhatTongTien();

  const customerInput = document.getElementById("customerSelect");
  const customerSuggest = document.getElementById("customerSuggest");
  if (customerInput) customerInput.value = "";
  if (customerSuggest) {
    customerSuggest.innerHTML = "";
    customerSuggest.style.display = "none";
  }
  currentCustomerId = null;

  if (voucherModal) {
    const codeInput = document.getElementById("txtVoucherManual");
    if (codeInput) codeInput.value = "";
    document
      .querySelectorAll('input[name="voucher"]')
      .forEach(r => (r.checked = false));
  }

  if (invoiceModal) invoiceModal.show();
}

function moModalSanPham() {
  if (productModal) productModal.show();
}

function moModalVoucher() {
  if (voucherModal) voucherModal.show();
}

/* ========== THÊM SẢN PHẨM VÀO HÓA ĐƠN ========== */
function themSanPhamVaoHoaDon() {
  const checked = document.querySelectorAll(".chonSP:checked");
  checked.forEach(cb => {
    const id    = Number(cb.value);
    const name  = cb.dataset.name;
    const price = Number(cb.dataset.price);
    let existed = currentItems.find(it => it.idsanpham === id);
    if (existed) {
      existed.soluong += 1;
      existed.thanhtien = existed.soluong * existed.dongia;
    } else {
      currentItems.push({
        idsanpham: id,
        tensanpham: name,
        soluong: 1,
        dongia: price,
        thanhtien: price
      });
    }
  });
  renderItems();
  capNhatTongTien();
  if (productModal) productModal.hide();
}

/* ========== VOUCHER ========== */
function apDungVoucherManual() {
  const input = document.getElementById("txtVoucherManual");
  const code  = (input ? input.value : "").trim().toUpperCase();
  if (!code) return;

  let promo =
    allPromotions.find(
      p => (p.tenkhuyenmai || "").toUpperCase() === code
    ) ||
    allPromotions.find(p => ("VOU" + p.idkhuyenmai) === code) ||
    allPromotions.find(p => ("VC" + p.idkhuyenmai) === code);

  if (!promo) {
    showAlertInvoice("Mã voucher không hợp lệ");
    return;
  }

  const loai = (promo.loai || "").toLowerCase();
  currentDiscountType  = loai === "percent" ? "percent" : "fixed";
  currentDiscountValue = Number(promo.mucgiamgia || 0);

  capNhatTongTien();
  if (voucherModal) voucherModal.hide();
}

function apDungVoucher() {
  const code = (document.getElementById("txtVoucherManual")?.value || "")
    .trim()
    .toUpperCase();

  if (code) {
    apDungVoucherManual();
    return;
  }

  const selected = document.querySelector('input[name="voucher"]:checked');
  if (!selected) {
    if (voucherModal) voucherModal.hide();
    return;
  }

  const type = selected.dataset.type;
  const val  = Number(selected.dataset.value || 0);

  currentDiscountType  = type;
  currentDiscountValue = val;

  capNhatTongTien();
  if (voucherModal) voucherModal.hide();
}

/* ========== LƯU HÓA ĐƠN ========== */
async function luuHoaDon() {
  const customerId = Number(currentCustomerId || 0);
  const ngay = document.getElementById("ngayTao").value;

  if (!customerId) {
    showAlertInvoice("Vui lòng chọn khách hàng");
    return;
  }
  if (!ngay) {
    showAlertInvoice("Vui lòng chọn ngày giao dịch");
    return;
  }
  if (!currentItems.length) {
    showAlertInvoice("Vui lòng chọn ít nhất 1 sản phẩm");
    return;
  }

  let giaGoc = 0;
  currentItems.forEach(it => (giaGoc += it.thanhtien));

  let giamGia = 0;
  if (currentDiscountType === "percent") {
    giamGia = Math.floor((giaGoc * currentDiscountValue) / 100);
  } else if (currentDiscountType === "fixed") {
    giamGia = currentDiscountValue;
  }
  if (giamGia > giaGoc) giamGia = giaGoc;
  const tong = giaGoc - giamGia;

  const payload = {
    idhoadon: currentInvoiceId,
    idkhachhang: customerId,
    idnhanvien: currentUser.idnhanvien ?? currentUser.id ?? null,
    ngaygiaodich: ngay,
    tongthanhtoan: tong,
    chitiet: currentItems.map(it => ({
      idsanpham: it.idsanpham,
      soluong: it.soluong,
      dongia: it.dongia,
      thanhtien: it.thanhtien,
      ghichu: ""
    }))
  };

  try {
    const res = await fetch(
      INVOICE_API + (currentInvoiceId ? "/" + currentInvoiceId : ""),
      {
        method: currentInvoiceId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      }
    );

    if (!res.ok) {
      const msg = await getErrorMessage(res, "Lưu hóa đơn thất bại");
      showAlertInvoice(msg);
      return;
    }

    await loadInvoices();

    if (invoiceModal) invoiceModal.hide();
    showAlertInvoice("Lưu hóa đơn thành công!", "success");
  } catch (e) {
    console.error(e);
    showAlertInvoice("Không thể kết nối server");
  }
}

async function xemChiTietHoaDonById(id) {
  try {
    const res = await fetch(INVOICE_API + "/" + id);
    if (!res.ok) {
      showAlertInvoice("Không tải được chi tiết hóa đơn");
      return;
    }
    const data = await res.json();

    document.getElementById("modal-maHD").textContent  = "#HD" + data.idhoadon;
    document.getElementById("modal-ngay").textContent  = data.ngaygiaodich || "";
    document.getElementById("modal-khach").textContent = data.tenkhachhang || "";
    document.getElementById("modal-sdt").textContent   = data.sodienthoai || "";

    let staffId =
      data.idnhanvien ||
      (data.nhanvien && data.nhanvien.idnhanvien) ||
      null;

    let tenNV =
      data.tennhanvien ||
      (data.nhanvien && (data.nhanvien.hoten || data.nhanvien.tennhanvien)) ||
      "";

    if (!tenNV && staffId && staffMap[staffId]) {
      tenNV = staffMap[staffId];
    }

    document.getElementById("modal-nv").textContent = tenNV || "Không xác định";

    const tbody = document.getElementById("modal-sanpham");
    tbody.innerHTML = "";
    let giaGoc = 0;

    if (data.chitiet && data.chitiet.length) {
      data.chitiet.forEach(ct => {
        const thanhTien = Number(ct.thanhtien || 0);
        giaGoc += thanhTien;

        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${ct.tensanpham || "SP#" + ct.idsanpham}</td>
          <td class="text-center">${ct.soluong}</td>
          <td class="text-end">${dinhDangTien(ct.dongia)}đ</td>
          <td class="text-end fw-bold">${dinhDangTien(thanhTien)}đ</td>
        `;
        tbody.appendChild(tr);
      });
    }

    let tong = Number(data.tongthanhtoan || 0);

    if (typeof data.giagoc === "number") {
      giaGoc = data.giagoc;
    }

    let giamGia;
    if (typeof data.giamgia === "number") {
      giamGia = data.giamgia;
    } else {
      giamGia = giaGoc - tong;
      if (giamGia < 0) giamGia = 0;
    }

    const voucherCode =
      data.voucherCode || (giamGia > 0 ? "Voucher" : "không áp dụng");

    document.getElementById("modal-giaGoc").textContent      = dinhDangTien(giaGoc);
    document.getElementById("modal-giamGia").textContent     = dinhDangTien(giamGia);
    document.getElementById("modal-voucherCode").textContent = voucherCode;
    document.getElementById("modal-tong").textContent        =
      dinhDangTien(tong) + "đ";

    if (invoiceDetailModal) invoiceDetailModal.show();
  } catch (e) {
    console.error(e);
    showAlertInvoice("Không thể kết nối server");
  }
}

/* ========== LOAD DATA ========== */
async function loadProducts() {
  try {
    const res = await fetch(PRODUCT_API);
    if (!res.ok) return;
    const data = await res.json();
    allProducts = data || [];
    const tbody = document.getElementById("danhSachSanPham");
    tbody.innerHTML = "";
    allProducts.forEach(p => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>
          <input type="checkbox" class="chonSP" value="${p.idsanpham}"
                 data-name="${p.tensanpham}" data-price="${p.giaban}">
        </td>
        <td><img src="${p.anh || p.hinhanhsanpham || ""}" class="product-img"></td>
        <td>${p.tensanpham}</td>
        <td class="text-danger fw-bold">${dinhDangTien(p.giaban)}</td>
      `;
      tbody.appendChild(tr);
    });
  } catch (e) {
    console.error(e);
  }
}

async function loadCustomers() {
  try {
    const res = await fetch(CUSTOMER_API);
    if (!res.ok) return;
    const data = await res.json();
    allCustomers = data || [];
  } catch (e) {
    console.error(e);
  }
}

async function loadPromotions() {
  try {
    const res = await fetch(PROMOTION_API);
    if (!res.ok) return;
    const data = await res.json();
    allPromotions = data || [];
    renderPromotions();
  } catch (e) {
    console.error(e);
  }
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
  } catch (e) {
    console.error(e);
  }
}

function renderPromotions() {
  const box = document.querySelector(".voucher-list");
  if (!box) return;

  box.innerHTML = `
    <label class="form-label mb-2">Chọn từ danh sách:</label>
  `;

  allPromotions.forEach(p => {
    const loai = (p.loai || "").toLowerCase();
    const type = loai === "percent" ? "percent" : "fixed";
    const val  = Number(p.mucgiamgia || 0);
    const min  = Number(p.dontoithieu || 0);

    const div = document.createElement("div");
    div.className = "voucher-card";
    div.innerHTML = `
      <input type="radio" name="voucher"
             value="${p.idkhuyenmai}"
             data-type="${type}"
             data-value="${val}">
      <label>
        <div class="title">${p.tenkhuyenmai || "Khuyến mãi #" + p.idkhuyenmai}</div>
        <div class="desc">Cho đơn từ ${dinhDangTien(min)}đ</div>
      </label>
    `;
    box.appendChild(div);
  });
}

/* ========== AUTOCOMPLETE KHÁCH HÀNG ========== */
function setupCustomerAutocomplete() {
  const input   = document.getElementById("customerSelect");
  const suggest = document.getElementById("customerSuggest");
  if (!input || !suggest) return;

  input.addEventListener("input", () => {
    const keyword = input.value.trim().toLowerCase();
    currentCustomerId = null;

    if (!keyword) {
      suggest.innerHTML = "";
      suggest.style.display = "none";
      return;
    }

    const filtered = allCustomers
      .filter(c => {
        const name  = (c.hoten || c.tenkhachhang || "").toLowerCase();
        const phone = (c.sodienthoai || "").toLowerCase();
        const idStr = String(c.idkhachhang || "").toLowerCase();
        return (
          name.includes(keyword) ||
          phone.includes(keyword) ||
          idStr.includes(keyword)
        );
      })
      .slice(0, 10);

    suggest.innerHTML = "";

    if (!filtered.length) {
      suggest.style.display = "none";
      return;
    }

    filtered.forEach(c => {
      const li   = document.createElement("li");
      const name = c.hoten || c.tenkhachhang || ("KH#" + c.idkhachhang);
      const phone = c.sodienthoai ? ` - ${c.sodienthoai}` : "";

      li.className = "list-group-item list-group-item-action";
      li.textContent = `#${c.idkhachhang} - ${name}${phone}`;

      li.addEventListener("click", () => {
        selectCustomer(c, input, suggest);
      });

      suggest.appendChild(li);
    });

    suggest.style.display = "block";
  });

  document.addEventListener("click", (e) => {
    if (!suggest.contains(e.target) && e.target !== input) {
      suggest.style.display = "none";
    }
  });
}

function selectCustomer(c, input, suggest) {
  const name  = c.hoten || c.tenkhachhang || ("KH#" + c.idkhachhang);
  const phone = c.sodienthoai ? ` - ${c.sodienthoai}` : "";

  input.value = `#${c.idkhachhang} - ${name}${phone}`;
  currentCustomerId = c.idkhachhang;

  suggest.style.display = "none";
}

/* ========== RENDER + FILTER HÓA ĐƠN ========== */
function trangThaiLabel(trangthai) {
  if (trangthai === null || trangthai === undefined || trangthai === "") {
    return '<span class="badge bg-success">Đã thanh toán</span>';
  }
  if (trangthai === "PAID" || trangthai === 1 || trangthai === true) {
    return '<span class="badge bg-success">Đã thanh toán</span>';
  }
  if (trangthai === "PENDING" || trangthai === 0 || trangthai === false) {
    return '<span class="badge bg-warning text-dark">Chờ thanh toán</span>';
  }
  return '<span class="badge bg-secondary">Khác</span>';
}

function renderInvoices(list) {
  const tbody = document.getElementById("invoiceBody");
  tbody.innerHTML = "";
  list.forEach(hd => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td class="ps-4 fw-medium">#HD${hd.idhoadon}</td>
      <td>${hd.ngaygiaodich || ""}</td>
      <td>${hd.tenkhachhang || ""}</td>
      <td>${hd.soluongSanPham || 0}</td>
      <td class="fw-bold text-winmart">${dinhDangTien(hd.tongthanhtoan)}đ</td>
      <td>${trangThaiLabel(hd.trangthai)}</td>
      <td class="text-center">
        <button class="btn btn-view btn-sm" data-id="${hd.idhoadon}">
          <i class="bi bi-eye"></i> Xem
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  tbody.querySelectorAll("button[data-id]").forEach(btn => {
    btn.addEventListener("click", function () {
      const id = Number(this.dataset.id);
      xemChiTietHoaDonById(id);
    });
  });
}

async function loadInvoices() {
  try {
    const res = await fetch(INVOICE_API);
    if (!res.ok) return;
    const data = await res.json();
    allInvoices = data || [];
    renderInvoices(allInvoices);
  } catch (e) {
    console.error(e);
  }
}

function applyFilter() {
  const ma   = document.getElementById("filterMaHD").value.trim().toLowerCase();
  const ngay = document.getElementById("filterNgay").value;
  const tt   = document.getElementById("filterTrangThai").value;

  const filtered = allInvoices.filter(hd => {
    let ok = true;
    if (ma) {
      ok = ok && `#HD${hd.idhoadon}`.toLowerCase().includes(ma);
    }
    if (ngay) {
      ok = ok && hd.ngaygiaodich === ngay;
    }
    if (tt) {
      ok = ok && (hd.trangthai === tt || String(hd.trangthai) === tt);
    }
    return ok;
  });

  renderInvoices(filtered);
}

/* ========== INIT ========== */
document.addEventListener("DOMContentLoaded", () => {
  const user = JSON.parse(localStorage.getItem("user"));
  if (!user) {
    window.location.replace("/login");
    return;
  }

  if (user.vaitro !== "admin") {
    window.location.replace("/staff");
    return;
  }
  currentUser = user;

  const welcomeUser = document.getElementById("welcomeUser");
  if (welcomeUser) {
    welcomeUser.textContent = `Xin chào, ${user.hoten ?? user.tendangnhap}`;
  }
  const adminFooterName = document.getElementById("adminFooterName");
  if (adminFooterName) {
    adminFooterName.textContent = user.hoten ?? user.tendangnhap;
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

  const invoiceEditEl   = document.getElementById("invoiceEditModal");
  const productSelectEl = document.getElementById("productSelectModal");
  const voucherEl       = document.getElementById("voucherModal");
  const detailEl        = document.getElementById("invoiceDetailModal");

  if (invoiceEditEl)   invoiceModal       = new bootstrap.Modal(invoiceEditEl);
  if (productSelectEl) productModal       = new bootstrap.Modal(productSelectEl);
  if (voucherEl)       voucherModal       = new bootstrap.Modal(voucherEl);
  if (detailEl)        invoiceDetailModal = new bootstrap.Modal(detailEl);

  const timSanPhamInput = document.getElementById("timSanPham");
  if (timSanPhamInput) {
    timSanPhamInput.addEventListener("input", function () {
      const keyword = this.value.toLowerCase().trim();
      const tbody   = document.getElementById("danhSachSanPham");
      tbody.querySelectorAll("tr").forEach(tr => {
        const name = tr.children[2].textContent.toLowerCase();
        tr.style.display = name.includes(keyword) ? "" : "none";
      });
    });
  }

  const filterMaHD      = document.getElementById("filterMaHD");
  const filterNgay      = document.getElementById("filterNgay");
  const filterTrangThai = document.getElementById("filterTrangThai");

  if (filterMaHD)      filterMaHD.addEventListener("input",  applyFilter);
  if (filterNgay)      filterNgay.addEventListener("change", applyFilter);
  if (filterTrangThai) filterTrangThai.addEventListener("change", applyFilter);

  setupCustomerAutocomplete();

  (async () => {
    await loadInvoices();
    await loadProducts();
    await loadCustomers();
    await loadPromotions();
    await loadStaffs();
  })();
});

function printCurrentInvoice() {
  const modal = document.getElementById("invoiceDetailModal");
  if (!modal) return;

  const maHDText = document.getElementById("modal-maHD")?.textContent || "";

  const contentHtml = modal.querySelector(".modal-content").innerHTML;

  const win = window.open("", "_blank", "width=900,height=700");
  win.document.write(`
    <!DOCTYPE html>
    <html lang="vi">
    <head>
      <meta charset="UTF-8">
      <title>In hóa đơn ${maHDText}</title>
      <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
      <style>
        body { margin: 20px; font-family: system-ui, -apple-system, sans-serif; }
        .modal-footer { display: none !important; }
      </style>
    </head>
    <body>
      ${contentHtml}
    </body>
    </html>
  `);
  win.document.close();
  win.focus();
  win.print();
}
