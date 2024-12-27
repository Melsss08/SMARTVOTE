#include <Adafruit_Fingerprint.h>

// Definisikan pin untuk RX dan TX
#define RX_PIN 18  // Hubungkan ke TX dari sensor
#define TX_PIN 19  // Hubungkan ke RX dari sensor

// Buat objek fingerprint
Adafruit_Fingerprint finger = Adafruit_Fingerprint(&Serial2);

void setup() {
  Serial.begin(115200);
  Serial2.begin(57600, SERIAL_8N1, RX_PIN, TX_PIN);
  
  Serial.println("Menginisialisasi sensor sidik jari...");

  // Inisialisasi sensor sidik jari
  finger.begin(57600);
  
  // Verifikasi password sensor untuk memastikan sensor siap
  if (finger.verifyPassword()) {
    Serial.println("Sensor sidik jari ditemukan!");
  } else {
    Serial.println("Sensor sidik jari tidak ditemukan.");
    while (1); // Hentikan program jika sensor tidak ditemukan
  }

  // Cek jumlah sidik jari yang tersimpan
  int numFingerprints = finger.getTemplateCount();
  Serial.print("Jumlah sidik jari yang tersimpan: ");
  Serial.println(numFingerprints);

  // Hapus semua data sidik jari
  if (finger.emptyDatabase()) {
    Serial.println("Semua data sidik jari telah dihapus.");
  } else {
    Serial.println("Gagal menghapus data sidik jari.");
  }
}

void loop() {
  // Tidak ada aksi yang diperlukan di loop
}