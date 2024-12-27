const daftarSidikJariLink = document.getElementById("daftar-sidikjari");
const daftarKandidatLink = document.getElementById("daftar-kandidat");
const hasilSuaraLink = document.getElementById("hasil-suara");

// Elemen utama
const formBox = document.getElementById("form-box");
const formBoxSidikJari = document.getElementById("form-box-sidikJari");
const mainContent = document.querySelector(".main-content");

// Variabel untuk menyimpan mode update dan ID operator yang sedang diedit
let updateMode = false;
let currentidKandidat = null;

// Fungsi untuk mengatur tampilan konten dan tautan aktif
// Modifikasi fungsi setActiveLink
function setActiveLink(linkElement, content, showTable = false) {
    // Hapus status aktif dari semua tautan
    document.querySelectorAll(".nav-link").forEach(link => link.classList.remove("active"));
    linkElement.classList.add("active");

    mainContent.innerHTML = `<h1 class="info">${content}</h1>`;
    if (showTable) {
        if (linkElement === daftarSidikJariLink) {
            showTablePemilih(); // Tampilkan tabel sidik jari
        } else {
            showKandidatTable(); // Tampilkan tabel kandidat
        }
    }
}

// Event listener untuk tautan navigasi
daftarSidikJariLink.addEventListener("click", (event) => {
    event.preventDefault();
    setActiveLink(daftarSidikJariLink, "Tidak Ada Daftar Pemilih", true);
});

daftarKandidatLink.addEventListener("click", (event) => {
    event.preventDefault();
    setActiveLink(daftarKandidatLink, "Tidak Ada Daftar Kandidat", true); // Tampilkan tombol
});

hasilSuaraLink.addEventListener("click", (event) => {
    event.preventDefault();
    setActiveLink(hasilSuaraLink, "Tidak Ada Hasil Suara");
});



// Event listener untuk tombol submit operator
mainContent.addEventListener("click", (event) => {
    if (event.target && event.target.id === 'submitKandidat') {
        const idKandidat = document.getElementById('id-kandidat').value;
        const namaPenggunaKandidat = document.getElementById('nama-pengguna-kandidat').value;
        const kataSandiKandidat = document.getElementById('kata-sandi-kandidat').value;
        const namaKandidat = document.getElementById('nama-kandidat').value;
        const visiMisiKandidat = document.getElementById('visiMisi-kandidat').value;
        const fotoProfilKandidat = document.getElementById('foto-profil-kandidat').value;
        const kandidatJenis = document.getElementById('kandidat-jenis').value;

        // Validasi: Pastikan semua field diisi
        if (!idKandidat || !namaPenggunaKandidat || !kataSandiKandidat || !namaKandidat || !fotoProfilKandidat || !visiMisiKandidat || !kandidatJenis) {
            alert('Harap isi semua form sebelum melanjutkan.');
            return; // Hentikan eksekusi jika ada field yang kosong
        }

        if (updateMode) {
            updateKandidatData(currentidKandidat, namaPenggunaKandidat, kataSandiKandidat, namaKandidat, fotoProfilKandidat, visiMisiKandidat, kandidatJenis);
        } else {
            saveKandidatData(idKandidat, namaPenggunaKandidat, kataSandiKandidat, namaKandidat, fotoProfilKandidat, visiMisiKandidat, kandidatJenis);
        }
    }
});

// Event listener untuk tombol submit operator
mainContent.addEventListener("click", (event) => {
    if (event.target && event.target.id === 'submitSidikJari') {
        const idSidikJari = document.getElementById('id-sidikJari').value;
        const namaSidikJari = document.getElementById('nama-sidikJari').value;

        // Validasi: Pastikan semua field diisi
        if (!idSidikJari || !namaSidikJari) {
            alert('Harap isi semua form sebelum melanjutkan.');
            return; // Hentikan eksekusi jika ada field yang kosong
        }

        if (updateMode) {
            updateSidikJariData(currentidSidikJari, namaSidikJari);
        } else {
            saveSidikJariData(idSidikJari, namaSidikJari);
        }
    }
});

