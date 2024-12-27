// Mengambil elemen tautan navigasi
const daftarSidikJariLink = document.getElementById("daftar-sidikjari");
const listKandidatLink = document.getElementById("list-kandidat");
const hasilSuaraLink = document.getElementById("hasil-suara");
const daftarOperatorLink = document.getElementById("daftar-operator");

// Elemen form box dan konten utama
const formBox = document.getElementById("form-box");
const mainContent = document.querySelector(".main-content");

// Variabel untuk menyimpan mode update dan ID operator yang sedang diedit
let updateMode = false;
let currentidOperator = null;

// Fungsi untuk mengatur tampilan konten dan tautan aktif
function setActiveLink(linkElement, content, showTable = false) {
    document.querySelectorAll(".nav-link").forEach(link => link.classList.remove("active"));
    linkElement.classList.add("active");

    mainContent.innerHTML = `<h1 class="info">${content}</h1>`;
    if (showTable) {
        if (linkElement === listKandidatLink) {
            showKandidatTable(); // Tampilkan tabel kandidat
        } else if (linkElement === hasilSuaraLink) {
            showHasilSuara(); // Tampilkan tabel hasil suara
        }
    }
}

listKandidatLink.addEventListener("click", (event) => {
    event.preventDefault();
    setActiveLink(listKandidatLink, "Tidak Ada List Kandidat", true);
});

hasilSuaraLink.addEventListener("click", (event) => {
    event.preventDefault();
    setActiveLink(hasilSuaraLink, "Tidak Ada Hasil Suara", true);
});

// Fungsi untuk menampilkan tabel sidik jari di halaman admin
function showKandidatTable() {
    const kandidatRef = firebase.database().ref('Daftar Kandidat');
    kandidatRef.on('value', (snapshot) => {
        mainContent.innerHTML = "";

        // Tampilkan Daftar Sidik Jari
        if (snapshot.exists()) {
            // Membuat elemen div baru dengan kelas table-responsive
            const responsiveDiv = document.createElement("div");
            responsiveDiv.classList.add("table-responsive");

            const table = document.createElement("table");
            table.classList.add("table", "table-striped");
            table.style.fontSize = "14px";
            const thead = document.createElement("thead");
            const headerRow = document.createElement("tr");
            ["Nama Kandidat", "Foto Profil", "Visi & Misi", "Status Kandidat"].forEach(text => {
                const th = document.createElement("th");
                th.textContent = text;
                headerRow.appendChild(th);
            });
            thead.appendChild(headerRow);
            table.appendChild(thead);

            const tbody = document.createElement("tbody");
            snapshot.forEach((childSnapshot) => {
                const kandidatData = childSnapshot.val();
                const row = document.createElement("tr");

                // Menampilkan data sidik jari tanpa kolom aksi
                ["namaKandidat", "fotoProfilKandidat", "visiMisiKandidat", "kandidatJenis"].forEach((key, index )=> {
                    const cell = document.createElement("td");
                    if (index === 1) { // Foto Profil
                        // Membuat link baru
                        const link = document.createElement("a");
                        link.href = kandidatData[key]; // Mengatur href link ke nilai foto
                        link.target = "_blank"; // Membuka link di tab baru
                        link.textContent = "Lihat Foto";

                        cell.appendChild(link); // Menambahkan link ke cell
                    } else {
                        cell.textContent = kandidatData[key];
                    }
                    row.appendChild(cell);
                });

                tbody.appendChild(row);
            });
            table.appendChild(tbody);
            responsiveDiv.appendChild(table);
            mainContent.appendChild(responsiveDiv);
        } else {
            mainContent.innerHTML = "<h1 class='info'>Tidak Ada Daftar Kandidat</h1>";
        }
    });
}

// Event listener untuk tombol logout
document.getElementById("logoutButton").addEventListener("click", function() {
    // Konfirmasi logout dengan alert
    if (confirm("Apakah Anda yakin ingin keluar?")) {
        // Hapus data pengguna dari local storage
        localStorage.removeItem('currentUser');

        // Redirect ke halaman login atau halaman utama
        window.location.href = "mahasiswa.html"; // URL halaman login yang sesuai
    }
});

