// GANTI DENGAN URL API ANDA YANG BARU
const API_URL =
    "https://script.google.com/macros/s/AKfycbypFnQG1FCrzsYO8sqtrAMaJXlDy9fTQiN6D_N9Ho8Naus-m0x9h-3yJsDEwKn04Pfx/exec";

let dataTrxGlobal = []; // Menyimpan data sementara untuk form Edit
let globalAction = "tambah";
let globalTrxId = null;

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("appbar-container").innerHTML = viewAppbar;
    document.getElementById("nav-container").innerHTML = viewNav;
    document.getElementById("modals-container").innerHTML = viewModals;

    navigate("home");

    const contentContainer = document.getElementById("content-container");
    let lastScrollY = 0;
    contentContainer.addEventListener("scroll", () => {
        const headerWrap = document.querySelector(".header-wrapper");
        if (!headerWrap) return;
        let currentScrollY = contentContainer.scrollTop;
        if (currentScrollY > 50 && currentScrollY > lastScrollY) {
            headerWrap.classList.add("hidden");
        } else if (currentScrollY < lastScrollY - 5 || currentScrollY === 0) {
            headerWrap.classList.remove("hidden");
        }
        lastScrollY = currentScrollY;
    });
});

function navigate(page) {
    const container = document.getElementById("content-container");
    const title = document.getElementById("app-title");
    const subtitle = document.getElementById("app-subtitle");
    const fab = document.getElementById("main-fab");

    document
        .querySelectorAll(".nav-item")
        .forEach(nav => nav.classList.remove("active"));
    const activeNav = document.getElementById("nav-" + page);
    if (activeNav) activeNav.classList.add("active");

    if (page === "home") {
        container.innerHTML = viewHome;
        title.innerText = "Selamat Datang!";
        subtitle.innerText = "Ringkasan Keuangan Anda";
        if (fab) fab.classList.remove("hidden");
        loadDataTransaksi();
    } else if (page === "todo") {
        container.innerHTML = viewTodo;
        title.innerText = "Data Transaksi";
        subtitle.innerText = "Kelola pemasukan & pengeluaran";
        if (fab) fab.classList.add("hidden");
        loadDataTransaksi();
    } else if (page === "grafik") {
        container.innerHTML = viewGrafik;
        title.innerText = "Grafik Visual";
        subtitle.innerText = "Analisis Keuangan Anda";
        if (fab) fab.classList.add("hidden");
        setTimeout(initCharts, 100);
    }
    container.scrollTop = 0;
}

function formatRupiah(angka) {
    let parsed = parseInt(angka) || 0;
    return "Rp " + parsed.toLocaleString("id-ID");
}

// Tambahan ID pada parameter
function generateTrxHTML(
    id,
    judul,
    jenis,
    nominal,
    tgl,
    jam,
    catatan,
    tglRaw = ""
) {
    let jenisLower = (jenis || "").toLowerCase().trim();
    let badgeClass = jenisLower === "pemasukan" ? "badge-in" : "badge-out";
    let textClass = jenisLower === "pemasukan" ? "text-success" : "text-danger";
    let sign = jenisLower === "pemasukan" ? "+" : "-";
    let catatanHTML = catatan
        ? `<div class="trx-notes"><i class="fa-regular fa-note-sticky"></i> ${catatan}</div>`
        : "";
    let nominalRupiah = formatRupiah(nominal).replace("Rp ", "");

    return `
    <div class="trx-item-wrapper" data-jenis="${jenisLower}" data-date="${tglRaw}">
        <div class="trx-header">
            <div class="trx-title-area">
                <div class="trx-title">${judul || "-"}</div>
                <div class="badge ${badgeClass}">${jenisLower.toUpperCase()}</div>
            </div>
            <div class="trx-amount-large ${textClass}">${sign}Rp ${nominalRupiah}</div>
        </div>
        <div class="trx-details">
            <div class="trx-datetime">
                <span><i class="fa-regular fa-calendar"></i> ${tgl || "-"}</span>
                <span><i class="fa-regular fa-clock"></i> ${jam || "-"}</span>
            </div>
            ${catatanHTML}
        </div>
        <div class="action-row action-icons">
            <i class="fa-solid fa-pen text-blue" onclick="openModal('edit', '${id}')"></i>
            <i class="fa-solid fa-trash text-danger" onclick="openModal('hapus', '${id}')"></i>
        </div>
    </div>
    `;
}

