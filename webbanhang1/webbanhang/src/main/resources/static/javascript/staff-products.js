// javascript/staff-products.js

document.addEventListener("DOMContentLoaded", () => {

    // =============== CHECK LOGIN + HEADER =============== 
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) {
        window.location.replace("/login");
        return;
    }
    if (user.vaitro !== "employee") {   // tùy DB bạn, có thể là "staff"
        window.location.replace("/staff");
        return;
    }

    const welcomeUser = document.getElementById("welcomeUser");
    if (welcomeUser) {
        welcomeUser.textContent = `Xin chào, ${user.hoten ?? user.tendangnhap}`;
    }
    const staffFooterName = document.getElementById("staffFooterName");
    if (staffFooterName) {
        staffFooterName.textContent = user.hoten ?? user.tendangnhap;
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

    // =============== ALERT BOX =============== 
    window.closeAlertProduct = () => {
        document.getElementById("alertBoxProduct").classList.remove("show");
    };

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

    // =============== DOM ELEMENTS =============== 
    const filterCategory = document.getElementById("filterCategory");
    const filterPrice    = document.getElementById("filterPrice");
    const btnFilter      = document.getElementById("btnFilter");

    const productForm        = document.getElementById("productForm");
    const productId          = document.getElementById("productId");
    const productName        = document.getElementById("productName");
    const productCategory    = document.getElementById("productCategory");
    const productPrice       = document.getElementById("productPrice");
    const productQuantity    = document.getElementById("productQuantity");
    const productDescription = document.getElementById("productDescription");
    const productImage       = document.getElementById("productImage");
    const imagePreview       = document.getElementById("imagePreview");

    const promotionSelect = document.getElementById("productPromotion");

    const productModal   = document.getElementById("productModal");
    const modalTitle     = document.getElementById("modalTitle");
    const btnSaveProduct = document.getElementById("btnSaveProduct");
    const btnAddProduct  = document.getElementById("btnAddProduct");

    const checkAll        = document.getElementById("checkAll");
    const btnLockSelected = document.getElementById("btnLockSelected");

    // confirm box dùng cho khóa hàng loạt
    const confirmBox           = document.getElementById("confirmDeleteBox");
    const confirmDeleteOK      = document.getElementById("confirmDeleteOK");
    const confirmDeleteCancel  = document.getElementById("confirmDeleteCancel");
    const confirmDeleteMessage = document.getElementById("confirmDeleteMessage");
    let onConfirmCallback = null;

    let productList   = [];
    let categoryList  = [];
    let promotionList = []; // list KM active cho staff

    // ====== HELPER: bật / tắt chế độ edit form (dùng cho Xem / Sửa / Thêm) ======
    function setFormEditable(editable) {
        if (!productForm) return;
        productForm.querySelectorAll("input, textarea, select").forEach(el => {
            if (editable) {
                el.removeAttribute("disabled");
            } else {
                el.setAttribute("disabled", "disabled");
            }
        });
        if (btnSaveProduct) {
            btnSaveProduct.style.display = editable ? "" : "none";
        }
    }

    // =============== LOAD DANH MỤC (DÙNG ID) =============== 
    async function loadCategories() {
        try {
            const res = await fetch("/api/staff-categories");
            if (!res.ok) {
                console.error("Không thể load danh mục, status:", res.status);
                return;
            }

            categoryList = await res.json();

            // combobox filter
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

            // combobox trong modal
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

    // =============== LOAD KHUYẾN MÃI (STAFF) =============== 
    async function loadPromotions() {
        if (!promotionSelect) return;
        try {
            const res = await fetch("/api/admin-promotion-manager/active");
            if (!res.ok) return;

            promotionList = await res.json();

            // lần đầu: truyền luôn promotionSelect.value (thường là rỗng)
            refreshPromotionOptions(
                productCategory ? productCategory.value : null,
                productId.value || null,
                promotionSelect ? promotionSelect.value : null
            );
        } catch (e) {
            console.error(e);
        }
    }

    function isPromotionApplicable(pm, productIdVal, categoryIdVal) {
        const pid = productIdVal  != null && productIdVal !== ""  ? Number(productIdVal)  : null;
        const cid = categoryIdVal != null && categoryIdVal !== "" ? Number(categoryIdVal) : null;

        const catIds  = Array.isArray(pm.categoryIds) ? pm.categoryIds.map(Number) : [];
        // const prodIds = Array.isArray(pm.productIds)  ? pm.productIds.map(Number)  : [];

        switch (pm.apdungcho) {
            case "all":
                return true;
            case "category":
                if (!cid) return false;
                return catIds.includes(cid);
            case "product":
                return true;
            default:
                return false;
        }
    }

    function refreshPromotionOptions(currentCategoryId, currentProductId, keepPromotionId = null) {
        if (!promotionSelect) return;

        promotionSelect.innerHTML = '<option value="">-- Không áp dụng --</option>';

        const applicable = promotionList.filter(pm =>
            isPromotionApplicable(pm, currentProductId, currentCategoryId)
        );

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

    if (productCategory) {
        productCategory.addEventListener("change", () => {
            const catVal    = productCategory.value;
            const prodIdVal = productId.value;
            const keepPromo = promotionSelect ? promotionSelect.value : null;

            refreshPromotionOptions(catVal, prodIdVal || null, keepPromo);
        });
    }

    // =============== LOAD PRODUCTS (STAFF) =============== 
    async function loadProducts() {
        try {
            const res = await fetch("/api/staff-products");
            if (!res.ok) {
                showAlertProduct("Không thể tải sản phẩm!");
                return;
            }
            productList = await res.json();
            renderTable(productList);
        } catch (e) {
            console.error(e);
            showAlertProduct("Không thể kết nối server!");
        }
    }

    function renderTable(data) {
        const tbody = document.getElementById("productTable");
        if (!tbody) return;
        tbody.innerHTML = "";

        data.forEach(p => {
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
                    </span>`;
            } else {
                priceHtml = `${original.toLocaleString()}₫`;
            }

            const categoryName = getCategoryNameById(p.iddanhmuc);

            const statusText = p.trangthai === 1 ? "Đang bán" : "Đã khóa";
            const btnLabel   = p.trangthai === 1 ? "Khóa" : "Mở khóa";
            const btnIcon    = p.trangthai === 1 ? "bi-lock-fill" : "bi-unlock-fill";
            const btnClass   = p.trangthai === 1 ? "btn-danger" : "btn-success";

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
                    <td>${priceHtml}</td>
                    <td>${p.soluong}</td>
                    <td>${categoryName}</td>
                    <td>${p.mota ?? ""}</td>
                    <td>
                        <button class="btn btn-info btn-sm me-1" onclick="openViewProduct(${p.idsanpham})">
                            <i class="bi bi-eye"></i> Xem
                        </button>
                        <button class="btn btn-warning btn-sm me-1" onclick="openUpdate(${p.idsanpham})">
                            <i class="bi bi-pencil-square"></i> Sửa
                        </button>
                        <button class="btn ${btnClass} btn-sm toggleStatus me-1" data-id="${p.idsanpham}">
                            <i class="bi ${btnIcon}"></i> ${btnLabel}
                        </button>
                    </td>
                </tr>
            `;
        });

        bindStatusButtons();
        bindRowCheckboxes();
    }

    // =============== FILTER SẢN PHẨM =============== 
    if (btnFilter) {
        btnFilter.onclick = () => {
            const catId = filterCategory.value;
            const price = filterPrice.value;

            let min = 0, max = 999999999999;
            if (price) {
                const [a, b] = price.split("-");
                min = Number(a);
                max = Number(b);
            }

            const filtered = productList.filter(p => {
                const matchCategory = !catId || Number(p.iddanhmuc) === Number(catId);
                const base = Number(p.giaban || 0);
                const finalPrice = p.giasaukhuyenmai != null ? Number(p.giasaukhuyenmai) : base;
                const matchPrice = finalPrice >= min && finalPrice <= max;
                return matchCategory && matchPrice;
            });

            renderTable(filtered);
        };
    }

    // =============== IMAGE PREVIEW =============== 
    if (imagePreview && productImage) {
        imagePreview.addEventListener("click", () => productImage.click());

        productImage.addEventListener("change", e => {
            const f = e.target.files[0];
            if (!f) return;
            if (!f.type.startsWith("image/")) {
                showAlertProduct("File phải là ảnh!");
                return;
            }
            const reader = new FileReader();
            reader.onload = () => {
                imagePreview.innerHTML = `<img src="${reader.result}">`;
            };
            reader.readAsDataURL(f);
        });
    }

    // =============== THÊM MỚI SẢN PHẨM =============== 
    if (btnAddProduct) {
        btnAddProduct.onclick = () => {
            modalTitle.innerText = "Thêm sản phẩm";
            productForm.reset();
            productId.value = "";
            imagePreview.innerHTML = `<span id="plusSign">+</span>`;
            if (productCategory) productCategory.value = "";
            if (promotionSelect) promotionSelect.value = "";

            setFormEditable(true);
            refreshPromotionOptions(productCategory ? productCategory.value : null, null, null);

            new bootstrap.Modal(productModal).show();
        };
    }

    // =============== LƯU SẢN PHẨM =============== 
    if (btnSaveProduct) {
        btnSaveProduct.onclick = async () => {
            const img = document.querySelector("#imagePreview img")?.src || null;

            const name       = productName.value.trim();
            const categoryId = Number(productCategory.value);
            const price      = Number(productPrice.value);
            const quantity   = Number(productQuantity.value);

            if (!name)                      return showAlertProduct("Tên sản phẩm không được trống!");
            if (!categoryId)                return showAlertProduct("Danh mục không được trống!");
            if (!price || price <= 0)       return showAlertProduct("Giá phải lớn hơn 0!");
            if (isNaN(quantity) || quantity < 0) return showAlertProduct("Số lượng không hợp lệ!");
            if (!img)                       return showAlertProduct("Hãy chọn hình sản phẩm!");

            const id = productId.value;

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

            if (id) {
                dto.idsanpham = Number(id);
            }

            const url    = id ? `/api/staff-products/${id}` : `/api/staff-products`;
            const method = id ? "PUT" : "POST";

            try {
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

            } catch (e) {
                console.error(e);
                showAlertProduct("Không thể kết nối server!");
            }
        };
    }

    // =============== SỬA SẢN PHẨM (EDIT MODE) =============== 
    window.openUpdate = async (id) => {
        try {
            const res = await fetch(`/api/staff-products/${id}`);
            if (!res.ok) {
                showAlertProduct("Không tìm thấy sản phẩm!");
                return;
            }
            const p = await res.json();

            setFormEditable(true);

            productId.value          = p.idsanpham;
            productName.value        = p.tensanpham;
            productQuantity.value    = p.soluong;
            productPrice.value       = p.giaban;
            productDescription.value = p.mota ?? "";

            if (productCategory) {
                if (p.iddanhmuc != null) {
                    productCategory.value = p.iddanhmuc;
                } else {
                    productCategory.value = "";
                }
            }

            imagePreview.innerHTML = p.hinhanhsanpham
                ? `<img src="${p.hinhanhsanpham}">`
                : `<span id="plusSign">+</span>`;

            refreshPromotionOptions(p.iddanhmuc, p.idsanpham, p.idkhuyenmai ?? null);

            if (promotionSelect) {
                promotionSelect.value = p.idkhuyenmai ?? "";
            }

            modalTitle.innerText = "Sửa sản phẩm";
            new bootstrap.Modal(productModal).show();

        } catch (e) {
            console.error(e);
            showAlertProduct("Không thể kết nối server!");
        }
    };

    // =============== XEM CHI TIẾT (VIEW MODE – DISABLED) =============== 
    window.openViewProduct = async (id) => {
        try {
            const res = await fetch(`/api/staff-products/${id}`);
            if (!res.ok) {
                showAlertProduct("Không tìm thấy sản phẩm!");
                return;
            }
            const p = await res.json();

            productId.value          = p.idsanpham;
            productName.value        = p.tensanpham;
            productQuantity.value    = p.soluong;
            productPrice.value       = p.giaban;
            productDescription.value = p.mota ?? "";

            if (productCategory) {
                productCategory.value = p.iddanhmuc ?? "";
            }

            imagePreview.innerHTML = p.hinhanhsanpham
                ? `<img src="${p.hinhanhsanpham}">`
                : `<span id="plusSign">+</span>`;

            refreshPromotionOptions(p.iddanhmuc, p.idsanpham, p.idkhuyenmai ?? null);
            if (promotionSelect) {
                promotionSelect.value = p.idkhuyenmai ?? "";
            }

            setFormEditable(false);
            modalTitle.innerText = "Chi tiết sản phẩm";

            new bootstrap.Modal(productModal).show();

        } catch (e) {
            console.error(e);
            showAlertProduct("Không thể kết nối server!");
        }
    };

    // =============== BẬT / TẮT TRẠNG THÁI 1 SẢN PHẨM =============== 
    function bindStatusButtons() {
        document.querySelectorAll(".toggleStatus").forEach(btn => {
            btn.addEventListener("click", async () => {
                const id = btn.dataset.id;
                try {
                    const res = await fetch(`/api/staff-products/${id}/toggle`, { method: "PUT" });
                    if (!res.ok) {
                        showAlertProduct("Cập nhật trạng thái thất bại!");
                        return;
                    }
                    showAlertProduct("Cập nhật trạng thái thành công!", "success");
                    await loadProducts();
                } catch (e) {
                    console.error(e);
                    showAlertProduct("Không thể kết nối server!");
                }
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

    // =============== CONFIRM BOX DÙNG CHUNG =============== 
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
        confirmBox && confirmBox.classList.remove("show");
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

    // =============== KHÓA ĐÃ CHỌN (BULK TOGGLE) =============== 
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
                            const res = await fetch(`/api/staff-products/${id}/toggle`, {
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

    // =============== INIT =============== 
    (async () => {
        await loadCategories();
        await loadPromotions();
        await loadProducts();
    })();
});
