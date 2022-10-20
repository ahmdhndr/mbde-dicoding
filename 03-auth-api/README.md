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

#### Membuat User Domain
Kita mulai dengan membuat kebutuhan domain untuk fitur registrasi pengguna. Di dalam domain, kita akan membuat dua hal, yaitu **entitas** dan **UserRepository** abstrak/interface. Kita mulai dengan membuat entitas terlebih dahulu.

* **Membuat Entities User Domain**
Seperti yang sudah kita ketahui, entitas merupakan sebuah objek yang memiliki set struktur data dan method. Kita membutuhkan entitas domain untuk memastikan data yang dibutuhkan dalam melakukan sebuah proses selalu terpenuhi dan sesuai.
Pada fitur registrasi pengguna, kita akan membuat dua domain entitas yakni **RegisterUser** dan **RegisteredUser**. Entitas **RegisterUser** digunakan untuk menampung data yang hendak dimasukan ke database melalui repository, sedangkan **RegisteredUser** digunakan untuk menampung data yang dihasilkan oleh repository setelah memasukkan user baru.

* **Membuat UserRepository Interface**
Kita ingin logika bisnis terbebas dari implementasi framework atau tools luar, tetapi bagaimana caranya suatu proses bisnis bersentuhan dengan database untuk menyimpan suatu data? Jawabannya adalah melalui interface.
Interface merupakan teknik dalam mendefinisikan kemampuan (*behavior*) objek, tetapi tanpa sebuah implementasi yang nyata, kemampuan tersebut bersifat abstrak. Meskipun kemampuan objek bersifat abstrak, objek interface nyatanya cukup untuk digunakan dalam menentukan alur proses bisnis aplikasi (pada *use case*). Padahal untuk menjalankan proses bisnisnya, tentu kita butuh objek konkritnya.
Jika Anda familiar dengan bahasa pemrograman Java, Kotlin, C#, atau bahasa pemrograman yang kental dengan paradigma OOP, tentunya Anda familiar dengan hadirnya Interface. JavaScript sendiri sebenarnya tidak mengenal interface, namun kita tetap bisa membuat konsep interface melalui teknik inheritance class.
Dalam level domain users, kita perlu mendefinisikan interface **UserRepository**. Interface **UserRepository** nantinya akan digunakan oleh use case dalam menentukkan alur proses bisnis. Repository pada proyek kita berperan sebagai jembatan untuk memproses domain model terhadap agen eksternal, seperti database, queue, storage, dan sebagainya.
**UserRepository** merupakan objek yang memiliki kumpulan fungsi, di mana fungsi tersebut digunakan untuk berinteraksi dengan database (agen eksternal) dalam cakupan domain users. Untuk membangun fitur registrasi pengguna, kita membutuhkan dua fungsi pada UserRepository, yakni **addUser** dan **verifyAvailableUsername**. **addUser** digunakan untuk menyimpan user baru ke database, sedangkan **verifyAvailableUsername** digunakan untuk memeriksa keunikan username baru dari database. 
Perlu diingat kembali, kemampuan atau fungsi **UserRepository** di sini bersifat abstrak. Sehingga, kita tidak akan menulis cara menyimpan user baru ke database atau memverifikasi keunikan username dari database, tetapi cukup mendefinisikan fungsi-fungsinya saja. Supaya tidak ada yang menggunakan fungsi langsung dari objek abstrak ini, maka kita buat fungsinya membangkitkan error.
Kita mulai dari pengujian. Karena kita membuat objek UserRepository abstrak, ujilah objek tersebut untuk memastikan *behavior*-nya bersifat abstrak dengan mengembalikan sebuah error.
#### Membuat AddUser Use Case dan PasswordHash Interface
Setelah urusan Domains alias Enterprise Business Layer selesai, sekarang mari kita beranjak untuk mendefinisikan alur bisnis dalam menambahkan user baru. Ingat kembali bahwa seluruh alur bisnis pada aplikasi kita hanya akan ditulis dalam bentuk *use case* level Application Business Layer alias folder Applications. Bila nantinya aplikasi Anda masih memiliki alur bisnis logika di luar dari *use case*, itu berarti arsitektur aplikasi Anda masih belum *clean*.

Sebelum menulis kode use case, kita perlu mengetahui seperti apa alur bisnis dalam menambahkan user baru. Perhatikan alurnya di bawah ini:

  * Request handler memanggil use case dan memberikan payload yang dibutuhkan use case (use case payload) seperti username, password, dan fullname.
  * Memverifikasi keunikan username pada database.
  * *Hashing* password yang diberikan.
  * Membuat domain model **RegisterUser** berdasarkan payload dan password sudah di-*hash*.
  * Memasukkan RegisterUser ke database.