async function loadDataTransaksi() {
    const trxListHome = document.getElementById("trx-list-home");
    const trxListTodo = document.getElementById("trx-list-todo");

    if (trxListHome)
        trxListHome.innerHTML = `<div style="text-align:center; padding: 20px; color:gray;"><i class="fa-solid fa-spinner fa-spin"></i> Memuat data...</div>`;
    if (trxListTodo)
        trxListTodo.innerHTML = `<div style="text-align:center; padding: 20px; color:gray;"><i class="fa-solid fa-spinner fa-spin"></i> Memuat data...</div>`;

    try {
        const response = await fetch(API_URL);
        const rawData = await response.json();

        let totalPemasukan = 0;
        let totalPengeluaran = 0;
        let listHTML = "";
        dataTrxGlobal = [];

        if (rawData && rawData.length > 0) {
            rawData.reverse().forEach(rawItem => {
                let item = {};
                for (let key in rawItem) {
                    item[key.toLowerCase().trim()] = rawItem[key];
                }

                dataTrxGlobal.push(item);

                let nominalStr = (item.nominal || "0")
                    .toString()
                    .replace(/[^0-9]/g, "");
                let nominal = parseInt(nominalStr) || 0;
                let jenis = (item.jenis || "").toLowerCase().trim();

                if (jenis === "pemasukan") totalPemasukan += nominal;
                else if (jenis === "pengeluaran") totalPengeluaran += nominal;

                // --- KODE PERAPI TANGGAL (MEMPERBAIKI ZONA WAKTU) ---
                let tanggalRaw = (item.tanggal || "").toString();
                let tanggalRapi = tanggalRaw;
                if (tanggalRaw.includes("T")) {
                    // Pakai new Date() agar sistem otomatis menariknya ke waktu WIB
                    let d = new Date(tanggalRaw);
                    let hari = String(d.getDate()).padStart(2, "0");
                    let bulanIndex = d.getMonth();
                    let tahun = d.getFullYear();
                    const namaBulan = [
                        "Jan",
                        "Feb",
                        "Mar",
                        "Apr",
                        "Mei",
                        "Jun",
                        "Jul",
                        "Ags",
                        "Sep",
                        "Okt",
                        "Nov",
                        "Des"
                    ];
                    tanggalRapi = `${hari} ${namaBulan[bulanIndex]} ${tahun}`;
                }

                // --- KODE PERAPI JAM ---
                let jamRaw = (item.jam || "").toString();
                let jamRapi = jamRaw;
                if (jamRaw.includes("T")) {
                    let dateObj = new Date(jamRaw);
                    let h = String(dateObj.getHours()).padStart(2, "0");
                    let m = String(dateObj.getMinutes()).padStart(2, "0");
                    jamRapi = `${h}:${m}`;
                }

                listHTML += generateTrxHTML(
                    item.id,
                    item.judul,
                    jenis,
                    nominal,
                    tanggalRapi,
                    jamRapi,
                    item.catatan,
                    tanggalRaw
                );
            });
        } else {
            listHTML = `<div style="text-align:center; padding: 20px; color:gray;">Belum ada transaksi.</div>`;
        }

        let saldoSisa = totalPemasukan - totalPengeluaran;
        const elTotalMasuk = document.getElementById("total-pemasukan");
        const elTotalKeluar = document.getElementById("total-pengeluaran");
        const elSaldoTotal = document.getElementById("saldo-total");

        if (elTotalMasuk) elTotalMasuk.innerText = formatRupiah(totalPemasukan);
        if (elTotalKeluar)
            elTotalKeluar.innerText = formatRupiah(totalPengeluaran);
        if (elSaldoTotal) elSaldoTotal.innerText = formatRupiah(saldoSisa);

        if (trxListHome) trxListHome.innerHTML = listHTML;
        if (trxListTodo) trxListTodo.innerHTML = listHTML;
    } catch (error) {
        console.error("Error API:", error);
        if (trxListHome)
            trxListHome.innerHTML = `<div style="text-align:center; color:red;">Gagal terhubung ke database.</div>`;
        if (trxListTodo)
            trxListTodo.innerHTML = `<div style="text-align:center; color:red;">Gagal terhubung ke database.</div>`;
    }
}

