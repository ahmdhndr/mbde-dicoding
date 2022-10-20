# Studi Kasus Clean Architecture + TDD: Membangun Auth API
Mempraktikkan materi yang sudah dipelajari dari awal pembelajaran hingga pada proyek membangun RESTful API. Menerapkan 100% *coverage testing*, serta mengikuti prinsip Clean Architecture dalam dependency rule.

Tujuan dari latihan ini adalah menciptakan aplikasi yang bersifat:
  * Mudah dikembangkan;
  * Mudah diadaptasi oleh berbagai framework;
  * Teruji dan terhindar dari bugs;

API ini berfokus untuk mengelola fitur autentikasi saja, tak lebih. Auth API dapat melayani permintaan registrasi pengguna, login (get authentication), refresh authentication, dan logout (delete authentication).

## Mengenal Struktur Proyek
Proyek Auth API akan memiliki empat struktur folder besar, yaitu **Domains**, **Applications**, **Interfaces**, dan **Infrastructures**.
  * **Domains**: Merupakan Enterprise Business Layer, di dalam folder ini terdapat model domain (entities) dan abstract/interface repository. Di folder ini diharapkan untuk tidak ada dependencies (sintaks *require* atau *import*) terhadap agen external seperti framework atau tools luar.
  * **Applications**: Merupakan Application Business Layer, di dalam folder ini terdapat alur bisnis yang kita definisikan dalam bentuk use case. Selain itu, kita juga bisa meletakkan abstraksi atau interface dari services, helper, tools, dan lainnya yang digunakan oleh use case. Di folder ini juga diharapkan untuk tidak ada dependencies langsung terhadap framework atau tools luar. Use Case diperbolehkan memiliki dependencies atau menggunakan domain karena domain berada di dalam lingkarannya.
  * **Interfaces**: Merupakan adapter atau jembatan penghubung antara use case dengan agen eksternal, seperti HTTP server. Di sini kita akan mendefinisikan routes configuration dan juga handler yang dibungkus dengan Hapi Plugin.
  * **Infrastructures**: Merupakan letak agen eksternal seperti framework, HTTP Server, Database, JWT Token, Bcrypt dan sebagainya. Di folder ini juga kita mendefinisikan concrete repository dari Domain, atau concrete service, helper, tools dari Application.

