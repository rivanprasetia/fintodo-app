// FRAGMENT APPBAR
const viewAppbar = `
<div class="header-wrapper">
    <div class="header-bg">
        <h1 class="header-title" id="app-title">Selamat Datang!</h1>
        <p class="header-subtitle" id="app-subtitle">Ringkasan Keuangan Anda</p>
    </div>
</div>
`;

// FRAGMENT BOTTOM NAV
const viewNav = `
<nav class="bottom-nav">
    <div class="nav-item active" id="nav-home" onclick="navigate('home')">
        <i class="fa-solid fa-house"></i><span>Home</span>
    </div>
    <div class="nav-item" id="nav-todo" onclick="navigate('todo')">
        <i class="fa-solid fa-list-check"></i><span>to-Do</span>
    </div>
    <div class="nav-item" id="nav-grafik" onclick="navigate('grafik')">
        <i class="fa-solid fa-chart-column"></i><span>Grafik</span>
    </div>
</nav>
`;
// FRAGMENT MODALS
// FRAGMENT MODALS
const viewModals = `
<!-- (Modal Tambah, Hapus, Filter yang lama tetap ada di dalam pikiran aplikasi, tapi mari kita tambahkan Modal Cetak) -->

<div class="modal-overlay hidden" id="modal-form">
    <div class="modal-content">
        <h3 id="modal-title">Tambah Data</h3>
        <div class="form-group"><label>Jenis</label><select id="input-kategori" class="form-control"><option value="pemasukan">Pemasukan</option><option value="pengeluaran">Pengeluaran</option></select></div>
        <div class="form-group"><label>Judul Transaksi</label><input type="text" id="input-nama" class="form-control" placeholder="Contoh: Gaji Bulanan"></div>
        <div class="form-group"><label>Nominal (Rp)</label><input type="number" id="input-nominal" class="form-control" placeholder="0"></div>
        <div style="display: flex; gap: 10px;">
            <div class="form-group" style="flex: 1;"><label>Tanggal</label><input type="date" id="input-tanggal" class="form-control"></div>
            <div class="form-group" style="flex: 1;"><label>Jam</label><input type="time" id="input-jam" class="form-control"></div>
        </div>
        <div class="form-group"><label>Catatan (Opsional)</label><textarea id="input-catatan" class="form-control" rows="2"></textarea></div>
        <div class="modal-actions"><button class="btn-cancel" onclick="closeModal('modal-form')">Batal</button><button class="btn-save" onclick="saveData()">Simpan</button></div>
    </div>
</div>

<div class="modal-overlay hidden" id="modal-hapus">
    <div class="modal-content">
        <h3>Konfirmasi Hapus</h3>
        <p style="font-size:13px; text-align:center; color:gray; margin-bottom:15px;">Yakin ingin menghapus <strong id="hapus-item-name" style="color:black;">Item</strong>?</p>
        <div class="modal-actions"><button class="btn-cancel" onclick="closeModal('modal-hapus')">Batal</button><button class="btn-danger-bg" onclick="confirmDelete()">Hapus</button></div>
    </div>
</div>

<div class="modal-overlay hidden" id="modal-filter">
    <div class="modal-content">
        <h3 id="modal-title">Filter Berdasarkan Tanggal</h3>
        <div class="form-group"><label>Dari Tanggal</label><input type="date" id="filter-start" class="form-control"></div>
        <div class="form-group"><label>Sampai Tanggal</label><input type="date" id="filter-end" class="form-control"></div>
        <div class="modal-actions"><button class="btn-cancel" onclick="resetFilter()">Reset Filter</button><button class="btn-save" onclick="applyFilter()">Terapkan</button></div>
    </div>
</div>

<!-- INI MODAL BARU KHUSUS CETAK PDF -->
<div class="modal-overlay hidden" id="modal-cetak">
    <div class="modal-content">
        <h3 id="modal-title">Cetak Laporan PDF</h3>
        <p style="font-size:12px; text-align:center; color:gray; margin-bottom:15px;">Pilih rentang tanggal untuk dicetak.</p>
        <div class="form-group">
            <label>Dari Tanggal</label>
            <input type="date" id="cetak-start" class="form-control">
        </div>
        <div class="form-group">
            <label>Sampai Tanggal</label>
            <input type="date" id="cetak-end" class="form-control">
        </div>
        <div class="modal-actions">
            <button class="btn-cancel" onclick="closeModal('modal-cetak')">Batal</button>
            <button class="btn-save" onclick="executePrint()">Cetak PDF</button>
        </div>
    </div>
</div>
`;