function openModal(action, id = null) {
    globalAction = action;
    globalTrxId = id;

    if (action === "hapus") {
        const item = dataTrxGlobal.find(x => x.id == id);
        document.getElementById("hapus-item-name").innerText = item
            ? item.judul
            : "Item ini";
        document.getElementById("modal-hapus").classList.remove("hidden");
    } else if (action === "filter") {
        document.getElementById("modal-filter").classList.remove("hidden");

        // --- INI LOGIKA UNTUK MEMUNCULKAN POP-UP CETAK ---
    } else if (action === "cetak") {
        document.getElementById("modal-cetak").classList.remove("hidden");
    } else if (action === "tambah" || action === "edit") {
        document.getElementById("modal-title").innerText =
            action === "edit" ? "Edit Data" : "Tambah Data Baru";

        let now = new Date();
        let year = now.getFullYear();
        let month = String(now.getMonth() + 1).padStart(2, "0");
        let day = String(now.getDate()).padStart(2, "0");
        let hours = String(now.getHours()).padStart(2, "0");
        let minutes = String(now.getMinutes()).padStart(2, "0");

        if (action === "edit" && id) {
            const item = dataTrxGlobal.find(x => x.id == id);

            document.getElementById("input-nama").value = item.judul || "";
            document.getElementById("input-kategori").value = (
                item.jenis || "pengeluaran"
            ).toLowerCase();
            document.getElementById("input-nominal").value = (
                item.nominal || "0"
            )
                .toString()
                .replace(/[^0-9]/g, "");
            document.getElementById("input-catatan").value = item.catatan || "";

            let parsedDate = `${year}-${month}-${day}`;
            const namaBulan = [
                "Jan",
                "Feb",
                "Mar",
                "Apr",
                "Mei",
                "Jun",
                "Jul",
                "Ags",
                "Sep",
                "Okt",
                "Nov",
                "Des"
            ];
            if (item.tanggal) {
                let p = item.tanggal.split(" ");
                if (p.length === 3) {
                    let mIndex = namaBulan.indexOf(p[1]) + 1;
                    let mStr = String(mIndex).padStart(2, "0");
                    parsedDate = `${p[2]}-${mStr}-${p[0]}`;
                }
            }
            document.getElementById("input-tanggal").value = parsedDate;
            document.getElementById("input-jam").value =
                item.jam || `${hours}:${minutes}`;
        } else {
            // Form Kosong (Tambah)
            document.getElementById("input-nama").value = "";
            document.getElementById("input-kategori").value = "pengeluaran";
            document.getElementById("input-nominal").value = "";
            document.getElementById("input-tanggal").value =
                `${year}-${month}-${day}`;
            document.getElementById("input-jam").value = `${hours}:${minutes}`;
            document.getElementById("input-catatan").value = "";
        }
        document.getElementById("modal-form").classList.remove("hidden");
    }
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.add("hidden");
}