// Fungsi untuk menampilkan hasil suara
function showHasilSuara() {
    const maperwaRef = firebase.database().ref('MAPERWA');
    const presidenBemRef = firebase.database().ref('PRESIDEN_BEM');

    const hasilSuaraDiv = document.createElement('div');
    hasilSuaraDiv.classList.add('container', 'mt-4');

    // Menampilkan header hasil suara untuk MAPERWA
    // const maperwaHeader = document.createElement('h2');
    // maperwaHeader.textContent = 'Hasil Suara Ketua Umum MAPERWA';
    // maperwaHeader.style.fontSize = "20px";
    // hasilSuaraDiv.appendChild(maperwaHeader);

    const maperwaTable = document.createElement('table');
    maperwaTable.classList.add('table', 'table-striped');
    maperwaTable.style.fontSize = "14px";
    const maperwaThead = document.createElement('thead');
    const maperwaHeaderRow = document.createElement('tr');
    ['Kandidat Ketua Umum MAPERWA', 'Jumlah Suara', 'Persentase'].forEach(text => {
        const th = document.createElement('th');
        th.textContent = text;
        maperwaHeaderRow.appendChild(th);
    });
    maperwaThead.appendChild(maperwaHeaderRow);
    maperwaTable.appendChild(maperwaThead);

    const maperwaTbody = document.createElement('tbody');
    maperwaRef.on('value', (snapshot) => {
        maperwaTbody.innerHTML = ''; // Bersihkan tabel sebelum diisi ulang
        let totalSuara = 0;

        if (snapshot.exists()) {
            snapshot.forEach((childSnapshot) => {
                totalSuara += childSnapshot.val(); // Hitung total suara
            });
        }
        snapshot.forEach((childSnapshot) => {
            const kandidat = childSnapshot.key;
            const jumlahSuara = childSnapshot.val();
            const maperwaRow = document.createElement('tr');
            const kandidatCell = document.createElement('td');
            kandidatCell.textContent = kandidat;
            const jumlahSuaraCell = document.createElement('td');
            jumlahSuaraCell.textContent = jumlahSuara;

            // Hitung persentase
            const persentase = totalSuara > 0 ? ((jumlahSuara / totalSuara) * 100).toFixed(2) + '%' : '0%';
            const persentaseCell = document.createElement('td');
            persentaseCell.textContent = persentase;

            maperwaRow.appendChild(kandidatCell);
            maperwaRow.appendChild(jumlahSuaraCell);
            maperwaRow.appendChild(persentaseCell);
            maperwaTbody.appendChild(maperwaRow);
        });
        maperwaTable.appendChild(maperwaTbody);
        hasilSuaraDiv.appendChild(maperwaTable);
    });
    
    // Menampilkan header hasil suara untuk PRESIDEN BEM
    // const presidenBemHeader = document.createElement('h2');
    // presidenBemHeader.textContent = 'Hasil Suara Presiden BEM';
    // presidenBemHeader.style.fontSize = "20px";
    // hasilSuaraDiv.appendChild(presidenBemHeader);

    const presidenBemTable = document.createElement('table');
    presidenBemTable.classList.add('table', 'table-striped');
    presidenBemTable.style.fontSize = "14px";
    const presidenBemThead = document.createElement('thead');
    const presidenBemHeaderRow = document.createElement('tr');
    ['Kandidat Presiden BEM', 'Jumlah Suara', 'Persentase'].forEach(text => {
        const th = document.createElement('th');
        th.textContent = text;
        presidenBemHeaderRow.appendChild(th);
    });
    presidenBemThead.appendChild(presidenBemHeaderRow);
    presidenBemTable.appendChild(presidenBemThead);

    const presidenBemTbody = document.createElement('tbody');
    presidenBemRef.on('value', (snapshot) => {
        presidenBemTbody.innerHTML = ''; // Bersihkan tabel sebelum diisi ulang
        let totalSuara = 0;

        if (snapshot.exists()) {
            snapshot.forEach ((childSnapshot) => {
                totalSuara += childSnapshot.val(); // Hitung total suara
            });
        }
        snapshot.forEach((childSnapshot) => {
            const kandidat = childSnapshot.key;
            const jumlahSuara = childSnapshot.val();
            const presidenBemRow = document.createElement('tr');
            const kandidatCell = document.createElement('td');
            kandidatCell.textContent = kandidat;
            const jumlahSuaraCell = document.createElement('td');
            jumlahSuaraCell.textContent = jumlahSuara;
            // Hitung persentase
            const persentase = totalSuara > 0 ? ((jumlahSuara / totalSuara) * 100).toFixed(2) + '%' : '0%';
            const persentaseCell = document.createElement('td');
            persentaseCell.textContent = persentase;

            presidenBemRow.appendChild(kandidatCell);
            presidenBemRow.appendChild(jumlahSuaraCell);
            presidenBemRow.appendChild(persentaseCell);
            presidenBemTbody.appendChild(presidenBemRow);
        });
        presidenBemTable.appendChild(presidenBemTbody);
        hasilSuaraDiv.appendChild(presidenBemTable);
    });

    // Periksa localStorage untuk status visibilitas
    const storedVisibility = localStorage.getItem('isTableVisible');
    if (storedVisibility === 'false') {
        hasilSuaraDiv.querySelectorAll('table').forEach(table => table.style.display = 'none'); // Sembunyikan tabel
    }

    // Menampilkan hasil suara di mainContent
    mainContent.innerHTML = ''; // Bersihkan konten sebelumnya
    mainContent.appendChild(hasilSuaraDiv);
}

