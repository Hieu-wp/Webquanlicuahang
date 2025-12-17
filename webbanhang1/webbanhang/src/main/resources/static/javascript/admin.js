// javascript/admin.js

async function checkLogin() {
  const user = JSON.parse(localStorage.getItem("user"));

  // Chưa đăng nhập → quay về login
  if (!user) {
    window.location.replace("/login");
    return;
  }

  // Không phải admin → đá sang trang staff
  if (user.vaitro !== "admin") {
    window.location.replace("/staff");
    return;
  }

  // Set tên ở navbar
  const welcomeEl = document.getElementById("welcomeUser");
  if (welcomeEl) {
    welcomeEl.textContent = `Xin chào, ${user.hoten ?? user.tendangnhap}`;
  }

  // Gán sự kiện logout
  const logoutBtn = document.getElementById("logoutBtn");
  const logoutBtn2 = document.getElementById("logoutBtn2");

  logoutBtn && logoutBtn.addEventListener("click", logout);
  logoutBtn2 && logoutBtn2.addEventListener("click", logout);

  // Load thống kê + chart
  await loadStats();
  await loadChart("day");
}

async function logout() {
  try {
    await fetch("/api/auth/logout", { method: "POST" });
  } catch (e) {
    // Có thể log lỗi, không bắt buộc
  }
  localStorage.removeItem("user");
  window.location.replace("/login");
}

checkLogin();

let chart = null;

async function loadStats() {
  const res = await fetch("/api/admin/stats");
  const s = await res.json();

  document.getElementById("todayRevenue").textContent =
    `₫${(s.todayRevenue ?? 0).toLocaleString("vi-VN")}`;
  document.getElementById("newOrders").textContent = s.newOrders ?? 0;
  document.getElementById("newCustomers").textContent = s.newCustomers ?? 0;
  document.getElementById("totalProducts").textContent = s.totalProducts ?? 0;
}

async function loadChart(type) {
  const res = await fetch(`/api/admin/chart?type=${type}`);
  const d = await res.json();

  const ctx = document.getElementById("revenueChart").getContext("2d");
  const gradient = ctx.createLinearGradient(0, 0, 0, 300);
  gradient.addColorStop(0, "rgba(200, 16, 46, 0.3)");
  gradient.addColorStop(1, "rgba(200, 16, 46, 0)");

  if (chart) {
    chart.destroy();
  }

  chart = new Chart(ctx, {
    type: "line",
    data: {
      labels: d.labels,
      datasets: [
        {
          label: "Doanh thu",
          data: d.values,
          fill: true,
          backgroundColor: gradient,
          borderColor: "#c8102e",
          tension: 0.4,
          pointRadius: 3,
          pointBackgroundColor: "#c8102e"
        }
      ]
    },
    options: {
      plugins: { 
        legend: { display: false } 
      },
      scales: {
        y: { 
          beginAtZero: true, 
          grid: { color: "#f1f1f1" } 
        },
        x: { 
          grid: { display: false } 
        }
      }
    }
  });
}
document.getElementById("timeRange")
  .addEventListener("change", e => loadChart(e.target.value));
