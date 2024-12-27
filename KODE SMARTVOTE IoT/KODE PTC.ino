#include <Adafruit_Fingerprint.h>
#include <HardwareSerial.h>
#include <Arduino.h>
#include <Wire.h>
#include <LiquidCrystal_I2C.h>
#include <WiFi.h>
#include <Firebase_ESP_Client.h>

// Konfigurasi WiFi
#define API_KEY "AIzaSyDPayMyPr6Yr7BACUk65hO5PTdALf5J5Yg"
#define DATABASE_URL "https://smartvote-8f173-default-rtdb.asia-southeast1.firebasedatabase.app/"
#define SSID "POCO M5"
#define PASSWORD "12345678"
#define RX_PIN GPIO_NUM_18
#define TX_PIN GPIO_NUM_19
#define RELAY_PIN1 GPIO_NUM_4 // Ganti dengan pin yang Anda gunakan untuk relay
#define RELAY_PIN2 GPIO_NUM_5
// Pin untuk tombol
#define BUTTON_UP 27
#define BUTTON_DOWN 26
#define BUTTON_ENTER 25

FirebaseData fbdo;
FirebaseAuth auth;
FirebaseConfig config;

// Konfigurasi LCD 40x2
LiquidCrystal_I2C lcd(0x27, 40, 2);

HardwareSerial mySerial(1);
Adafruit_Fingerprint finger = Adafruit_Fingerprint(&mySerial);

// Variabel suara kandidat
int suaraFauzan = 0;
int suaraAldi = 0;
int suaraAmin = 0;
int suaraAbu = 0;
int suaraIppang = 0;
int suaraAlang = 0;

void setup() {
  Serial.begin(115200);
  mySerial.begin(57600, SERIAL_8N1, RX_PIN, TX_PIN);
  while (!Serial);
  delay(1000);
  Serial.println("Fingerprint verification");
  
  finger.begin(57600);
  if (finger.verifyPassword()) {
    Serial.println("Found fingerprint sensor!");
  } else {
    Serial.println("Did not find fingerprint sensor :(");
    while (1) { delay(1); }
  }
// Setup tombol
  pinMode(BUTTON_UP, INPUT_PULLUP);
  pinMode(BUTTON_DOWN, INPUT_PULLUP);
  pinMode(BUTTON_ENTER, INPUT_PULLUP);

  // Setup LCD
  lcd.init();
  lcd.backlight();

  // Setup WiFi
  WiFi.begin(SSID, PASSWORD);
  lcd.print("Menghubungkan WiFi...");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    lcd.print(".");
  }
  lcd.clear();
  lcd.print("WiFi Terhubung!");
  delay(1000);

  // Setup Firebase
  config.api_key = API_KEY;
  config.database_url = DATABASE_URL;

  if (Firebase.signUp(&config, &auth, "", "")) {
    Serial.println("Terhubung ke Firebase");
  } else {
    Serial.printf("Sign-up error: %s\n", config.signer.signupError.message.c_str());
  }
  Firebase.begin(&config, &auth);

  // Tampilkan loading awal

}
  

void loop() {
  Serial.println("Place your finger on the sensor");
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("LETAKKAN SIDIK JARI");
  lcd.setCursor(0, 1);
  lcd.print("PADA SENSOR");
  lcd.setCursor(0, 2);
  lcd.print("SIDIK JARI");
  int id = finger.getImage();
  if (id == FINGERPRINT_OK) {
    Serial.println("Image taken");
    id = finger.image2Tz();
    if (id == FINGERPRINT_OK) {
      Serial.println("Image converted");
      id = finger.fingerSearch();
      if (id == FINGERPRINT_OK) {
        Serial.print("Found ID: "); 
        Serial.println(finger.fingerID);

        // If finger ID is 1, run the fingerprint registration function
        if (finger.fingerID == 1) {
            Serial.println("ID 1 detected, entering enrollment mode.");
          while(true){
            lcd.clear();
            lcd.print("ID: ");
            lcd.setCursor(3, 0);
            String idInput = getInputID();  // Get ID input from admin
            uint8_t newId = idInput.toInt();

            if (newId > 0 && newId <= 127) {
              Serial.println("Registering fingerprint for ID: " + String(newId));
              enrollFingerprint(newId);  // Trigger fingerprint registration for the given ID
            } else {
              Serial.println("Invalid ID. Please enter a valid ID between 1 and 127.");
            }
          }
        } else {
          if (hasVoted(finger.fingerID)) {
            lcd.clear();
            lcd.print("SIDIK JARI SUDAH");
            lcd.setCursor(0, 1);
            lcd.print("MEMILIH SEBELUMNYA");
            delay(2000);
            return; // Kembali ke loop jika sudah memilih
          }
          showLoadingScreen();
          selectAndVoteForPresiden();
          markAsVoted(finger.fingerID); 
        }
      } else {
        Serial.println("Finger not found");
      }
    }
  }
}

