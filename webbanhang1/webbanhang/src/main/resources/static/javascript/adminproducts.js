// javascript/adminproducts.js

document.addEventListener("DOMContentLoaded", () => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) return window.location.replace("/login");
    if (user.vaitro !== "admin") return window.location.replace("/staff");
    
    // Hiển thị tên ở navbar
    const welcomeEl = document.getElementById("welcomeUser");
    if (welcomeEl) {
        welcomeEl.textContent = `Xin chào, ${user.hoten ?? user.tendangnhap}`;
    }

    // Logout
    document.getElementById("logoutBtn").addEventListener("click", async () => {
        await fetch("/api/auth/logout", { method: "POST" });
        localStorage.removeItem("user");
        window.location.replace("/login");
    });

    // ===== ALERT =====
    window.closeAlertProduct = () =>
        document.getElementById("alertBoxProduct").classList.remove("show");

    function showAlertProduct(message, type = "error") {
        const modal = document.getElementById("alertBoxProduct");
        const msg   = document.getElementById("alertMessageProduct");
        const icon  = document.getElementById("alertIconProduct");
        if (!modal || !msg || !icon) {
            alert(message);
            return;
        }
        msg.textContent = message;
        icon.textContent = type === "success" ? "✔" : "✖";
        icon.style.color = type === "success" ? "green" : "red";
        modal.classList.add("show");
    }

    // ===== DOM =====
    const productForm        = document.getElementById("productForm");
    const productId          = document.getElementById("productId");
    const productName        = document.getElementById("productName");
    const productCategory    = document.getElementById("productCategory");
    const productPrice       = document.getElementById("productPrice");
    const productQuantity    = document.getElementById("productQuantity");
    const productDescription = document.getElementById("productDescription");
    const productImage       = document.getElementById("productImage");
    const imagePreview       = document.getElementById("imagePreview");
    const promotionSelect    = document.getElementById("productPromotion");
    const productModal       = document.getElementById("productModal");
    const modalTitle         = document.getElementById("modalTitle");
    const btnSaveProduct     = document.getElementById("btnSaveProduct");

    const filterCategory = document.getElementById("filterCategory");
    const filterPrice    = document.getElementById("filterPrice");
    const btnFilter      = document.getElementById("btnFilter");

    const checkAll        = document.getElementById("checkAll");
    const btnLockSelected = document.getElementById("btnLockSelected");

    // Confirm box cho khóa hàng loạt
    const confirmBox           = document.getElementById("confirmDeleteBox");
    const confirmDeleteOK      = document.getElementById("confirmDeleteOK");
    const confirmDeleteCancel  = document.getElementById("confirmDeleteCancel");
    const confirmDeleteMessage = document.getElementById("confirmDeleteMessage");
    let onConfirmCallback = null;

    let productList   = [];
    let categoryList  = [];
    let promotionList = []; // danh sách KM active

    // ===== Confirm helpers =====
    function openConfirm(message, onOk) {
        if (!confirmBox) {
            if (window.confirm(message)) onOk && onOk();
            return;
        }
        confirmDeleteMessage.textContent = message;
        onConfirmCallback = onOk;
        confirmBox.classList.add("show");
    }

    function closeConfirm() {
        if (!confirmBox) return;
        confirmBox.classList.remove("show");
        onConfirmCallback = null;
    }

    if (confirmDeleteCancel) {
        confirmDeleteCancel.onclick = () => closeConfirm();
    }
    if (confirmDeleteOK) {
        confirmDeleteOK.onclick = async () => {
            if (onConfirmCallback) {
                await onConfirmCallback();
            }
            closeConfirm();
        };
    }

    // ==================== LOAD DANH MỤC ====================
    async function loadCategories() {
        if (!filterCategory && !productCategory) return;

        try {
            const res = await fetch("/api/admin-categories");
            if (!res.ok) {
                console.error("Không thể load danh mục, status:", res.status);
                return;
            }

            categoryList = await res.json();
            console.log("categories:", categoryList);

            // Filter: dùng ID danh mục
            if (filterCategory) {
                filterCategory.innerHTML = `<option value="">Tất cả</option>`;
                categoryList
                    .filter(c => c.trangthai === 1 || c.trangthai == null)
                    .forEach(c => {
                        const opt = document.createElement("option");
                        opt.value = c.iddanhmuc;
                        opt.textContent = c.tendanhmuc;
                        filterCategory.appendChild(opt);
                    });
            }

            // Trong modal
            if (productCategory) {
                productCategory.innerHTML = `<option value="">-- Chọn danh mục --</option>`;
                categoryList
                    .filter(c => c.trangthai === 1 || c.trangthai == null)
                    .forEach(c => {
                        const opt = document.createElement("option");
                        opt.value = c.iddanhmuc;
                        opt.textContent = c.tendanhmuc;
                        productCategory.appendChild(opt);
                    });
            }
        } catch (e) {
            console.error("Lỗi load danh mục:", e);
        }
    }

    function getCategoryNameById(id) {
        if (id == null) return "";
        const numericId = Number(id);
        const cat = categoryList.find(c => Number(c.iddanhmuc) === numericId);
        return cat ? cat.tendanhmuc : "";
    }

    // ==================== LOAD KHUYẾN MÃI (ADMIN) ====================
    async function loadPromotions() {
        if (!promotionSelect) return;
        try {
            const res = await fetch("/api/admin-promotion-manager/active");
            if (!res.ok) return;

            promotionList = await res.json();
            // Lúc init chưa có product/danhmục cụ thể -> truyền luôn value hiện tại (thường rỗng)
            refreshPromotionOptions(
                productCategory ? productCategory.value : null,
                productId.value || null,
                promotionSelect ? promotionSelect.value : null
            );
        } catch (e) {
            console.error(e);
        }
    }

    // 1 khuyến mãi có áp dụng cho sản phẩm này không?
    function isPromotionApplicable(pm, productIdVal, categoryIdVal) {
        const pid = productIdVal  != null && productIdVal !== ""  ? Number(productIdVal)  : null;
        const cid = categoryIdVal != null && categoryIdVal !== "" ? Number(categoryIdVal) : null;

        const catIds  = Array.isArray(pm.categoryIds) ? pm.categoryIds.map(Number) : [];
        // const prodIds = Array.isArray(pm.productIds)  ? pm.productIds.map(Number)  : [];

        switch (pm.apdungcho) {
            case "all":
                // Toàn cửa hàng -> sp nào cũng chọn được
                return true;
            case "category":
                // Chỉ cho sp thuộc 1 trong các danh mục
                if (!cid) return false;
                return catIds.includes(cid);
            case "product":
                // Khuyến mãi theo sản phẩm -> cho phép chọn cho bất kỳ sp
                // (productIds chỉ để hiển thị, không chặn)
                return true;
            default:
                return false;
        }
    }

    // Render lại combobox khuyến mãi theo danh mục + sản phẩm hiện tại
    function refreshPromotionOptions(currentCategoryId, currentProductId, keepPromotionId = null) {
        if (!promotionSelect) return;

        promotionSelect.innerHTML = '<option value="">-- Không áp dụng --</option>';

        // 1. Lọc KM phù hợp
        const applicable = promotionList.filter(pm =>
            isPromotionApplicable(pm, currentProductId, currentCategoryId)
        );

        // 2. Giữ lại KM đang gắn (nếu có) dù không match filter
        if (keepPromotionId != null && keepPromotionId !== "") {
            const keepIdNum = Number(keepPromotionId);
            const existInApplicable = applicable.some(pm => Number(pm.idkhuyenmai) === keepIdNum);

            if (!existInApplicable) {
                const pm = promotionList.find(x => Number(x.idkhuyenmai) === keepIdNum);
                if (pm) {
                    applicable.push(pm);
                }
            }
        }

        // 3. Render option
        applicable.forEach(pm => {
            const opt = document.createElement("option");
            opt.value = pm.idkhuyenmai;

            let label = pm.tenkhuyenmai || `KM #${pm.idkhuyenmai}`;
            if (pm.loai === "percent") {
                label += ` (-${pm.mucgiamgia}% )`;
            } else if (pm.loai === "fixed") {
                label += ` (-${Number(pm.mucgiamgia || 0).toLocaleString()}₫)`;
            }
            opt.textContent = label;
            promotionSelect.appendChild(opt);
        });
    }

    // khi đổi danh mục trong modal -> lọc lại KM nhưng vẫn giữ KM đang chọn
    if (productCategory) {
        productCategory.addEventListener("change", () => {
            const catVal    = productCategory.value;
            const prodIdVal = productId.value;
            const keepPromo = promotionSelect ? promotionSelect.value : null;

            refreshPromotionOptions(catVal, prodIdVal || null, keepPromo);
        });
    }

    // ==================== LOAD SẢN PHẨM ====================
    async function loadProducts() {
        try {
            const res = await fetch("/api/adminproducts");
            if (!res.ok) return showAlertProduct("Không thể tải sản phẩm!");
            productList = await res.json();
            renderTable(productList);
        } catch (e) {
            console.error(e);
            showAlertProduct("Không thể kết nối server!");
        }
    }