// KONTEN INDEX / HOME
const viewHome = `
<div class="content-body">
    <div class="summary-grid">
        <div class="summary-card" style="border-bottom: 4px solid var(--success);">
            <div class="summary-label">Total Pemasukan</div>
            <div class="summary-amount text-success" id="total-pemasukan">Rp 0</div>
        </div>
        <div class="summary-card" style="border-bottom: 4px solid var(--danger);">
            <div class="summary-label">Total Pengeluaran</div>
            <div class="summary-amount text-danger" id="total-pengeluaran">Rp 0</div>
        </div>
    </div>

    <div class="saldo-card-gradient">
        <div>
            <div class="saldo-label">Saldo Total</div>
            <div class="saldo-amount" id="saldo-total">Rp 0</div>
        </div>
        <i class="fa-solid fa-wallet" style="font-size: 32px; opacity: 0.8;"></i>
    </div>

    <div class="section-card">
        <div class="section-header">
            <h3>Transaksi Terbaru</h3>
            <i class="fa-solid fa-clock-rotate-left text-gray" style="font-size: 14px;"></i>
        </div>
        <!-- INI WADAH UNTUK LIST TRANSAKSI HOME -->
        <div class="trx-list" id="trx-list-home">
            <div style="text-align:center; padding: 20px; color:gray; font-size:12px;">Memuat data...</div>
        </div>
    </div>
</div>
`;


// KONTEN TO-DO
const viewTodo = `
<div class="content-body">
    <div class="section-card">
        <div class="tabs">
            <div class="tab active" onclick="filterTab(this)">Semua</div>
            <div class="tab" onclick="filterTab(this)">Pemasukan</div>
            <div class="tab" onclick="filterTab(this)">Pengeluaran</div>
        </div>
        
        <button class="btn-outline" onclick="openModal('tambah')" style="width: 100%;">
            <i class="fa-solid fa-plus"></i> Tambah Data Baru
        </button>
        
        <!-- INI WADAH IKON KALENDERNYA (RATA KANAN) -->
        <div style="display: flex; justify-content: flex-end; margin-top: 15px;">
            <div onclick="openModal('filter')" style="padding: 5px; cursor: pointer; color: var(--primary-blue);">
                <i class="fa-solid fa-calendar-day" style="font-size: 24px;"></i>
            </div>
        </div>
        
        <div class="trx-list mt-15" id="trx-list-todo">
            <div style="text-align:center; padding: 20px; color:gray; font-size:12px;">Memuat data...</div>
        </div>
    </div>
</div>
`;


// KONTEN GRAFIK (DI SINI TOMBOL CETAK KITA UBAH ARAHNYA)
const viewGrafik = `
<div class="content-body">
    <div class="section-card">
        <div class="section-header">
            <h3>Pemasukan vs Pengeluaran (7 Hari)</h3>
        </div>
        <div class="chart-container">
            <canvas id="chartUtama"></canvas>
        </div>
    </div>

    <div class="percentage-grid">
        <div class="perc-card perc-in">
            <div class="perc-value">0%</div>
            <div class="perc-label">Porsi Pemasukan</div>
        </div>
        <div class="perc-card perc-out">
            <div class="perc-value">0%</div>
            <div class="perc-label">Porsi Pengeluaran</div>
        </div>
    </div>

    <div class="section-card">
        <div class="section-header">
            <h3>Persentase Harian</h3>
        </div>
        <div class="chart-container">
            <canvas id="chartPersentase"></canvas>
        </div>
    </div>
    
    <!-- Tombol ini sekarang memanggil openModal('cetak') -->
    <button class="btn-print" onclick="openModal('cetak')">
        <i class="fa-solid fa-print"></i> Cetak Laporan PDF
    </button>
</div>
`;



// Fungsi mengubah angka menjadi format Rupiah (Contoh: 5000000 -> Rp 5.000.000)
function formatRupiah(angka) {
    let parsed = parseInt(angka) || 0;
    return "Rp " + parsed.toLocaleString("id-ID");
}

// JANGAN DIHAPUS: Ini cetakan untuk merender data asli dari Google Sheet ke HTML
function generateTrxHTML(judul, jenis, nominal, tgl, jam, catatan) {
    let badgeClass =
        jenis.toLowerCase() === "pemasukan" ? "badge-in" : "badge-out";
    let textClass =
        jenis.toLowerCase() === "pemasukan" ? "text-success" : "text-danger";
    let sign = jenis.toLowerCase() === "pemasukan" ? "+" : "-";
    let catatanHTML = catatan
        ? `<div class="trx-notes"><i class="fa-regular fa-note-sticky"></i> ${catatan}</div>`
        : "";

    // Format nominal ke Rupiah
    let nominalRupiah = formatRupiah(nominal).replace("Rp ", "");

    return `
    <div class="trx-item-wrapper">
        <div class="trx-header">
            <div class="trx-title-area">
                <div class="trx-title">${judul}</div>
                <div class="badge ${badgeClass}">${jenis.toUpperCase()}</div>
            </div>
            <div class="trx-amount-large ${textClass}">${sign}Rp ${nominalRupiah}</div>
        </div>
        <div class="trx-details">
            <div class="trx-datetime">
                <span><i class="fa-regular fa-calendar"></i> ${tgl}</span>
                <span><i class="fa-regular fa-clock"></i> ${jam}</span>
            </div>
            ${catatanHTML}
        </div>
        <div class="action-row action-icons">
            <i class="fa-solid fa-pen text-blue" onclick="openModal('edit', '${judul}', '${jenis}', '${nominal}')"></i>
            <i class="fa-solid fa-trash text-danger" onclick="openModal('hapus', '${judul}')"></i>
        </div>
    </div>
    `;
}
