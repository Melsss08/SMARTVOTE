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
        if (linkElement === daftarOperatorLink) {
            showOperatorTable(); // Tampilkan tabel sidik jari
        } else if (linkElement === daftarSidikJariLink) {
            showTablePemilih(); // Tampilkan tabel sidik jari
        } else if (linkElement === listKandidatLink) {
            showKandidatTable(); // Tampilkan tabel kandidat
        } else if (linkElement === hasilSuaraLink) {
            showHasilSuara(); // Tampilkan tabel hasil suara
        }
    }
}

// Event listeners untuk tautan navigasi
daftarSidikJariLink.addEventListener("click", (event) => {
    event.preventDefault();
    setActiveLink(daftarSidikJariLink, "Tidak Ada Daftar Sidik Jari", true);
});

listKandidatLink.addEventListener("click", (event) => {
    event.preventDefault();
    setActiveLink(listKandidatLink, "Tidak Ada List Kandidat", true);
});

hasilSuaraLink.addEventListener("click", (event) => {
    event.preventDefault();
    setActiveLink(hasilSuaraLink, "Tidak Ada Hasil Suara", true);
});

daftarOperatorLink.addEventListener("click", (event) => {
    event.preventDefault();
    setActiveLink(daftarOperatorLink, "Tidak Ada Daftar Operator", true);
});

// Event listener untuk tombol submit operator
mainContent.addEventListener("click", (event) => {
    if (event.target && event.target.id === 'submitOperator') {
        const operatorName = document.getElementById('nama-operator').value;
        const idOperator = document.getElementById('id-operator').value;
        const username = document.getElementById('nama-pengguna').value;
        const password = document.getElementById('kata-sandi').value;

        if (updateMode) {
            updateOperatorData(currentidOperator, operatorName, username, password);
        } else {
            saveOperatorData(operatorName, idOperator, username, password);
        }
    }
});

// Fungsi untuk menampilkan tabel operator
function showOperatorTable() {
    const operatorRef = firebase.database().ref('operator');
    operatorRef.on('value', (snapshot) => {
        mainContent.innerHTML = "";

        if (snapshot.exists()) {
            const table = document.createElement("table");
            table.classList.add("table", "table-striped");
            const thead = document.createElement("thead");
            const headerRow = document.createElement("tr");
            ["Nama Operator", "ID Operator", "Nama Pengguna", "Kata Sandi", "Aksi"].forEach(text => {
                const th = document.createElement("th");
                th.textContent = text;
                headerRow.appendChild(th);
            });
            thead.appendChild(headerRow);
            table.appendChild(thead);

            const tbody = document.createElement("tbody");
            snapshot.forEach((childSnapshot) => {
                const operatorData = childSnapshot.val();
                const row = document.createElement("tr");

                ["namaOperator", "idOperator", "namaPengguna", "kataSandi"].forEach(key => {
                    const cell = document.createElement("td");
                    cell.textContent = operatorData[key];
                    row.appendChild(cell);
                });

                const actionCell = document.createElement("td");
                const editButton = document.createElement("button");
                editButton.textContent = "Edit";
                editButton.classList.add("btn", "btn-warning", "btn-sm", "me-2");
                editButton.addEventListener("click", () => editOperator(childSnapshot.key, operatorData));
                actionCell.appendChild(editButton);

                const deleteButton = document.createElement("button");
                deleteButton.textContent = "Hapus";
                deleteButton.classList.add("btn", "btn-danger", "btn-sm");
                deleteButton.addEventListener("click", () => deleteOperator(childSnapshot.key));
                actionCell.appendChild(deleteButton);

                row.appendChild(actionCell);
                tbody.appendChild(row);
            });
            table.appendChild(tbody);
            mainContent.appendChild(table);
        } else {
            mainContent.innerHTML = "<h1 class='info'>Tidak Ada Daftar Operator</h1>";
        }

        // Membuat elemen div baru sebagai wadah (wrapper) untuk tombol
        const buttonWrapper = document.createElement("div");
        buttonWrapper.classList.add("d-flex", "justify-content-end", "w-100", "my-3");

        // Membuat tombol
        const button = document.createElement("button");
        button.type = "button";
        button.classList.add("btn", "btn-primary");
        button.textContent = "Tambah Operator";

        // Tambahkan tombol ke dalam wrapper, lalu ke mainContent
        buttonWrapper.appendChild(button);
        mainContent.prepend(buttonWrapper);

        button.addEventListener("click", () => {
            // Isi ulang mainContent dengan formBox saat tombol diklik
            mainContent.innerHTML = formBox.outerHTML; // Salin formBox ke mainContent

            // Tampilkan form dengan display block
            const displayedFormBox = mainContent.querySelector("#form-box");
            displayedFormBox.style.display = "block";
        });
    });
}

// Fungsi untuk menampilkan form operator
function showOperatorForm() {
    mainContent.innerHTML = formBox.outerHTML;
    const displayedFormBox = mainContent.querySelector("#form-box");
    displayedFormBox.style.display = "block";
}