// Fungsi untuk menampilkan layar loading awal
void showLoadingScreen() {
  lcd.clear();
  lcd.print("PEMILIHAN UMUM ITH");
  lcd.setCursor(0, 1);
  for (int i = 0; i < 40; i++) {
    lcd.print("-");
    delay(75);
  }
  delay(1000);
  lcd.clear();
}

// Fungsi untuk memilih kandidat Presiden BEM
void selectAndVoteForPresiden() {
  int selection = 0;
  lcd.setCursor(0, 1);
  lcd.print("KANDIDAT");
  lcd.setCursor(0, 2);
  lcd.print("PRESIDEN BEM");
  delay(3000);
  // Tampilkan kandidat Presiden BEM
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("1. Fauzan");
  lcd.setCursor(0, 1);
  lcd.print("2. Aldi");
  lcd.setCursor(0, 2);
  lcd.print("3. Amin");

  while (true) {
    // Tampilkan kursor
    lcd.setCursor(0, selection);
    lcd.print(">"); // Tampilkan kursor
    
    // Hapus kursor sebelumnya
    for (int i = 0; i < 3; i++) {
      if (i != selection) {
        lcd.setCursor(0, i);
        lcd.print(" ");
      }
    }

    // Penanganan tombol
    if (digitalRead(BUTTON_UP) == LOW) {
      selection = (selection - 1 + 3) % 3; // Pindah ke atas
      delay(200);
    } else if (digitalRead(BUTTON_DOWN) == LOW) {
      selection = (selection + 1) % 3; // Pindah ke bawah
      delay(200);
    } else if (digitalRead(BUTTON_ENTER) == LOW) {
      // Tambahkan suara langsung ke database untuk Presiden BEM
      switch (selection) {
        case 0: 
          suaraFauzan++;
          Firebase.RTDB.setInt(&fbdo, "/PRESIDEN_BEM/Fauzan", suaraFauzan);
          break;
        case 1: 
          suaraAldi++;
          Firebase.RTDB.setInt(&fbdo, "/PRESIDEN_BEM/Aldi", suaraAldi);
          break;
        case 2: 
          suaraAmin++;
          Firebase.RTDB.setInt(&fbdo, "/PRESIDEN_BEM/Amin", suaraAmin);
          break;
      }
      delay(500); // Debounce
      return selectAndVoteForKetuaUmumMaperwa(); // Keluar dari fungsi setelah memilih
    }
  }
}

// Fungsi untuk memilih kandidat Ketua Umum Maperwa
void selectAndVoteForKetuaUmumMaperwa() {
  int selection = 0;
  lcd.clear();
  lcd.setCursor(0, 1);
  lcd.print("KANDIDAT");
  lcd.setCursor(0, 2);
  lcd.print("KETUA UMUM MAPERWA");
  delay(3000);
  // Tampilkan kandidat Ketua Umum Maperwa
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("1. Abu");
  lcd.setCursor(0, 1);
  lcd.print("2. Ippang");
  lcd.setCursor(0, 2);
  lcd.print("3. Alang");

  while (true) {
    // Tampilkan kursor
    lcd.setCursor(0, selection);
    lcd.print(">"); // Tampilkan kursor
    
    // Hapus kursor sebelumnya
    for (int i = 0; i < 3; i++) {
      if (i != selection) {
        lcd.setCursor(0, i);
        lcd.print(" ");
      }
    }

    // Penanganan tombol
    if (digitalRead(BUTTON_UP) == LOW) {
      selection = (selection - 1 + 3) % 3; // Pindah ke atas
      delay(200);
    } else if (digitalRead(BUTTON_DOWN) == LOW) {
      selection = (selection + 1) % 3; // Pindah ke bawah
      delay(200);
    } else if (digitalRead(BUTTON_ENTER) == LOW) {
      // Tambahkan suara langsung ke database untuk Ketua Umum Maperwa
      switch (selection) {
        case 0: 
          suaraAbu++;
          Firebase.RTDB.setInt(&fbdo, "/MAPERWA/Abu", suaraAbu);
          break;
        case 1: 
          suaraIppang++;
          Firebase.RTDB.setInt(&fbdo, "/MAPERWA/Ippang", suaraIppang);
          break;
        case 2: 
          suaraAlang++;
          Firebase.RTDB.setInt(&fbdo, "/MAPERWA/Alang", suaraAlang);
          break;
      }
      delay(500); // Debounce

      // Tampilkan ucapan terima kasih setelah memilih Ketua Umum Maperwa
      showThankYouMessage();
      
      return; // Keluar dari fungsi setelah memilih
    }
  }
}

