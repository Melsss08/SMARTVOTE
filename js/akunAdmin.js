// Fungsi untuk menyimpan data operator ke Realtime Database
function saveOperatorData(loginID, loginNama, loginUsername, loginPassword) {
    firebase.database().ref('Akun Admin/' + loginID).set({
        ID: loginID,
        Nama: loginNama,
        namaPengguna: loginUsername,
        kataSandi: loginPassword
    }).then(() => {
        alert('Operator berhasil ditambahkan');
        resetForm();
    })
}