// Fungsi untuk menyimpan data operator ke Realtime Database
function saveOperatorData(operatorName, idOperator, username, password) {
    firebase.database().ref('operator/' + idOperator).set({
        namaOperator: operatorName,
        idOperator: idOperator,
        namaPengguna: username,
        kataSandi: password
    }).then(() => {
        alert('Operator berhasil ditambahkan');
        resetForm();
        showOperatorTable();
    })
}

// Fungsi untuk mengedit data operator
function editOperator(idOperator, operatorData) {
    showOperatorForm();
    const displayedFormBox = mainContent.querySelector("#form-box");
    displayedFormBox.querySelector('#nama-operator').value = operatorData.namaOperator;
    displayedFormBox.querySelector('#id-operator').value = operatorData.idOperator; // Pastikan ini tidak diubah
    displayedFormBox.querySelector('#nama-pengguna').value = operatorData.namaPengguna;
    displayedFormBox.querySelector('#kata-sandi').value = operatorData.kataSandi;
    document.getElementById('submitOperator').textContent = "Update Operator";
    updateMode = true;
    currentidOperator = idOperator; // Simpan idOperator untuk update
}

// Fungsi untuk menghapus operator
function deleteOperator(idOperator) {
    firebase.database().ref(`operator/${idOperator}`).remove()
    .then(() => {
        alert('Operator berhasil dihapus');
        showOperatorTable();
    })
    .catch(error => alert('Gagal menghapus operator: ' + error.message));
}

// Fungsi untuk mengupdate data operator
function updateOperatorData(idOperator, operatorName, username, password) {
    firebase.database().ref(`operator/${idOperator}`).update({
        idOperator: idOperator,
        namaOperator: operatorName,
        namaPengguna: username,
        kataSandi: password
    }).then(() => {
        alert('Operator berhasil diupdate');
        resetForm();
        showOperatorTable();
    });
}

// Fungsi untuk mereset form
function resetForm() {
    mainContent.querySelector("#form-box").reset();
    updateMode = false;
    currentidOperator = null;
    document.getElementById('submitOperator').textContent = "Update Operator";
}

let currentUser  = JSON.parse(localStorage.getItem('currentUser ')); // Ambil data pengguna dari localStorage

// Fungsi untuk menampilkan profil admin
function displayAdminProfile() {
    if (currentUser ) {
        document.getElementById("profileName").innerText = currentUser.Nama;
        document.getElementById("profileRole").innerText = currentUser.namaPengguna;
        document.getElementById("profileCard").style.display = "block"; // Tampilkan profil
    } else {
        document.getElementById("profileCard").style.display = "none"; // Sembunyikan jika tidak ada pengguna yang login
    }
}

// Panggil fungsi untuk menampilkan profil saat halaman dimuat
document.addEventListener("DOMContentLoaded", displayAdminProfile);


// Fungsi untuk menampilkan tabel pemilih
function showTablePemilih() {
    const pemilihRef = firebase.database().ref('pemilih'); // Mengakses data pemilih
    pemilihRef.on('value', (snapshot) => {
        mainContent.innerHTML = "";

        // Tampilkan Daftar Pemilih
        if (snapshot.exists()) {
            // Membuat elemen div baru dengan kelas table-responsive
            const responsiveDiv = document.createElement("div");
            responsiveDiv.classList.add("table-responsive");

            const table = document.createElement("table");
            table.classList.add("table", "table-striped");
            table.style.fontSize = "14px";
            const thead = document.createElement("thead");
            const headerRow = document.createElement("tr");
            ["ID", "Nama", "Status Vote"].forEach(text => {
                const th = document.createElement("th");
                th.textContent = text;
                headerRow.appendChild(th);
            });
            thead.appendChild(headerRow);
            table.appendChild(thead);

            const tbody = document.createElement("tbody");
            snapshot.forEach((childSnapshot) => {
                const pemilihData = childSnapshot.val();
                const row = document.createElement("tr");

                // Menambahkan data ID, Nama, dan Status Vote ke baris tabel
                ["key", "name", "voted"].forEach((key) => {
                    const cell = document.createElement("td");
                    if (key === "key") {
                        cell.textContent = childSnapshot.key; // Menggunakan key sebagai ID
                    } else {
                        cell.textContent = pemilihData[key];
                    }
                    row.appendChild(cell);
                });

                tbody.appendChild(row);
            });
            table.appendChild(tbody);
            responsiveDiv.appendChild(table);
            mainContent.appendChild(responsiveDiv);
        } else {
            mainContent.innerHTML = "<h1 class='info'>Tidak Ada Daftar Pemilih</h1>";
        }
    });
}

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
            ["ID Kandidat", "Nama Pengguna", "Kata Sandi", "Nama Kandidat", "Foto Profil", "Visi & Misi", "Status Kandidat"].forEach(text => {
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

                // Menampilkan data kandidat tanpa kolom aksi
                ["IDKandidat", "namaPenggunaKandidat", "kataSandiKandidat", "namaKandidat", "fotoProfilKandidat", "visiMisiKandidat", "kandidatJenis"].forEach((key, index) => {
                    const cell = document.createElement("td");
                    if (index === 4) { // Foto Profil
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