// Fungsi untuk menampilkan tabel kandidat
function showKandidatTable() {
    const kandidatRef = firebase.database().ref('Daftar Kandidat');
    kandidatRef.on('value', (snapshot) => {
        mainContent.innerHTML = "";

        // Tampilkan Daftar Kandidat
        if (snapshot.exists()) {
            // Membuat elemen div baru dengan kelas table-responsive
            const responsiveDiv = document.createElement("div");
            responsiveDiv.classList.add("table-responsive");

            const table = document.createElement("table");
            table.classList.add("table", "table-striped");
            table.style.fontSize = "14px";
            const thead = document.createElement("thead");
            const headerRow = document.createElement("tr");
            ["ID Kandidat", "Nama Pengguna", "Kata Sandi", "Nama Kandidat", "Foto Profil", "Visi & Misi", "Status Kandidat", "Aksi"].forEach(text => {
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

                ["IDKandidat", "namaPenggunaKandidat", "kataSandiKandidat", "namaKandidat", "fotoProfilKandidat", "visiMisiKandidat", "kandidatJenis"].forEach((key, index )=> {
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
                
                const actionCell = document.createElement("td");
                const editButton = document.createElement("button");
                editButton.textContent = "Edit";
                editButton.classList.add("btn", "btn-warning", "btn-sm", "me-2");
                editButton.addEventListener("click", () => editKandidatData(childSnapshot.key, kandidatData));
                actionCell.appendChild(editButton);
                
                const deleteButton = document.createElement("button");
                deleteButton.textContent = "Hapus";
                deleteButton.classList.add("btn", "btn-danger", "btn-sm");
                deleteButton.addEventListener("click", () => deleteKandidatData(childSnapshot.key));
                actionCell.appendChild(deleteButton);

                row.appendChild(actionCell);
                tbody.appendChild(row);

            });
            table.appendChild(tbody);
            responsiveDiv.appendChild(table);
            mainContent.appendChild(responsiveDiv);
            
        } else {
            mainContent.innerHTML = "<h1 class='info'>Tidak Ada Daftar Kandidat</h1>";
        }

        // Membuat elemen div baru sebagai wadah (wrapper) untuk tombol
        const newButtonWrapper = document.createElement("div");
        newButtonWrapper.classList.add("d-flex", "justify-content-end", "w-100", "my-3");

        // Membuat tombol "Tambah Kandidat"
        const button = document.createElement("button");
        button.type = "button";
        button.classList.add("btn", "btn-primary");
        button.textContent = "Tambah Kandidat";

        // Tambahkan tombol ke dalam wrapper, lalu ke mainContent
        newButtonWrapper.appendChild(button);
        mainContent.prepend(newButtonWrapper);

        button.addEventListener("click", () => {
            // Isi ulang mainContent dengan formBox saat tombol diklik
            mainContent.innerHTML = formBox.outerHTML; // Salin formBox ke mainContent

            // Tampilkan form dengan display block
            const displayedFormBox = mainContent.querySelector("#form-box");
            displayedFormBox.style.display = "block";
        });
    });
}

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


// Fungsi untuk menampilkan form operator
function showKandidatForm() {
    mainContent.innerHTML = formBox.outerHTML;
    const displayedFormBox = mainContent.querySelector("#form-box");
    displayedFormBox.style.display = "block";
}

// Fungsi untuk menampilkan form operator
// function showFormSidikJari() {
//     mainContent.innerHTML = formBoxSidikJari.outerHTML;
//     const displayedFormBoxSidikJari = mainContent.querySelector("#form-box-sidikJari");
//     displayedFormBoxSidikJari.style.display = "block";
// }

// Fungsi untuk menyimpan data kandidat ke Realtime Database 
function saveKandidatData(idKandidat, namaPenggunaKandidat, kataSandiKandidat, namaKandidat, fotoProfilKandidat, visiMisiKandidat, kandidatJenis) {
    firebase.database().ref('Daftar Kandidat/' + idKandidat).set({
        IDKandidat: idKandidat, 
        namaPenggunaKandidat: namaPenggunaKandidat,
        kataSandiKandidat: kataSandiKandidat,
        namaKandidat: namaKandidat,
        fotoProfilKandidat: fotoProfilKandidat,
        visiMisiKandidat: visiMisiKandidat,
        kandidatJenis: kandidatJenis
    }).then(() => {
        alert('Kandidat berhasil ditambahkan');
        resetForm();
        showKandidatTable();
    });
}
    
        
        // Fungsi untuk menyimpan data operator ke Realtime Database
// function saveKandidatData(idKandidat, namaPenggunaKandidat, kataSandiKandidat, namaKandidat, visiMisiKandidat, kandidatJenis) {
//     const kandidatRef = firebase.database().ref('Daftar Kandidat');
//     const newKandidatRef = kandidatRef.child(idKandidat);
//     newKandidatRef.set({
//         IDKandidat: idKandidat, 
//         namaPenggunaKandidat: namaPenggunaKandidat,
//         kataSandiKandidat: kataSandiKandidat,
//         namaKandidat: namaKandidat,
//         visiMisiKandidat: visiMisiKandidat,
//         kandidatJenis: kandidatJenis
//     }).then(() => {
//         alert('Kandidat berhasil ditambahkan');
//         resetForm();
//         showKandidatTable();
//     });
// }


// Fungsi untuk menyimpan data operator ke Realtime Database
// function saveSidikJariData(key, name, voted) {
//     const sidikJariRef = firebase.database().ref('pemilih');
//     const newSidikJariRef = sidikJariRef.child(key);
//     newSidikJariRef.set({
//         key: key, 
//         name: name,
//         voted: voted
//     }).then(() => {
//         alert('Sidik Jari berhasil ditambahkan');
//         resetForm();
//         showTablePemilih();
//     });
// }

// Fungsi untuk mengedit data operator
function editKandidatData(idKandidat, kandidatData) {
    showKandidatForm();
    const displayedFormBox = mainContent.querySelector("#form-box");
    displayedFormBox.querySelector('#id-kandidat').value = kandidatData.IDKandidat; // Pastikan ini tidak diubah
    displayedFormBox.querySelector('#nama-pengguna-kandidat').value = kandidatData.namaPenggunaKandidat;
    displayedFormBox.querySelector('#kata-sandi-kandidat').value = kandidatData.kataSandiKandidat;
    displayedFormBox.querySelector('#nama-kandidat').value = kandidatData.namaKandidat;
    displayedFormBox.querySelector('#foto-profil-kandidat').value = kandidatData.fotoProfilKandidat;
    displayedFormBox.querySelector('#visiMisi-kandidat').value = kandidatData.visiMisiKandidat;
    displayedFormBox.querySelector('#kandidat-jenis').value = kandidatData.kandidatJenis;
    document.getElementById('submitKandidat').textContent = "Update Kandidat";
    updateMode = true;
    currentidKandidat = idKandidat; // Simpan idkandidat untuk update
}

// Fungsi untuk menghapus kandidat dari database
function deleteKandidatData(idKandidat) {
    firebase.database().ref(`Daftar Kandidat/${idKandidat}`).remove()
    .then(() => {
        alert('Kandidat berhasil dihapus');
        showKandidatTable();
    })
    .catch(error => {
        alert('Gagal menghapus kandidat');
        console.error(error);
    });
}

// Fungsi untuk mengupdate data operator
function updateKandidatData(idKandidat, namaPenggunaKandidat, kataSandiKandidat, namaKandidat, fotoProfilKandidat, visiMisiKandidat, kandidatJenis) {
    firebase.database().ref(`Daftar Kandidat/${idKandidat}`).update({
        IDKandidat: idKandidat,
        namaPenggunaKandidat: namaPenggunaKandidat,
        kataSandiKandidat: kataSandiKandidat,
        namaKandidat: namaKandidat,
        fotoProfilKandidat: fotoProfilKandidat,
        visiMisiKandidat: visiMisiKandidat,
        kandidatJenis: kandidatJenis
    }).then(() => {
        alert('Kandidat berhasil diupdate');
        resetForm();
        showKandidatTable();
    });
}

// Fungsi untuk mereset form
function resetForm() {
    const formBoxElement = mainContent.querySelector("#form-box");
    if (formBoxElement) {
        formBoxElement.reset(); // Hanya memanggil reset jika elemen ada
    }
    updateMode = false;
    currentidKandidat = null;
    document.getElementById('submitKandidat').textContent = "Tambah Kandidat";
}

let currentUser  = JSON.parse(localStorage.getItem('currentUser ')); // Ambil data pengguna dari localStorage

// Fungsi untuk menampilkan profil admin
function displayAdminProfile() {
    if (currentUser ) {
        document.getElementById("profileName").innerText = currentUser.namaOperator; // Ganti dengan field yang sesuai
        document.getElementById("profileRole").innerText = currentUser.namaPengguna; // Ganti dengan field yang sesuai
        document.getElementById("profileCard").style.display = "block"; // Tampilkan profil
    } else {
        document.getElementById("profileCard").style.display = "none"; // Sembunyikan jika tidak ada pengguna yang login
    }
}

// Pastikan untuk memanggil fungsi ini saat halaman dimuat
document.addEventListener("DOMContentLoaded", () => {
    displayAdminProfile();
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
    ['Kandidat Presiden BEM', 'Jumlah Suara', 'Persentase'].forEach((text) => {
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

    // Membuat div untuk tombol
    const buttonWrapper = document.createElement('div');
    buttonWrapper.classList.add('d-flex', 'justify-content-end', 'w-100', 'my-3'); // Mengatur posisi tombol ke kanan

    // Tambahkan tombol untuk menyembunyikan/menampilkan tabel
    const toggleButton = document.createElement('button');
    toggleButton.classList.add('btn', 'btn-primary');
    // toggleButton.style.backgroundColor = '#0D3B5D';
    // toggleButton.style.color = 'white';
    toggleButton.textContent = 'Sembunyikan Tabel Hasil Suara';
    let isTableVisible = true; // Status untuk menandakan apakah tabel terlihat

    // Periksa localStorage untuk status visibilitas
    const storedVisibility = localStorage.getItem('isTableVisible');
    if (storedVisibility === 'false') {
        isTableVisible = false;
        hasilSuaraDiv.querySelectorAll('table').forEach(table => table.style.display = 'none');
        toggleButton.textContent = 'Tampilkan Tabel Hasil Suara';
    }

    toggleButton.addEventListener('click', () => {
        const tables = hasilSuaraDiv.querySelectorAll('table'); // Ambil semua tabel di hasilSuaraDiv
        tables.forEach(table => {
            table.style.display = isTableVisible ? 'none' : 'table'; // Sembunyikan atau tampilkan tabel
        });
        toggleButton.textContent = isTableVisible ? 'Tampilkan Tabel Hasil Suara' : 'Sembunyikan Tabel Hasil Suara'; // Ubah teks tombol
        isTableVisible = !isTableVisible; // Toggle status
        localStorage.setItem('isTableVisible', isTableVisible); // Simpan status ke localStorage
    });

    // Tambahkan tombol ke div hasil
    hasilSuaraDiv.prepend(toggleButton);

    // Tambahkan tombol ke dalam wrapper, lalu ke hasilSuaraDiv
    buttonWrapper.appendChild(toggleButton);
    hasilSuaraDiv.prepend(buttonWrapper); // Tempatkan tombol di atas konten

    // Menampilkan hasil suara di mainContent
    mainContent.innerHTML = ''; // Bersihkan konten sebelumnya
    mainContent.appendChild(hasilSuaraDiv);
}

// Event listener untuk tautan hasil suara
hasilSuaraLink.addEventListener("click", (event) => {
    event.preventDefault();
    showHasilSuara();
});

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