Jika alurnya ditelaah kembali, ternyata ada satu alur yang belum kita siapkan kebutuhannya yaitu *hashing* password. Agar proses *hash* mudah dan memiliki standar, kita akan memanfaatkan tools luar seperti bcrypt.

Namun, perlu diingat, Domains dan Applications sebisa mungkin terhindar dari penerapan framework atau tools luar agar mudah diadaptasi bila terjadi perubahan. Oleh karena itu, kita akan menghindari penulisan kode yang memiliki dependency terhadap tools luar. Solusinya, kita akan menggunakan teknik yang sama seperti Repository yaitu membuat interface untuk **PasswordHash**.

Proses *hashing* tidak terikat dengan subdomain mana pun, tetapi ia merupakan proses yang dibutuhkan oleh use case pada level Applications. Jadi, tempat terbaik untuk menyimpan PasswordHash interface adalah di folder Applications.

* **Membuat PasswordHash Interface**
PasswordHash merupakan objek yang memiliki fungsi untuk melakukan proses hash yang dibutuhkan oleh use case. Untuk saat ini, kita hanya membutuhkan fungsi dalam hashing password saja. Jadi, PasswordHash hanya memiliki satu fungsi dengan nama hash. 
Behavior dari PasswordHash di sini bersifat abstrak. Sehingga, pengujian berfokus untuk memastikan hash membangkitkan eror ketika ia dipanggil.
* **Membuat AddUserUseCase**
Sebelum membuat use case, kita ketahui dulu sebenarnya seperti apa sih use case di dalam proyek kita ini? Dalam bukunya yang berjudul [Clean Architecture](https://www.amazon.com/Clean-Architecture-Craftsmans-Software-Structure/dp/0134494164), Uncle Bob mengatakan:
*"These use cases orchestrate the flow of data to and from the entities, and direct those entities to use their Critical Business Rules to achieve the goals of the use case."*
Mungkin sebagian dari Anda berpikir bahwa definisi yang diberikan terlalu umum dan tidak konkret. Ya memang seperti itu definisinya.
Untuk memudahkan pemahaman, Anggap use case sebagai daftar aksi yang dapat dilakukan oleh aplikasi. Pada use case juga, kita mendefinisikan langkah demi langkah untuk mencapai aksi tersebut. Contohnya, “aksi untuk memasukkan user baru ke database”. Apakah data user baru perlu diverifikasi sebelum masuk ke database? Atau justru tanpa proses verifikasi sama sekali? Semua itu terdefinisikan pada use case.
Namun, ingat! Use case hanya mendefinisikan langkah demi langkahnya saja, ia tidak melakukan pekerjaan yang didefinisikan. Use case adalah *orchestrator* (mandor) bukan *implementor* (pelaksana). Nah, yang melaksanakan tugas adalah repository dan service-service yang dibutuhkan oleh use case untuk mencapai goal sebagai *orchestrator*.
Sampai tahap ini, semoga Anda paham tugas dan fungsi use case.
Lalu, seperti apa bentuk use case? Tidak ada gambaran jelas atau standar bagaimana bentuk use case. Definisi use case tidak terpaku pada bentuk, tetapi tugas dan tanggung jawabnya saja. Tak peduli ia adalah sebuah class atau hanya sekedar fungsi. Di proyek kali ini, kita akan membuat use case dalam bentuk class.
Class use case memiliki satu fungsi public yaitu, **execute**. Fungsi ini digunakan untuk mengeksekusi aksi dari use case. Contoh, fungsi execute dari class **AddUserUseCase** berguna untuk melakukan aksi menambahkan user baru ke aplikasi. Apakah Anda sudah paham? Jika sudah, mari kita mulai membuat **AddUserUseCase**.
Fungsi dari **AddUserUseCase** adalah mengatur alur dalam melakukan sebuah aksi. Use case akan mengorkestrasikan atau memandori repository dan service yang digunakan agar aksi tersebut berhasil dilakukan. Ketika melakukan pengujian, tentu kita harus fokus menguji fungsi utama dari sistem yang diuji (SUT). Sehingga pengujian pada use case adalah memastikan ia menjadi mandor yang benar agar aksi “memasukkan user” sesuai dengan alur bisnis yang ditetapkan.
**AddUserUseCase** membutuhkan objek **UserRepository** dan **PasswordHash** untuk melakukan tugasnya. Itulah sebabnya kita memberikan dua objek tersebut melalui interface yang sudah dibuat sebelumnya. Karena behavior fungsinya bersifat abstrak, manfaatkanlah Test Double untuk membuat implementasi palsu dari fungsi yang digunakan.
Pada use case, kita membutuhkan teknik Test Double menggunakan mock. Mengapa? Karena selain mengubah implementasi fungsi, kita juga perlu memastikan fungsi tersebut dipanggil dengan tepat oleh use case. 