String getInputID() {
  String input = "";
  while (Serial.available() == 0) {
    // Tunggu input dari serial
    delay(100);
  }
  
  // Baca input dari serial
  while (Serial.available() > 0) {
    char c = Serial.read();
    if (c == '\n' || c == '\r') {
      break;  // Akhiri input jika menekan Enter
    }
    input += c;
  }
  
  return input;
}

void enrollFingerprint(uint8_t id) {
  int p;

  // Langkah 1: Tangkap sidik jari pertama
  while ((p = finger.getImage()) != FINGERPRINT_OK) {
    if (p == FINGERPRINT_NOFINGER) {
      Serial.print("."); // Tampilkan titik sebagai indikator
    } else {
      Serial.println("Gagal menangkap gambar. Silakan coba lagi.");
      return;
    }
    delay(100);
  }
  Serial.println("\nSidik jari pertama berhasil ditangkap.");
  if (finger.image2Tz(1) != FINGERPRINT_OK) {
    Serial.println("Gagal memproses sidik jari pertama.");
    return;
  }

  // Langkah 2: Konfirmasi dengan sidik jari kedua
  Serial.println("Angkat jari Anda, lalu letakkan kembali...");
  delay(2000);
  while ((p = finger.getImage()) != FINGERPRINT_OK) {
    if (p == FINGERPRINT_NOFINGER) {
      Serial.print("."); // Tampilkan titik sebagai indikator
    } else {
      Serial.println("Gagal menangkap gambar. Silakan coba lagi.");
      return;
    }
    delay(100);
  }
  Serial.println("\nSidik jari kedua berhasil ditangkap.");
  if (finger.image2Tz(2) != FINGERPRINT_OK) {
    Serial.println("Gagal memproses sidik jari kedua.");
    return;
  }

  // Langkah 3: Membuat model sidik jari
  if (finger.createModel() != FINGERPRINT_OK) {
    Serial.println("Sidik jari tidak cocok. Silakan coba lagi.");
    return;
  }
  Serial.println("Model sidik jari berhasil dibuat.");

  // Langkah 4: Simpan model ke ID yang ditentukan
  if (finger.storeModel(id) != FINGERPRINT_OK) {
    Serial.println("Gagal menyimpan model ke sensor.");
    return;
  }
  Serial.println("Sidik jari berhasil disimpan di ID #" + String(id));

  // Langkah 5: Minta input nama
  String name = getInputName();
  // Simpan nama ke Firebase
  String path = "/pemilih/" + String(id);
  Firebase.RTDB.setString(&fbdo, path + "/name", name);
  Serial.println("Nama berhasil disimpan: " + name);
}

String getInputName() {
  String input = "";
  lcd.clear();
  lcd.print("Masukkan Nama:");
  lcd.setCursor(0, 1);
  
  while (input.length() < 20) { // Batasi panjang nama
    if (Serial.available() > 0) {
      char c = Serial.read();
      if (c == '\n' || c == '\r') {
        break;  // Akhiri input jika menekan Enter
      }
      input += c;
      lcd.print(c); // Tampilkan karakter di LCD
    }
    delay(100);
  }
  
  return input;
}

bool hasVoted(int fingerID) {
  String path = "/pemilih/" + String(fingerID);
  FirebaseData fbdo;
  
  // Cek apakah sudah ada nilai 'voted' untuk ID ini
  if (Firebase.RTDB.getString(&fbdo, path + "/voted")) {
    return fbdo.stringData() == "true";
  }
  return false;
}

void markAsVoted(int fingerID) {
  String path = "/pemilih/" + String(fingerID);
  
  // Tandai sidik jari ini sudah memilih
  Firebase.RTDB.setString(&fbdo, path + "/voted", "true");
}

void showThankYouMessage() {
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("TERIMAKASIH");
  lcd.setCursor(0, 1);
  lcd.print("SUDAH MEMILIH :)");
  
  delay(3000); // Tampilkan selama 3 detik
  
  lcd.clear(); // Hapus layar setelah 3 detik
  showLoadingScreen();
}