// Event listener untuk tautan hasil suara
hasilSuaraLink.addEventListener("click", (event) => {
    event.preventDefault();
    showHasilSuara();
});



// PROFIL
let currentUser  = JSON.parse(localStorage.getItem('currentUser ')); // Ambil data pengguna dari localStorage

function displayKandidatProfile() {
    if (currentUser ) {
        const profileNameElement = document.getElementById("profileName");
        profileNameElement.innerText = currentUser.namaKandidat; // Ganti dengan field yang sesuai
        profileNameElement.style.cursor = "pointer"; // Menunjukkan bahwa ini dapat diklik

        // Tambahkan event listener untuk mengubah warna saat diklik
        profileNameElement.addEventListener("click", () => {
            // Hapus kelas 'clicked' dari semua elemen dengan kelas yang sama
            document.querySelectorAll('.clicked').forEach(el => el.classList.remove('clicked'));
            // Tambahkan kelas 'clicked' pada elemen yang diklik
            profileNameElement.classList.add('clicked');
            showKandidatDetail(); // Tampilkan detail kandidat
        });

        document.getElementById("profileRole").innerText = currentUser.namaPenggunaKandidat; // Ganti dengan field yang sesuai
        document.getElementById("profileCard").style.display = "block"; // Tampilkan profil
    } else {
        document.getElementById("profileCard").style.display = "none"; // Sembunyikan jika tidak ada pengguna yang login
    }
}

// Pastikan untuk memanggil fungsi ini saat halaman dimuat
document.addEventListener("DOMContentLoaded", () => {
    displayKandidatProfile();
});
// PROFIL 