function renderTable(data) {
    const tbody = document.getElementById("productTable");
    tbody.innerHTML = "";
    data.forEach(p => {
        const statusText = p.trangthai === 1 ? "Đang bán" : "Đã khóa";
        const btnLabel   = p.trangthai === 1 ? "Khóa" : "Mở khóa";
        const btnIcon    = p.trangthai === 1 ? "bi-lock-fill" : "bi-unlock-fill";
        const btnClass   = p.trangthai === 1 ? "btn-danger" : "btn-success";

        const original   = Number(p.giaban || 0);
        const finalPrice = p.giasaukhuyenmai != null ? Number(p.giasaukhuyenmai) : original;

        let priceHtml;
        if (finalPrice < original) {
            priceHtml = `
                <span class="text-muted text-decoration-line-through me-1">
                    ${original.toLocaleString()}₫
                </span>
                <span class="text-danger fw-bold">
                    ${finalPrice.toLocaleString()}₫
                </span>
            `;
        } else {
            priceHtml = `${original.toLocaleString()}₫`;
        }

        const categoryName = getCategoryNameById(p.iddanhmuc);

        // mô tả (có thể rút gọn cho đẹp)
        const desc = p.mota
            ? (p.mota.length > 60 ? p.mota.substring(0, 60) + "..." : p.mota)
            : "";

        tbody.innerHTML += `
            <tr>
                <td class="text-center">
                    <input type="checkbox"
                           class="product-check"
                           data-id="${p.idsanpham}">
                </td>
                <td>${p.idsanpham}</td>
                <td><img src="${p.hinhanhsanpham || ""}" class="product-img"></td>
                <td>${p.tensanpham}</td>
                <td>${categoryName}</td>
                <td>${priceHtml}</td>
                <td>${p.soluong}</td>
                <td>${statusText}</td>
                <td class="text-start">${desc}</td>   <!-- ✅ CỘT MÔ TẢ -->
                <td>
                    <button class="btn btn-info btn-sm me-1"
                            onclick="openViewProduct(${p.idsanpham})">
                        <i class="bi bi-eye"></i> Xem
                    </button>
                    <button class="btn btn-warning btn-sm me-1"
                            onclick="openUpdate(${p.idsanpham})">
                        Sửa
                    </button>
                    <button class="btn ${btnClass} btn-sm toggleStatus"
                            data-id="${p.idsanpham}">
                        <i class="bi ${btnIcon}"></i> ${btnLabel}
                    </button>
                </td>
            </tr>
        `;
    });

    bindStatusButtons();
    bindRowCheckboxes();
}

    // ==================== FILTER ====================
    btnFilter.onclick = () => {
        const catId = filterCategory.value;
        const price = filterPrice.value;
        let min = 0, max = 999999999;

        if (price) {
            const [a, b] = price.split("-");
            min = Number(a);
            max = Number(b);
        }

        const filtered = productList.filter(p => {
            const matchCat = !catId || Number(p.iddanhmuc) === Number(catId);
            const base = Number(p.giaban || 0);
            const finalPrice = p.giasaukhuyenmai != null ? Number(p.giasaukhuyenmai) : base;
            const matchPrice = finalPrice >= min && finalPrice <= max;
            return matchCat && matchPrice;
        });

        renderTable(filtered);
    };

    // ==================== ẢNH ====================
    imagePreview.onclick = () => productImage.click();

    productImage.addEventListener("change", e => {
        const f = e.target.files[0];
        if (!f) return;
        if (!f.type.startsWith("image/")) return showAlertProduct("File phải là ảnh!");
        const reader = new FileReader();
        reader.onload = () =>
            (imagePreview.innerHTML = `<img src="${reader.result}">`);
        reader.readAsDataURL(f);
    });

    // ===== Helpers bật / tắt chế độ edit cho form =====
    function enableFormEdit() {
        if (!productForm) return;
        productForm.querySelectorAll("input, textarea, select").forEach(el => {
            el.removeAttribute("disabled");
        });
        if (btnSaveProduct) {
            btnSaveProduct.style.display = "";
        }
    }

    function disableFormEdit() {
        if (!productForm) return;
        productForm.querySelectorAll("input, textarea, select").forEach(el => {
            el.setAttribute("disabled", "disabled");
        });
        if (btnSaveProduct) {
            btnSaveProduct.style.display = "none";
        }
    }

    // ==================== THÊM MỚI ====================
    document.getElementById("btnAddProduct").onclick = () => {
        modalTitle.innerText = "Thêm sản phẩm";
        productForm.reset();
        productId.value = "";
        imagePreview.innerHTML = `<span id="plusSign">+</span>`;
        if (promotionSelect) promotionSelect.value = "";
        if (productCategory) productCategory.value = "";

        // bật chế độ edit cho form
        enableFormEdit();

        // render KM cho danh mục hiện tại (chưa chọn thì truyền null)
        refreshPromotionOptions(productCategory ? productCategory.value : null, null, null);

        new bootstrap.Modal(productModal).show();
    };

    // ==================== LƯU SẢN PHẨM ====================
    btnSaveProduct.onclick = async () => {
        const img = document.querySelector("#imagePreview img")?.src || null;

        const name          = productName.value.trim();
        const categoryValue = productCategory.value;

        if (!name) return showAlertProduct("Tên không được trống!");
        if (categoryValue === "") {
            return showAlertProduct("Danh mục không được trống!");
        }

        const categoryId = parseInt(categoryValue, 10);
        if (isNaN(categoryId)) {
            return showAlertProduct("ID danh mục không hợp lệ!");
        }

        const price    = Number(productPrice.value);
        const quantity = Number(productQuantity.value);

        if (!price || price <= 0) return showAlertProduct("Giá không hợp lệ!");
        if (isNaN(quantity) || quantity < 0) return showAlertProduct("Số lượng không hợp lệ!");
        if (!img) return showAlertProduct("Hãy chọn hình!");

        const dto = {
            tensanpham: name,
            soluong: quantity,
            giaban: price,
            iddanhmuc: categoryId,
            mota: productDescription.value.trim(),
            hinhanhsanpham: img,
            trangthai: 1,
            idkhuyenmai: promotionSelect && promotionSelect.value
                ? Number(promotionSelect.value)
                : null
        };

        const id = productId.value;
        const url = id ? `/api/adminproducts/${id}` : `/api/adminproducts`;
        const method = id ? "PUT" : "POST";

        const res = await fetch(url, {
            method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(dto)
        });

        let data = null;
        try {
            data = await res.json();
        } catch {}

        if (!res.ok) {
            const msg = data?.message || "Lưu thất bại!";
            return showAlertProduct(msg);
        }

        showAlertProduct(
            id ? "Cập nhật sản phẩm thành công!" : "Thêm sản phẩm thành công!",
            "success"
        );

        bootstrap.Modal.getInstance(productModal).hide();
        await loadProducts();
    };

    // ==================== SỬA SẢN PHẨM ====================
    window.openUpdate = async (id) => {
        const res = await fetch(`/api/adminproducts/${id}`);
        if (!res.ok) return showAlertProduct("Không tìm thấy sản phẩm!");
        const p = await res.json();

        // bật chế độ edit
        enableFormEdit();

        productId.value          = p.idsanpham;
        productName.value        = p.tensanpham;
        productQuantity.value    = p.soluong;
        productPrice.value       = p.giaban;
        productDescription.value = p.mota ?? "";

        if (productCategory) {
            if (p.iddanhmuc != null) {
                productCategory.value = String(p.iddanhmuc);
            } else {
                productCategory.value = "";
            }
        }

        imagePreview.innerHTML = p.hinhanhsanpham
            ? `<img src="${p.hinhanhsanpham}">`
            : `<span id="plusSign">+</span>`;

        // Lọc KM đúng với SP đang sửa, nhưng vẫn giữ KM hiện tại
        refreshPromotionOptions(p.iddanhmuc, p.idsanpham, p.idkhuyenmai ?? null);

        if (promotionSelect) {
            promotionSelect.value = p.idkhuyenmai ?? "";
        }

        modalTitle.innerText = "Sửa sản phẩm";
        new bootstrap.Modal(productModal).show();
    };

    // ==================== XEM CHI TIẾT SẢN PHẨM (VIEW MODE) ====================
    window.openViewProduct = async (id) => {
        const res = await fetch(`/api/adminproducts/${id}`);
        if (!res.ok) return showAlertProduct("Không tìm thấy sản phẩm!");
        const p = await res.json();

        productId.value          = p.idsanpham;
        productName.value        = p.tensanpham;
        productQuantity.value    = p.soluong;
        productPrice.value       = p.giaban;
        productDescription.value = p.mota ?? "";

        if (productCategory) {
            if (p.iddanhmuc != null) {
                productCategory.value = String(p.iddanhmuc);
            } else {
                productCategory.value = "";
            }
        }

        imagePreview.innerHTML = p.hinhanhsanpham
            ? `<img src="${p.hinhanhsanpham}">`
            : `<span id="plusSign">+</span>`;

        // Vẫn render khuyến mãi để xem, nhưng không cho sửa
        refreshPromotionOptions(p.iddanhmuc, p.idsanpham, p.idkhuyenmai ?? null);
        if (promotionSelect) {
            promotionSelect.value = p.idkhuyenmai ?? "";
        }

        // tắt chế độ edit
        disableFormEdit();
        modalTitle.innerText = "Chi tiết sản phẩm";

        new bootstrap.Modal(productModal).show();
    };

    // ==================== BẬT / TẮT TRẠNG THÁI 1 SẢN PHẨM ====================
    function bindStatusButtons() {
        document.querySelectorAll(".toggleStatus").forEach(btn => {
            btn.addEventListener("click", async () => {
                const id = btn.dataset.id;
                const res = await fetch(`/api/adminproducts/${id}/toggle`, { method: "PUT" });

                if (!res.ok) return showAlertProduct("Thao tác thất bại!");
                showAlertProduct("Cập nhật trạng thái thành công!", "success");
                loadProducts();
            });
        });
    }

    function getCheckedProductIds() {
        return Array.from(document.querySelectorAll(".product-check:checked"))
            .map(cb => cb.dataset.id);
    }

    function bindRowCheckboxes() {
        const rowChecks = document.querySelectorAll(".product-check");

        if (!checkAll) return;
        checkAll.checked = false;

        rowChecks.forEach(cb => {
            cb.onchange = () => {
                const allChecked = Array.from(rowChecks).every(x => x.checked);
                checkAll.checked = allChecked;
            };
        });
    }

    if (checkAll) {
        checkAll.onchange = () => {
            const checked = checkAll.checked;
            document.querySelectorAll(".product-check").forEach(cb => {
                cb.checked = checked;
            });
        };
    }

    if (btnLockSelected) {
        btnLockSelected.addEventListener("click", () => {
            const ids = getCheckedProductIds();
            if (!ids.length) {
                showAlertProduct("Vui lòng chọn ít nhất 1 sản phẩm!");
                return;
            }

            openConfirm(
                `Bạn có chắc muốn khóa/mở ${ids.length} sản phẩm đã chọn?`,
                async () => {
                    try {
                        for (const id of ids) {
                            const res = await fetch(`/api/adminproducts/${id}/toggle`, {
                                method: "PUT"
                            });
                            if (!res.ok) {
                                console.error("Toggle thất bại cho id:", id);
                            }
                        }
                        showAlertProduct("Đã cập nhật trạng thái các sản phẩm đã chọn!", "success");
                        await loadProducts();
                    } catch (e) {
                        console.error(e);
                        showAlertProduct("Không thể cập nhật trạng thái hàng loạt!");
                    }
                }
            );
        });
    }

    (async () => {
        await loadCategories();
        await loadPromotions();
        await loadProducts();
    })();
});
