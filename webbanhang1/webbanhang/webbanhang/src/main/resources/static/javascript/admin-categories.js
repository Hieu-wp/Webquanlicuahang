document.addEventListener("DOMContentLoaded", () => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) return window.location.replace("/login");
    if (user.vaitro !== "admin") return window.location.replace("/staff");

    document.getElementById("welcomeUser").textContent =
        `Xin chào, ${user.hoten ?? user.tendangnhap}`;

    document.getElementById("logoutBtn").addEventListener("click", async () => {
        await fetch("/api/auth/logout", { method: "POST" });
        localStorage.removeItem("user");
        window.location.replace("/login");
    });

    window.closeAlertCategory = () =>
        document.getElementById("alertBoxCategory").classList.remove("show");

    function showAlertCategory(message, type = "error") {
        const modal = document.getElementById("alertBoxCategory");
        document.getElementById("alertMessageCategory").textContent = message;
        const icon = document.getElementById("alertIconCategory");
        icon.textContent = type === "success" ? "✔" : "✖";
        icon.style.color = type === "success" ? "green" : "red";
        modal.classList.add("show");
    }

    const categoryForm        = document.getElementById("categoryForm");
    const categoryId          = document.getElementById("categoryId");
    const categoryName        = document.getElementById("categoryName");
    const categoryDescription = document.getElementById("categoryDescription");
    const categoryStatus      = document.getElementById("categoryStatus");
    const categoryModal       = document.getElementById("categoryModal");
    const modalTitle          = document.getElementById("categoryModalTitle");
    const btnSaveCategory     = document.getElementById("btnSaveCategory");

    const searchCategory  = document.getElementById("searchCategory");
    const statusFilter    = document.getElementById("statusFilter");
    const btnLockSelected = document.getElementById("btnLockSelected");
    const checkAll        = document.getElementById("checkAll");
    const tableBody       = document.getElementById("categoryTable");

    // ===== PHẦN MODAL THÔNG TIN DANH MỤC =====
    const detailMaDM   = document.getElementById("detailMaDM");
    const detailTenDM  = document.getElementById("detailTenDM");
    const detailMoTa   = document.getElementById("detailMoTa");
    const detailSoLuong = document.getElementById("detailSoLuong");
    const detailTrangThai = document.getElementById("detailTrangThai");
    const detailNgayTao = document.getElementById("detailNgayTao");
    const detailViewProductsLink = document.getElementById("detailViewProductsLink");

    let detailModalInstance = null;
    const detailModalEl = document.getElementById("categoryDetailModal");
    if (detailModalEl) {
        detailModalInstance = new bootstrap.Modal(detailModalEl);
    }

    let categoryList = [];

    function enableFormEdit() {
        if (!categoryForm) return;
        categoryForm.querySelectorAll("input, textarea, select").forEach(el => {
            el.removeAttribute("disabled");
        });
        if (btnSaveCategory) btnSaveCategory.style.display = "";
    }

    async function loadCategories() {
        try {
            const res = await fetch("/api/admin-categories");
            if (!res.ok) return showAlertCategory("Không thể tải danh mục!");
            categoryList = await res.json();
            applyFilterAndRender();
        } catch (e) {
            console.error(e);
            showAlertCategory("Không thể kết nối server!");
        }
    }

    function formatDate(d) {
        if (!d) return "";
        try {
            return new Date(d).toLocaleDateString("vi-VN");
        } catch {
            return d;
        }
    }

    function renderTable(data) {
        tableBody.innerHTML = "";
        data.forEach((c, index) => {
            const st = c.trangthai === 1 ? 1 : 0;
            const statusText  = st === 1 ? "Hiển thị" : "Đã khóa";
            const badgeClass  = st === 1 ? "badge-status-active" : "badge-status-locked";
            const btnLabel    = st === 1 ? "Khóa" : "Mở khóa";
            const btnIcon     = st === 1 ? "bi-lock-fill" : "bi-unlock-fill";
            const btnClass    = st === 1 ? "btn-danger" : "btn-success";
            const totalProducts = c.tongsanpham ?? 0;

            tableBody.innerHTML += `
                <tr>
                    <td style="width:40px;">
                        <input type="checkbox" class="form-check-input row-check"
                               data-id="${c.iddanhmuc}" data-status="${st}">
                    </td>
                    <td>${index + 1}</td>
                    <td class="text-center">${c.tendanhmuc ?? ""}</td>
                    <td>${totalProducts}</td>
                    <td>
                        <span class="badge ${badgeClass} px-3 py-1">${statusText}</span>
                    </td>
                    <td>${formatDate(c.ngaytao)}</td>
                    <td>
                        <button class="btn btn-info btn-sm me-1"
                                onclick="openCategoryDetail(${c.iddanhmuc})">
                            <i class="bi bi-eye"></i> Xem
                        </button>
                        <button class="btn btn-warning btn-sm me-1"
                                onclick="openUpdateCategory(${c.iddanhmuc})">
                            <i class="bi bi-pencil-square"></i> Sửa
                        </button>
                        <button class="btn ${btnClass} btn-sm toggleStatusCategory"
                                data-id="${c.iddanhmuc}">
                            <i class="bi ${btnIcon}"></i> ${btnLabel}
                        </button>
                    </td>
                </tr>
            `;
        });

        bindRowEvents();
        updateSelectedCount();
    }

    function applyFilterAndRender() {
        const keyword = (searchCategory.value || "").toLowerCase().trim();
        const stVal   = statusFilter.value;

        const filtered = categoryList.filter(c => {
            const name        = (c.tendanhmuc || "").toLowerCase();
            const matchName   = !keyword || name.includes(keyword);
            const st          = c.trangthai === 1 ? "1" : "0";
            const matchStatus = !stVal || stVal === st;
            return matchName && matchStatus;
        });

        if (checkAll) checkAll.checked = false;
        renderTable(filtered);
    }

    function updateSelectedCount() {
        const selected = document.querySelectorAll(".row-check:checked");
        btnLockSelected.textContent = `Khóa đã chọn (${selected.length})`;
    }

    function bindRowEvents() {
        document.querySelectorAll(".row-check").forEach(chk => {
            chk.addEventListener("change", updateSelectedCount);
        });

        document.querySelectorAll(".toggleStatusCategory").forEach(btn => {
            btn.addEventListener("click", async () => {
                const id = btn.dataset.id;
                try {
                    const res = await fetch(`/api/admin-categories/${id}/toggle`, {
                        method: "PUT"
                    });
                    if (!res.ok) return showAlertCategory("Cập nhật trạng thái thất bại!");
                    showAlertCategory("Cập nhật trạng thái thành công!", "success");
                    await loadCategories();
                } catch {
                    showAlertCategory("Không thể kết nối server!");
                }
            });
        });
    }

    checkAll.addEventListener("change", e => {
        const checked = e.target.checked;
        document.querySelectorAll(".row-check").forEach(chk => {
            chk.checked = checked;
        });
        updateSelectedCount();
    });

    btnLockSelected.addEventListener("click", async () => {
        const selected = Array.from(document.querySelectorAll(".row-check:checked"));
        if (selected.length === 0) {
            return showAlertCategory("Chưa chọn danh mục nào!");
        }

        try {
            await Promise.all(selected.map(chk => {
                if (chk.dataset.status !== "1") return Promise.resolve();
                const id = chk.dataset.id;
                return fetch(`/api/admin-categories/${id}/toggle`, {
                    method: "PUT"
                });
            }));
            showAlertCategory("Đã khóa các danh mục đã chọn!", "success");
            await loadCategories();
        } catch (e) {
            console.error(e);
            showAlertCategory("Không thể khóa danh mục!");
        }
    });

    // Thêm danh mục
    document.getElementById("btnAddCategory").onclick = () => {
        modalTitle.innerText = "Thêm danh mục";
        categoryForm.reset();
        categoryId.value     = "";
        categoryStatus.value = "1";
        enableFormEdit();
        new bootstrap.Modal(categoryModal).show();
    };

    // Sửa danh mục
    window.openUpdateCategory = async (id) => {
        let c = categoryList.find(x => x.iddanhmuc === id);
        if (!c) {
            const res = await fetch(`/api/admin-categories/${id}`);
            if (!res.ok) return showAlertCategory("Không tìm thấy danh mục!");
            c = await res.json();
        }

        categoryId.value          = c.iddanhmuc;
        categoryName.value        = c.tendanhmuc ?? "";
        categoryDescription.value = c.mota ?? "";
        categoryStatus.value      = c.trangthai === 0 ? "0" : "1";

        enableFormEdit();
        modalTitle.innerText = "Sửa danh mục";

        new bootstrap.Modal(categoryModal).show();
    };

    // Xem chi tiết danh mục
    window.openCategoryDetail = async (id) => {
        let c = categoryList.find(x => x.iddanhmuc === id);
        if (!c) {
            const res = await fetch(`/api/admin-categories/${id}`);
            if (!res.ok) return showAlertCategory("Không tìm thấy danh mục!");
            c = await res.json();
        }

        const code = "DM" + String(c.iddanhmuc).padStart(3, "0");
        const soLuong = c.tongsanpham ?? 0;
        const stText  = c.trangthai === 1 ? "Hiển thị" : "Đã khóa";

        if (detailMaDM)        detailMaDM.textContent        = code;
        if (detailTenDM)       detailTenDM.textContent       = c.tendanhmuc ?? "";
        if (detailMoTa)        detailMoTa.textContent        = c.mota ?? "Không có";
        if (detailSoLuong)     detailSoLuong.textContent     = soLuong;
        if (detailTrangThai)   detailTrangThai.textContent   = stText;
        if (detailNgayTao)     detailNgayTao.textContent     = formatDate(c.ngaytao);
        if (detailViewProductsLink) {
            detailViewProductsLink.href = `/adminproducts?categoryId=${c.iddanhmuc}`;
        }

        if (detailModalInstance) detailModalInstance.show();
    };

    // Lưu danh mục
    btnSaveCategory.addEventListener("click", async () => {
        const name = categoryName.value.trim();
        if (!name) return showAlertCategory("Tên danh mục không được trống!");

        const dto = {
            tendanhmuc: name,
            mota: categoryDescription.value.trim(),
            trangthai: Number(categoryStatus.value) || 1
        };

        const id = categoryId.value;
        const url = id
            ? `/api/admin-categories/${id}`
            : "/api/admin-categories";

        const method = id ? "PUT" : "POST";

        try {
            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(dto)
            });

            if (!res.ok) {
                console.error(await res.text());
                return showAlertCategory("Lưu danh mục thất bại!");
            }

            showAlertCategory(
                id ? "Cập nhật danh mục thành công!" : "Thêm danh mục thành công!",
                "success"
            );

            bootstrap.Modal.getInstance(categoryModal).hide();
            await loadCategories();

        } catch (e) {
            console.error(e);
            showAlertCategory("Không thể kết nối server!");
        }
    });

    if (searchCategory) {
        searchCategory.addEventListener("input", applyFilterAndRender);
    }
    if (statusFilter) {
        statusFilter.addEventListener("change", applyFilterAndRender);
    }

    loadCategories();
});