async function saveData() {
    const jenis = document.getElementById("input-kategori").value;
    const judul = document.getElementById("input-nama").value;
    const nominal = document.getElementById("input-nominal").value;
    const tglRaw = document.getElementById("input-tanggal").value;
    const jam = document.getElementById("input-jam").value;
    const catatan = document.getElementById("input-catatan").value;

    if (!judul || !nominal || !tglRaw || !jam) {
        alert("Harap isi Judul, Nominal, Tanggal, dan Jam!");
        return;
    }

    const [tahun, bulan, hari] = tglRaw.split("-");
    const namaBulan = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "Mei",
        "Jun",
        "Jul",
        "Ags",
        "Sep",
        "Okt",
        "Nov",
        "Des"
    ];
    const tanggal = `${hari} ${namaBulan[parseInt(bulan) - 1]} ${tahun}`;

    const btnSave = document.querySelector(".btn-save");
    const originalText = btnSave.innerHTML;
    btnSave.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Menyimpan...`;
    btnSave.disabled = true;

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            body: JSON.stringify({
                action: globalAction, // Status apakah tambah atau edit
                id: globalTrxId, // Melempar ID baris
                jenis: jenis,
                judul: judul,
                nominal: nominal,
                tanggal: tanggal,
                jam: jam,
                catatan: catatan
            })
        });
        const result = await response.json();
        if (result.status === "success") {
            closeModal("modal-form");
            loadDataTransaksi();
        }
    } catch (error) {
        alert("Terjadi kesalahan saat menyimpan data.");
        console.error(error);
    } finally {
        btnSave.innerHTML = originalText;
        btnSave.disabled = false;
    }
}

async function confirmDelete() {
    const btnHapus = document.querySelector(".btn-danger-bg");
    const originalText = btnHapus.innerHTML;
    btnHapus.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Proses...`;
    btnHapus.disabled = true;

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            body: JSON.stringify({ action: "hapus", id: globalTrxId })
        });
        const result = await response.json();

        if (result.status === "success") {
            closeModal("modal-hapus");
            loadDataTransaksi();
        }
    } catch (error) {
        alert("Gagal menghapus data.");
    } finally {
        btnHapus.innerHTML = originalText;
        btnHapus.disabled = false;
    }
}

function runFilters() {
    const activeTab = document
        .querySelector(".tab.active")
        .innerText.toLowerCase()
        .trim();
    const startVal = document.getElementById("filter-start").value;
    const endVal = document.getElementById("filter-end").value;

    const startDate = startVal ? new Date(startVal).setHours(0, 0, 0, 0) : null;
    const endDate = endVal ? new Date(endVal).setHours(23, 59, 59, 999) : null;

    const trxItems = document.querySelectorAll(
        "#trx-list-todo .trx-item-wrapper"
    );

    trxItems.forEach(item => {
        let show = true;
        const itemJenis = item.getAttribute("data-jenis");
        const itemRawDate = item.getAttribute("data-date"); // Contoh dari sheet: 26 Jul 2026

        if (activeTab !== "semua" && itemJenis !== activeTab) show = false;

        if (itemRawDate && (startDate || endDate)) {
            // Ubah dulu dari "26 Jul 2026" agar bisa dikalkulasi JS
            const p = itemRawDate.split(" ");
            const namaBulan = [
                "Jan",
                "Feb",
                "Mar",
                "Apr",
                "Mei",
                "Jun",
                "Jul",
                "Ags",
                "Sep",
                "Okt",
                "Nov",
                "Des"
            ];
            let itemDate = null;

            if (p.length === 3) {
                let mIndex = namaBulan.indexOf(p[1]) + 1;
                let mStr = String(mIndex).padStart(2, "0");
                itemDate = new Date(`${p[2]}-${mStr}-${p[0]}`).getTime();
            }

            if (itemDate) {
                if (startDate && itemDate < startDate) show = false;
                if (endDate && itemDate > endDate) show = false;
            }
        }
        item.style.display = show ? "flex" : "none";
    });
}

function filterTab(element) {
    document
        .querySelectorAll(".tab")
        .forEach(t => t.classList.remove("active"));
    element.classList.add("active");
    runFilters();
}

function applyFilter() {
    runFilters();
    closeModal("modal-filter");
}

function resetFilter() {
    document.getElementById("filter-start").value = "";
    document.getElementById("filter-end").value = "";
    runFilters();
    closeModal("modal-filter");
}