function showKandidatDetail() {
    const kandidatId = currentUser .IDKandidat; // Ganti dengan field yang sesuai untuk ID kandidat
    const kandidatRef = firebase.database().ref(`Daftar Kandidat/${kandidatId}`);

    kandidatRef.once('value', (snapshot) => {
        if (snapshot.exists()) {
            const kandidatData = snapshot.val();
            mainContent.innerHTML = ""; // Bersihkan konten sebelumnya

            // Buat elemen tabel untuk menampilkan detail kandidat
            const detailTable = document.createElement('table');
            detailTable.classList.add('table', 'table-bordered', 'table-striped');
            detailTable.style.fontSize = "14px";

            const thead = document.createElement('thead');
            const headerRow = document.createElement('tr');
            ['Field', 'Value'].forEach(text => {
                const th = document.createElement('th');
                th.textContent = text;
                headerRow.appendChild(th);
            });
            thead.appendChild(headerRow);
            detailTable.appendChild(thead);

            const tbody = document.createElement('tbody');

            // Menambahkan data kandidat ke dalam tabel
            const fields = [
                { label: 'Nama Kandidat', value: kandidatData.namaKandidat },
                { label: 'Foto Profil', value: `<a href="${kandidatData.fotoProfilKandidat}" target="_blank">Lihat Foto</a>` },
                { label: 'Visi & Misi', value: kandidatData.visiMisiKandidat }
            ];

            fields.forEach(field => {
                const row = document.createElement('tr');
                const labelCell = document.createElement('td');
                labelCell.textContent = field.label;
                const valueCell = document.createElement('td');
                valueCell.innerHTML = field.value; // Menggunakan innerHTML untuk menampilkan gambar

                row.appendChild(labelCell);
                row.appendChild(valueCell);
                tbody.appendChild(row);
            });

            // Tambahkan kolom aksi dengan satu tombol edit
            const actionRow = document.createElement('tr');
            const actionCell = document.createElement('td');
            actionCell.colSpan = 2; // Menggabungkan dua kolom untuk tombol edit
            const editButton = document.createElement('button');
            editButton.textContent = 'Edit';
            editButton.classList.add('btn', 'btn-primary');
            editButton.addEventListener('click', () => {
                // Isi form dengan data kandidat dan tampilkan modal
                document.getElementById('namaKandidat').value = kandidatData.namaKandidat;
                document.getElementById('fotoProfil').value = kandidatData.fotoProfilKandidat;
                document.getElementById('visiMisi').value = kandidatData.visiMisiKandidat;

                // Tampilkan modal
                const updateKandidatModal = new bootstrap.Modal(document.getElementById('updateKandidatModal'));
                updateKandidatModal.show();
            });

            actionCell.appendChild(editButton);
            actionRow.appendChild(actionCell);
            tbody.appendChild(actionRow);

            detailTable.appendChild(tbody);
            mainContent.appendChild(detailTable);
        } else {
            mainContent.innerHTML = "<h1 class='info'>Detail Kandidat Tidak Ditemukan</h1>";
        }
    });
}

document.getElementById('updateForm').addEventListener('submit', (event) => {
    event.preventDefault();

    // Ambil nilai dari input
    const namaKandidat = document.getElementById('namaKandidat').value;
    const fotoProfil = document.getElementById('fotoProfil').value;
    const visiMisi = document.getElementById('visiMisi').value;

    // Validasi: Periksa apakah ada field yang kosong
    if (!namaKandidat || !fotoProfil || !visiMisi) {
        alert("Semua field harus diisi!");
        return; // Hentikan eksekusi jika ada field yang kosong
    }

    const updatedData = {
        namaKandidat: namaKandidat,
        fotoProfilKandidat: fotoProfil,
        visiMisiKandidat: visiMisi
    };

    // Perbarui data kandidat di Firebase
    const kandidatId = currentUser.IDKandidat; // Ganti dengan field yang sesuai untuk ID kandidat
    const kandidatRef = firebase.database().ref(`Daftar Kandidat/${kandidatId}`);
    
    kandidatRef.update(updatedData)
        .then(() => {
            alert("Data kandidat berhasil diperbarui.");
            // Tutup modal setelah update
            const updateKandidatModal = bootstrap.Modal.getInstance(document.getElementById('updateKandidatModal'));
            updateKandidatModal.hide();
            showKandidatDetail(); // Tampilkan detail kandidat yang diperbarui
        })
        .catch((error) => {
            console.error("Error updating data: ", error);
            alert("Terjadi kesalahan saat memperbarui data.");
        });
});