> Penamaan folder disesuaikan berdasarkan empat layer aplikasi pada konsep Domain-Driven Design. Konsep tersebut dikemukakan oleh Eric Evans melalui bukunya yang berjudul [Domain-Driven Design: Tackling Complexity in the Heart of Software](https://www.pearson.com/en-us/subject-catalog/p/domain-driven-design-tackling-complexity-in-the-heart-of-software/P200000009375?view=educator).

Selain empat folder besar tersebut, kita juga menambahkan satu folder tambahan yakni **Commons**. Folder ini merupakan *shared folder* yang berisi class, function, atau apa pun yang boleh digunakan oleh ke-empat folder tersebut. Contohnya, kita akan mendefinisikan custom exception agar dapat menangani error secara spesifik.

> Agar kode bisnis tetap bersih, kode yang berada di folder Domains dan Applications akan menghindari penggunaan shared folder.

## Anatomi Proyek
```
auth-api/                   => Root Proyek.
|- config/                  => Folder konfigurasi, digunakan untuk mengonfigurasi node-pg-migrate pada database testing.
|- migrations/              => Berkas migrations database.
|- src/                     => Source code aplikasi
|  |- Applications/         => Application Business Rules
|  |  |- security/          => Abstraksi/interface dari tools dan helper dalam hal security yang digunakan pada use case. Contohnya AuthTokenManager dan EncryptionHelper.
|  |  |- use_cases/         => Alur bisnis aplikasi.
|  |- Commons/              => Shared folder.
|  |  |- exceptions/        => Custom exceptions.
|  |- Domains/              => Enterprise Business Rules.
|  |  |- authentications/   => Subdomain authentications, di sini berisi domain model (entities) dan abstraksi/interface AuthenticationRepository.
|  |  |- users/             => Subdomain users, di sini berisi domain model (entities) dan abstraksi/interface UserRepository.
|  |- Infrastructures/      => Agen External seperti Framework dan Tools External.
|  |  |- database/          => Driver database.
|  |  |- http/              => HTTP Server menggunakan Hapi.js.
|  |  |- repsitories/       => Objek konkrit/implementasi dari repository domain.
|  |  |- security/          => Objek konkrit/implementasi dari tools dan helper dalam hal security.
|  |  |- container.js       => Penampung (container) seluruh instance dari service yang digunakan aplikasi.
|  |- Interfaces/           => Interface Adapter. Di sini kita akan mendefinisikan routes configuration dan juga handler yang dibungkus dengan Hapi Plugin.
|  |- app.js/               => Entry point aplikasi.
|- tests/                   => Utilitas kebutuhan untuk testing.
|- .env                     => Environment variable.
|- package.json             => Project Manifest.
```
## Membuat Custom Error
Custom error yang akan dibuat adalah **ClientError**, **InvariantError**, **AuthenticationError**, dan **NotFoundError**. Berikut penjelasannya:
  * **ClientError** (extends dari Error) : Custom error yang mengindikasikan eror karena masalah yang terjadi pada client. ClientError ini bersifat abstrak karena client error bisa lebih spesifik. Sebaiknya Anda tidak membangkitkan error menggunakan class ini secara langsung, gunakan turunannya saja.
  * **InvariantError** (extends dari ClientError) : Custom error yang mengindikasikan eror karena kesalahan bisnis logic pada data yang dikirimkan oleh client. Kesalahan validasi data merupakan salah satu InvariantError.
  * **AuthenticationError** (extends dari ClientError) : Custom error yang mengindikasikan eror karena masalah autentikasi. Contohnya password yang diberikan salah dan refresh token yang diberikan tidak valid.
  * **NotFoundError** (extends dari ClientError) : Custom error yang mengindikasikan eror karena resource yang diminta client tidak ditemukan.

## Membangun Fitur Registrasi Pengguna
Mari kita mulai dengan membangun fitur registrasi pengguna. Dengan fitur ini, client diharapkan dapat mendaftarkan entitas sebagai pengguna. Melalui registrasi, pengguna akan mengirimkan kredensial yang ia miliki untuk digunakan pada proses autentikasi nantinya. Oke, bagaimana spesifikasi untuk fitur kali ini?

Berikut adalah acceptance scenario-nya:
```gherkin
Fitur: Registrasi Pengguna
Sebagai seorang pengguna, saya ingin mendaftarkan diri sebagai entitas untuk proses autentikasi.
 
Payload:
 - username (string)
 - password (string)
 - fullname (string)
 
Spesifikasi:
 - Ketika mendaftar tanpa memberikan entitas yang dibutuhkan:
   - maka error
 - Ketika mendaftar dengan memberikan entitas yang tipe datanya tidak sesuai: 
   - maka error
 - Ketika mendaftar dengan username lebih dari 50 karakter:
   - maka error
 - Ketika mendaftar dengan username yang mengandung karakter terlarang:
   - maka error 
 - Ketika mendaftar dengan username yang sudah digunakan:
   - maka error
 - Ketika mendaftar dengan payload yang benar
   - maka user baru harus terbuat
 
Catatan sisi sistem:
 - Enkripsi password user
 - Simpan user baru pada database
 - Kembalikan permintaan pengguna dengan nilai user yang dimasukkan
```

### Membuat User Domain
Kita mulai dengan membuat kebutuhan domain untuk fitur registrasi pengguna. Di dalam domain, kita akan membuat dua hal, yaitu **entitas** dan **UserRepository** abstrak/interface. Kita mulai dengan membuat entitas terlebih dahulu.

#### Membuat Entities User Domain
Seperti yang sudah kita ketahui, entitas merupakan sebuah objek yang memiliki set struktur data dan method. Kita membutuhkan entitas domain untuk memastikan data yang dibutuhkan dalam melakukan sebuah proses selalu terpenuhi dan sesuai.

Pada fitur registrasi pengguna, kita akan membuat dua domain entitas yakni **RegisterUser** dan **RegisteredUser**. Entitas **RegisterUser** digunakan untuk menampung data yang hendak dimasukan ke database melalui repository, sedangkan **RegisteredUser** digunakan untuk menampung data yang dihasilkan oleh repository setelah memasukkan user baru.

#### Membuat UserRepository Interface
Kita ingin logika bisnis terbebas dari implementasi framework atau tools luar, tetapi bagaimana caranya suatu proses bisnis bersentuhan dengan database untuk menyimpan suatu data? Jawabannya adalah melalui interface.

Interface merupakan teknik dalam mendefinisikan kemampuan (*behavior*) objek, tetapi tanpa sebuah implementasi yang nyata, kemampuan tersebut bersifat abstrak. Meskipun kemampuan objek bersifat abstrak, objek interface nyatanya cukup untuk digunakan dalam menentukan alur proses bisnis aplikasi (pada *use case*). Padahal untuk menjalankan proses bisnisnya, tentu kita butuh objek konkritnya.

Jika Anda familiar dengan bahasa pemrograman Java, Kotlin, C#, atau bahasa pemrograman yang kental dengan paradigma OOP, tentunya Anda familiar dengan hadirnya Interface. JavaScript sendiri sebenarnya tidak mengenal interface, namun kita tetap bisa membuat konsep interface melalui teknik inheritance class.

Dalam level domain users, kita perlu mendefinisikan interface **UserRepository**. Interface **UserRepository** nantinya akan digunakan oleh use case dalam menentukkan alur proses bisnis. Repository pada proyek kita berperan sebagai jembatan untuk memproses domain model terhadap agen eksternal, seperti database, queue, storage, dan sebagainya.

**UserRepository** merupakan objek yang memiliki kumpulan fungsi, di mana fungsi tersebut digunakan untuk berinteraksi dengan database (agen eksternal) dalam cakupan domain users. Untuk membangun fitur registrasi pengguna, kita membutuhkan dua fungsi pada UserRepository, yakni **addUser** dan **verifyAvailableUsername**. **addUser** digunakan untuk menyimpan user baru ke database, sedangkan **verifyAvailableUsername** digunakan untuk memeriksa keunikan username baru dari database. 

Perlu diingat kembali, kemampuan atau fungsi **UserRepository** di sini bersifat abstrak. Sehingga, kita tidak akan menulis cara menyimpan user baru ke database atau memverifikasi keunikan username dari database, tetapi cukup mendefinisikan fungsi-fungsinya saja. Supaya tidak ada yang menggunakan fungsi langsung dari objek abstrak ini, maka kita buat fungsinya membangkitkan error.

Kita mulai dari pengujian. Karena kita membuat objek UserRepository abstrak, ujilah objek tersebut untuk memastikan *behavior*-nya bersifat abstrak dengan mengembalikan sebuah error.