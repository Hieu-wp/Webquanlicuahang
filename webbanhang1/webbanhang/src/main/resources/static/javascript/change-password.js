document.addEventListener("DOMContentLoaded", () => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) return window.location.replace("/login");

    // Tạo popup thông báo giống trang products
    function showAlert(message, type = "error") {
        let box = document.getElementById("alertBoxPassword");
        if (!box) {
            document.body.insertAdjacentHTML("beforeend", `
                <div id="alertBoxPassword">
                    <div class="alert-content">
                        <div id="alertIconPassword"></div>
                        <p id="alertMessagePassword"></p>
                        <button id="alertConfirmPassword">OK</button>
                    </div>
                </div>
            `);
            box = document.getElementById("alertBoxPassword");
        }

        document.getElementById("alertMessagePassword").textContent = message;
        document.getElementById("alertIconPassword").textContent = type === "success" ? "✔" : "✖";
        document.getElementById("alertIconPassword").style.color = type === "success" ? "green" : "red";

        box.classList.add("show");
        document.getElementById("alertConfirmPassword").onclick = () => box.classList.remove("show");
    }

    document.getElementById("btnSavePass").addEventListener("click", async () => {
        const oldPass = document.getElementById("oldPass").value.trim();
        const newPass = document.getElementById("newPass").value.trim();
        const confirmPass = document.getElementById("confirmPass").value.trim();

        if (!oldPass || !newPass || !confirmPass)
            return showAlert("Vui lòng nhập đầy đủ thông tin!");

        if (newPass.length < 6)
            return showAlert("Mật khẩu mới phải từ 6 ký tự!");

        if (newPass !== confirmPass)
            return showAlert("Xác nhận mật khẩu không khớp!");

        try {
            const res = await fetch("/api/change-password", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ oldPass, newPass })
            });

            const data = await res.json();
            if (!res.ok) return showAlert(data.message || "Đổi mật khẩu thất bại!");

            showAlert("Đổi mật khẩu thành công!", "success");

            setTimeout(() => {
                window.location.href = "/staff";
            }, 1500);
        }
        catch {
            showAlert("Không thể kết nối server!");
        }
    });
});