function printGrafik() {
    window.print();
}

// ==================== FUNGSI GRAFIK DINAMIS ====================
function initCharts() {
    const ctx1 = document.getElementById("chartUtama");
    const ctx2 = document.getElementById("chartPersentase");

    if (!ctx1 || !ctx2) return;

    // 1. SIAPKAN VARIABEL UNTUK 7 HARI TERAKHIR
    let labels = [];
    let masuk = [0, 0, 0, 0, 0, 0, 0];
    let keluar = [0, 0, 0, 0, 0, 0, 0];
    let totalPemasukan = 0;
    let totalPengeluaran = 0;

    const dNames = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

    let today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 6; i >= 0; i--) {
        let d = new Date(today);
        d.setDate(today.getDate() - i);
        labels.push(dNames[d.getDay()]);
    }

    // 2. BACA DAN KELOMPOKKAN DATA TRANSAKSI
    dataTrxGlobal.forEach(item => {
        let nominal =
            parseInt((item.nominal || "0").toString().replace(/[^0-9]/g, "")) ||
            0;
        let jenis = (item.jenis || "").toLowerCase().trim();

        if (jenis === "pemasukan") totalPemasukan += nominal;
        else if (jenis === "pengeluaran") totalPengeluaran += nominal;

        // --- INI PERBAIKANNYA: Deteksi Otomatis Segala Format Tanggal ---
        let trxDate = null;
        let rawStr = (item.tanggal || "").toString().trim();

        if (rawStr.includes("T")) {
            // Jika format dari Google Sheets (2026-07-25T...)
            let datePart = rawStr.split("T")[0];
            let [y, m, d] = datePart.split("-");
            trxDate = new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
        } else {
            // Jika format ketikan manual (25 Jul 2026)
            let p = rawStr.split(" ");
            if (p.length === 3) {
                const namaBulan = [
                    "Jan",
                    "Feb",
                    "Mar",
                    "Apr",
                    "Mei",
                    "Jun",
                    "Jul",
                    "Ags",
                    "Sep",
                    "Okt",
                    "Nov",
                    "Des"
                ];
                let mIndex = namaBulan.indexOf(p[1]);
                if (mIndex !== -1) {
                    trxDate = new Date(parseInt(p[2]), mIndex, parseInt(p[0]));
                }
            }
        }

        // Jika tanggal berhasil ditemukan, masukkan ke bar grafik
        if (trxDate) {
            trxDate.setHours(0, 0, 0, 0);
            let diffTime = today.getTime() - trxDate.getTime();
            let diffDays = Math.round(diffTime / (1000 * 3600 * 24));

            // Cek apakah masuk dalam 7 hari terakhir
            if (diffDays >= 0 && diffDays <= 6) {
                let arrayIndex = 6 - diffDays;
                if (jenis === "pemasukan") masuk[arrayIndex] += nominal;
                else if (jenis === "pengeluaran") keluar[arrayIndex] += nominal;
            }
        }
    });

    // 3. UPDATE KOTAK PERSENTASE
    let totalAll = totalPemasukan + totalPengeluaran;
    let percMasuk =
        totalAll === 0 ? 0 : Math.round((totalPemasukan / totalAll) * 100);
    let percKeluar =
        totalAll === 0 ? 0 : Math.round((totalPengeluaran / totalAll) * 100);

    let domPercIn = document.querySelector(".perc-in .perc-value");
    let domPercOut = document.querySelector(".perc-out .perc-value");
    if (domPercIn) domPercIn.innerText = percMasuk + "%";
    if (domPercOut) domPercOut.innerText = percKeluar + "%";

    // 4. HITUNG PERSENTASE HARIAN (UNTUK GRAFIK KEDUA)
    let percMasukHarian = [];
    let percKeluarHarian = [];
    for (let i = 0; i < 7; i++) {
        let sumDay = masuk[i] + keluar[i];
        if (sumDay === 0) {
            percMasukHarian.push(0);
            percKeluarHarian.push(0);
        } else {
            percMasukHarian.push(Math.round((masuk[i] / sumDay) * 100));
            percKeluarHarian.push(Math.round((keluar[i] / sumDay) * 100));
        }
    }

    // 5. RENDER GRAFIK UTAMA
    if (window.chartUtamaObj) window.chartUtamaObj.destroy();
    window.chartUtamaObj = new Chart(ctx1.getContext("2d"), {
        type: "bar",
        data: {
            labels: labels,
            datasets: [
                {
                    label: "Masuk",
                    data: masuk,
                    backgroundColor: "#10B981",
                    borderRadius: 4
                },
                {
                    label: "Keluar",
                    data: keluar,
                    backgroundColor: "#EF4444",
                    borderRadius: 4
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: { y: { display: false }, x: { grid: { display: false } } }
        }
    });

    // 6. RENDER GRAFIK PERSENTASE HARIAN
    if (window.chartPersentaseObj) window.chartPersentaseObj.destroy();
    window.chartPersentaseObj = new Chart(ctx2.getContext("2d"), {
        type: "bar",
        data: {
            labels: labels,
            datasets: [
                {
                    label: "% Masuk",
                    data: percMasukHarian,
                    backgroundColor: "#D1FAE5",
                    hoverBackgroundColor: "#10B981",
                    borderRadius: 2
                },
                {
                    label: "% Keluar",
                    data: percKeluarHarian,
                    backgroundColor: "#FEE2E2",
                    hoverBackgroundColor: "#EF4444",
                    borderRadius: 2
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: { stacked: true, grid: { display: false } },
                y: { stacked: true, display: false, max: 100 }
            }
        }
    });
}

// ==================== FUNGSI EXPORT KE PDF (KHUSUS APK/MOBILE) ====================
function executePrint() {
    const btnSave = document.querySelector("#modal-cetak .btn-save");
    const originalText = btnSave.innerHTML;
    btnSave.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Memproses PDF...`;
    btnSave.disabled = true;

    const startVal = document.getElementById("cetak-start").value;
    const endVal = document.getElementById("cetak-end").value;

    const startDate = startVal ? new Date(startVal).setHours(0, 0, 0, 0) : null;
    const endDate = endVal ? new Date(endVal).setHours(23, 59, 59, 999) : null;

    let filteredData = [];
    let totalMasuk = 0;
    let totalKeluar = 0;
    const namaBulan = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "Mei",
        "Jun",
        "Jul",
        "Ags",
        "Sep",
        "Okt",
        "Nov",
        "Des"
    ];

    // Saring data berdasarkan tanggal
    dataTrxGlobal.forEach(item => {
        let isValid = true;
        let trxDate = null;
        let rawStr = (item.tanggal || "").toString().trim();

        if (rawStr.includes("T")) {
            let datePart = rawStr.split("T")[0];
            let [y, m, d] = datePart.split("-");
            trxDate = new Date(
                parseInt(y),
                parseInt(m) - 1,
                parseInt(d)
            ).getTime();
        } else {
            let p = rawStr.split(" ");
            if (p.length === 3) {
                let mIndex = namaBulan.indexOf(p[1]);
                if (mIndex !== -1)
                    trxDate = new Date(
                        parseInt(p[2]),
                        mIndex,
                        parseInt(p[0])
                    ).getTime();
            }
        }

        if (trxDate) {
            if (startDate && trxDate < startDate) isValid = false;
            if (endDate && trxDate > endDate) isValid = false;
        }

        if (isValid) {
            filteredData.push(item);
            let nominal =
                parseInt(
                    (item.nominal || "0").toString().replace(/[^0-9]/g, "")
                ) || 0;
            let jenis = (item.jenis || "").toLowerCase().trim();
            if (jenis === "pemasukan") totalMasuk += nominal;
            if (jenis === "pengeluaran") totalKeluar += nominal;
        }
    });

    // Rancang HTML murni khusus untuk diproses menjadi PDF
    let printHtml = `
        <div style="padding: 30px; font-family: sans-serif; color: black; background: white;">
            <div style="text-align:center; margin-bottom: 25px;">
                <h2 style="margin: 0 0 5px 0; color: #1a73e8;">Laporan Transaksi FinToDo</h2>
                <p style="margin: 0; color: #555; font-size: 14px;">Periode: ${startVal || "Awal"} s/d ${endVal || "Akhir"}</p>
            </div>
            <table style="width: 100%; border-collapse: collapse; font-size: 12px; margin-bottom: 20px;">
                <thead>
                    <tr style="background-color: #f0f0f0;">
                        <th style="border: 1px solid #ccc; padding: 10px; text-align: left;">Tanggal</th>
                        <th style="border: 1px solid #ccc; padding: 10px; text-align: left;">Kategori</th>
                        <th style="border: 1px solid #ccc; padding: 10px; text-align: left;">Judul Transaksi</th>
                        <th style="border: 1px solid #ccc; padding: 10px; text-align: right;">Nominal</th>
                    </tr>
                </thead>
                <tbody>
    `;

    if (filteredData.length > 0) {
        filteredData.forEach(item => {
            let nominalRp = formatRupiah(
                (item.nominal || "0").toString().replace(/[^0-9]/g, "")
            );
            let jenis = (item.jenis || "").toUpperCase();
            let color = jenis === "PEMASUKAN" ? "green" : "red";
            printHtml += `
                <tr>
                    <td style="border: 1px solid #ccc; padding: 8px;">${item.tanggal || "-"}</td>
                    <td style="border: 1px solid #ccc; padding: 8px; font-weight:bold; color:${color};">${jenis}</td>
                    <td style="border: 1px solid #ccc; padding: 8px;">${item.judul || "-"}</td>
                    <td style="border: 1px solid #ccc; padding: 8px; text-align:right;">${nominalRp}</td>
                </tr>
            `;
        });
    } else {
        printHtml += `<tr><td colspan="4" style="text-align:center; padding: 15px; border: 1px solid #ccc;">Tidak ada data pada periode ini</td></tr>`;
    }

    printHtml += `
                </tbody>
            </table>
            <div style="float: right; text-align: right; font-weight: bold; font-size: 14px;">
                <p style="margin: 5px 0;">Total Pemasukan : <span style="color:green;">${formatRupiah(totalMasuk)}</span></p>
                <p style="margin: 5px 0;">Total Pengeluaran : <span style="color:red;">${formatRupiah(totalKeluar)}</span></p>
                <hr style="border-top: 2px solid #000; margin: 10px 0;">
                <p style="margin: 5px 0; font-size: 16px;">Saldo Bersih : ${formatRupiah(totalMasuk - totalKeluar)}</p>
            </div>
            <div style="clear: both;"></div>
        </div>
    `;

    // Penamaan file dinamis
    let now = new Date();
    let year = now.getFullYear();
    let month = String(now.getMonth() + 1).padStart(2, "0");
    let day = String(now.getDate()).padStart(2, "0");
    let dynamicFileName = `${year}${month}${day}RekapData.pdf`;

    // Buat wadah sementara untuk di-render oleh html2pdf
    let element = document.createElement("div");
    element.innerHTML = printHtml;

    // Konfigurasi Kualitas PDF
    let opt = {
        margin: 0.5,
        filename: dynamicFileName,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: "in", format: "a4", orientation: "portrait" }
    };

    // Eksekusi Pembuatan PDF
    html2pdf()
        .set(opt)
        .from(element)
        .save()
        .then(() => {
            closeModal("modal-cetak");
            btnSave.innerHTML = originalText;
            btnSave.disabled = false;
            alert("Laporan PDF berhasil diunduh!");
        })
        .catch(err => {
            console.error(err);
            btnSave.innerHTML = originalText;
            btnSave.disabled = false;
            alert("Gagal membuat PDF.");
        });
}
