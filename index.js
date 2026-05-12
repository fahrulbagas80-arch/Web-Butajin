const navLinks = document.querySelectorAll(".navbar-nav .nav-link");
navLinks.forEach((link) => {
  link.addEventListener("click", function () {
    navLinks.forEach((l) => l.classList.remove("active"));
    this.classList.add("active");
  });
});

function showAlert(type, message) {
  const existing = document.querySelector(".butajin-alert");
  if (existing) existing.remove();

  const isSuccess = type === "success";

  const alertEl = document.createElement("div");
  alertEl.className = `butajin-alert butajin-alert-${type}`;
  alertEl.innerHTML = `
    <div class="butajin-alert-icon">${isSuccess ? "✅" : "⚠️"}</div>
    <div class="butajin-alert-message">${message}</div>
    <button class="butajin-alert-close" onclick="this.parentElement.remove()">&#10005;</button>
    <div class="butajin-alert-progress"></div>
  `;

  document.body.appendChild(alertEl);

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      alertEl.classList.add("butajin-alert-show");
    });
  });

  setTimeout(() => {
    alertEl.classList.remove("butajin-alert-show");
    alertEl.classList.add("butajin-alert-hide");
    setTimeout(() => alertEl.remove(), 500);
  }, 3500);
}

const STORAGE_KEY = "butajin_data";

// Data bawaan (2 baris awal di HTML)
const DEFAULT_DATA = [
  {
    jam: "07.00",
    nama: "Arga Ahmad",
    asal: "BOYOLALI",
    kategori: "Umum",
    tujuan: "Kunjungan",
  },
  {
    jam: "08.00",
    nama: "Akita Suryana",
    asal: "SURAKARTA",
    kategori: "Siswa",
    tujuan: "Dispen",
  },
];

function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [...DEFAULT_DATA];
  } catch {
    return [...DEFAULT_DATA];
  }
}

function saveData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function getBadgeClass(kategori) {
  if (kategori === "Umum") return "badge-umum";
  if (kategori === "Siswa") return "badge-siswa";
  return "badge-other";
}

function renderRow(entry, no, animate = false) {
  const tbody = document.querySelector("#guestTable tbody");
  const tr = document.createElement("tr");
  if (animate) tr.style.animation = "rowFadeIn 0.4s ease forwards";

  const badgeClass = getBadgeClass(entry.kategori);
  tr.innerHTML = `
    <td class="td-no">${no}</td>
    <td class="td-jam"><span class="jam-pill">${entry.jam}</span></td>
    <td class="td-nama">${entry.nama}</td>
    <td>${entry.asal}</td>
    <td style="text-align:center;"><span class="badge-layanan ${badgeClass}">${entry.kategori}</span></td>
    <td>${entry.tujuan}</td>
    <td style="text-align:center;">
      <button class="btn-hapus" onclick="hapusBaris(${no - 1})" title="Hapus">🗑️</button>
    </td>
  `;
  tbody.appendChild(tr);
}

function renderAllRows(data) {
  const tbody = document.querySelector("#guestTable tbody");
  tbody.innerHTML = ""; // Kosongkan dulu
  data.forEach((entry, i) => renderRow(entry, i + 1));
  document.getElementById("totalCount").textContent = data.length;
}

function hapusBaris(index) {
  const data = loadData();
  data.splice(index, 1);
  saveData(data);
  renderAllRows(data);
  showAlert("error", "Data berhasil dihapus");
}

function resetSemuaData() {
  const yakin = confirm("⚠️ Hapus permanen semua data kunjungan?");

  if (yakin) {
    localStorage.removeItem(STORAGE_KEY);
    const initialData = [...DEFAULT_DATA];
    saveData(initialData);
    renderAllRows(initialData);

    showAlert("success", "Sistem telah di-reset ke pengaturan awal");
  }
}
document.addEventListener("DOMContentLoaded", () => {
  const data = loadData();
  renderAllRows(data);
});

const forms = document.querySelectorAll(".guest-form");
forms.forEach((form) => {
  form.addEventListener("submit", function (e) {
    e.preventDefault();

    const jam = this.querySelector(".jam").value.trim();
    const nama = this.querySelector(".nama").value.trim();
    const asal = this.querySelector(".asal").value.trim();
    const tujuan = this.querySelector(".tujuan").value.trim();
    const kategori = this.getAttribute("data-kategori");

    if (!jam || !nama || !asal || !tujuan) {
      showAlert("error", "Tolong Isi Dengan Lengkap");
      return;
    }

    const jamFormatted = jam.replace(":", ".");

    const data = loadData();
    const newEntry = { jam: jamFormatted, nama, asal, kategori, tujuan };
    data.push(newEntry);
    saveData(data);

    const no = data.length;
    renderRow(newEntry, no, true);
    document.getElementById("totalCount").textContent = data.length;

    this.reset();
    const modalEl = this.closest(".modal");
    const modal = bootstrap.Modal.getInstance(modalEl);
    if (modal) modal.hide();

    setTimeout(() => {
      showAlert("success", "Registrasi Anda Sudah Terkirim");
    }, 450);
  });
});
