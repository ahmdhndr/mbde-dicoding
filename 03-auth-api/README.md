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

* **Membuat Entities User Domain**\
Seperti yang sudah kita ketahui, entitas merupakan sebuah objek yang memiliki set struktur data dan method. Kita membutuhkan entitas domain untuk memastikan data yang dibutuhkan dalam melakukan sebuah proses selalu terpenuhi dan sesuai.
Pada fitur registrasi pengguna, kita akan membuat dua domain entitas yakni **RegisterUser** dan **RegisteredUser**. Entitas **RegisterUser** digunakan untuk menampung data yang hendak dimasukan ke database melalui repository, sedangkan **RegisteredUser** digunakan untuk menampung data yang dihasilkan oleh repository setelah memasukkan user baru.

* **Membuat UserRepository Interface**\
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

**Membuat PasswordHash Interface**
PasswordHash merupakan objek yang memiliki fungsi untuk melakukan proses hash yang dibutuhkan oleh use case. Untuk saat ini, kita hanya membutuhkan fungsi dalam hashing password saja. Jadi, PasswordHash hanya memiliki satu fungsi dengan nama hash. 

Behavior dari PasswordHash di sini bersifat abstrak. Sehingga, pengujian berfokus untuk memastikan hash membangkitkan eror ketika ia dipanggil.

**Membuat AddUserUseCase**
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

#### Implementasi User Repository dan PasswordHash
Seluruh kebutuhan entities dan alur bisnis sudah selesai. Kini saatnya kita lanjutkan ke layer Infrastruktur untuk membuat implementasi dari **UserRepository** dan **PasswordHash**. Kita akan mulai dengan UserRepository.

**Membuat UserRepositoryPostgres**
Repository di level domain hanya sebatas Interface. Walaupun cukup untuk mendefinisikan alur bisnis pada use case, tetapi nyatanya ia tidak bisa digunakan untuk menjalankan aksi. Hal tersebut karena behavior dari Repository domain bersifat abstrak atau butuh diimplementasikan. Sekarang, saatnya kita membuat bentuk konkrit dari **UserRepository**.

Objek **UserRepository** saat ini memiliki dua fungsi yaitu **addUser** dan **verifyAvailableUsername**. Kedua fungsi tersebut membutuhkan database sebagai tempat penyimpanan datanya. Seperti yang sudah diketahui, kita sudah memiliki database Postgres yang disiapkan untuk aplikasi ini. Selain itu, kita juga sudah memiliki dua tabel yaitu users dan authentications.

Database yang akan digunakan adalah PostgreSQL. Sehingga, kita akan membuat **UserRepository** konkrit dengan nama **UserRepositoryPostgres**.
Karena fungsi utama dari **UserRepositoryPostgres** berinteraksi dengan database, maka dalam pengujiannya pun kita perlu bersentuhan dengan database secara langsung. Sehingga kita dapat memastikan secara akurat, **UserRepositoryPostgres** benar bekerja sesuai fungsinya.

Ketika sebuah pengujian sudah bersentuhan dengan database, kita membutuhkan sebuah helper. Helper tersebut digunakan untuk melihat, memasukkan, atau membersihkan data yang dimasukkan ke database selama proses pengujian. Masih ingatkan dengan **UsersTableTestHelper** yang kita buat ketika menyiapkan kebutuhan testing? Nah, di pengujian kali ini, kita akan menggunakan helper tersebut.
```js:UserRepositoryPostgres.test.js
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const InvariantError = require('../../../Commons/exceptions/InvariantError');
const RegisterUser = require('../../../Domains/users/entities/RegisterUser');
const RegisteredUser = require('../../../Domains/users/entities/RegisteredUser');
const pool = require('../../database/postgres/pool');
const UserRepositoryPostgres = require('../UserRepositoryPostgres');
 
describe('UserRepositoryPostgres', () => {
  afterEach(async () => {
    await UsersTableTestHelper.cleanTable();
  });
 
  afterAll(async () => {
    await pool.end();
  });
 
  describe('verifyAvailableUsername function', () => {
    it('should throw InvariantError when username not available', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ username: 'dicoding' }); // memasukan user baru dengan username dicoding
      const userRepositoryPostgres = new UserRepositoryPostgres(pool, {});
 
      // Action & Assert
      await expect(userRepositoryPostgres.verifyAvailableUsername('dicoding')).rejects.toThrowError(InvariantError);
    });
 
    it('should not throw InvariantError when username available', async () => {
      // Arrange
      const userRepositoryPostgres = new UserRepositoryPostgres(pool, {});
 
      // Action & Assert
      await expect(userRepositoryPostgres.verifyAvailableUsername('dicoding')).resolves.not.toThrowError(InvariantError);
    });
  });
 
  describe('addUser function', () => {
    it('should persist register user', async () => {
      // Arrange
      const registerUser = new RegisterUser({
        username: 'dicoding',
        password: 'secret_password',
        fullname: 'Dicoding Indonesia',
      });
      const fakeIdGenerator = () => '123'; // stub!
      const userRepositoryPostgres = new UserRepositoryPostgres(pool, fakeIdGenerator);
 
      // Action
      await userRepositoryPostgres.addUser(registerUser);
 
      // Assert
      const users = await UsersTableTestHelper.findUsersById('user-123');
      expect(users).toHaveLength(1);
    });
 
    it('should return registered user correctly', async () => {
      // Arrange
      const registerUser = new RegisterUser({
        username: 'dicoding',
        password: 'secret_password',
        fullname: 'Dicoding Indonesia',
      });
      const fakeIdGenerator = () => '123'; // stub!
      const userRepositoryPostgres = new UserRepositoryPostgres(pool, fakeIdGenerator);
 
      // Action
      const registeredUser = await userRepositoryPostgres.addUser(registerUser);
 
      // Assert
      expect(registeredUser).toStrictEqual(new RegisteredUser({
        id: 'user-123',
        username: 'dicoding',
        fullname: 'Dicoding Indonesia',
      }));
    });
  });
});
```
Kode di atas memiliki empat buah pengujian. Seperti yang sudah Anda ketahui, setiap pengujian ditandai dengan blok it. Mari kita bedah maksud dari keempat pengujiannya.

  * *verifyAvailableUsername function should throw InvariantError when username not available*
  Ini adalah pengujian untuk behavior fungsi **verifyAvailableUsername**. Fungsi ini memiliki dua kemungkinan, yakni membangkitkan **InvariantError** dan tidak membangkitkan eror. Di pengujian kali ini, kita akan menguji keadaan fungsi ketika username tidak tersedia atau sudah terdaftar di database. Pengujian ini memastikan **verifyAvailableUsername** membangkitkan InvariantError.
  Sebelum melakukan pengujian--*lebih tepatnya pada bagian Arrange*--kita memasukkan data user baru ke database dengan username “erudev” melalui table helper. Hal ini diperlukan untuk memenuhi skenario pengujian bahwa user dengan username “erudev” sudah ada di dalam database. Sehingga, **verifyAvailableUsername** seharusnya membangkitkan **InvariantError**.
  * *verifyAvailableUsername function should not throw InvariantError when username available*
  Ini juga pengujian untuk behavior fungsi **verifyAvailableUsername**. Kebalikan dari pengujian sebelumnya, di sini kita akan menguji keadaan di mana username baru dapat digunakan atau belum ada yang menggunakannya di database. Table helper tidak digunakan pada pengujian ini karena tidak dibutuhkan.
  * *addUser function should persist register user*
  Ini adalah pengujian untuk behavior fungsi **addUser**. Hal yang diuji yaitu apakah fungsi **addUser** mampu menyimpan user baru pada database dengan benar. Kita menggunakan UsersTableTestHelper.findUsersById untuk menguji apakah user dimasukkan ke database.
  * *addUser function should return added user correctly*
  Selain dapat menyimpan data di database, fungsi add user juga harus mengembalikan nilai id, username, dan fullname dari user yang baru saja dimasukkan ke database (RegisteredUser). Di sini kita menggunakan table helper untuk melihat apakah data user benar-benar dimasukkan ke dalam database.

Pada skenario di atas juga kita menggunakan **describe** untuk membagi skenario pengujian berdasarkan konteksnya. Kami yakin Anda sudah mengetahui fungsi dari *describe* ini. Hal baru yang ada di sana adalah penggunaan fungsi **afterEach** dan **afterAll**.

Fungsi **afterEach** dan **afterAll** merupakan fungsi yang digunakan untuk menampung sekumpulan kode yang dijalankan setelah melakukan pengujian. Bedanya fungsi **afterEach** dieksekusi setiap kali fungsi it selesai dijalankan, sedangkan **afterAll** dieksekusi setelah seluruh fungsi it selesai dijalankan. Biasanya kode yang dituliskan di fungsi ini adalah kode cleaning atau teardown. Untuk mengenal lebih dalam kedua fungsi ini disarankan untuk membaca dokumentasi yang diberikan Jest mengenai [Setup and Teardown](https://jestjs.io/docs/setup-teardown). 

Dalam tautan tersebut, Anda juga akan menemukan penggunaan **beforeEach** dan **beforeAll** yang sering digunakan untuk meringkas kode testing yang berulang seperti melakukan setup.
> idGenerator adalah [nanoid](https://www.npmjs.com/package/nanoid) yang digunakan untuk membuat nilai id secara unik. Kita menggunakan teknik dependency injection agar mudah dalam melakukan pengujian.

**Membuat BcryptPasswordHash**
Untuk melakukan proses enkripsi, kita akan menggunakan [bcrypt](https://www.npmjs.com/package/bcrypt). Jadi, mari kita buat objek konkrit dengan nama **BcryptPasswordHash**.
```js:BcryptPasswordHash.test.js
const bcrypt = require('bcrypt');
const BcryptPasswordHash = require('../BcryptPasswordHash');
 
describe('BcryptPasswordHash', () => {
  describe('hash function', () => {
    it('should encrypt password correctly', async () => {
      // Arrange
      const spyHash = jest.spyOn(bcrypt, 'hash');
      const bcryptPasswordHash = new BcryptPasswordHash(bcrypt);
 
      // Action
      const encryptedPassword = await bcryptPasswordHash.hash('plain_password');
 
      // Assert
      expect(typeof encryptedPassword).toEqual('string');
      expect(encryptedPassword).not.toEqual('plain_password');
      expect(spyHash).toBeCalledWith('plain_password', 10); // 10 adalah nilai saltRound default untuk BcryptPasswordHash
    });
  });
});
```
Mari kita bedah pengujiannya. Di sana, terdapat satu pengujian yang kita tuliskan.
  * *hash function should encrypt password correctly*
  Skenario ini menguji kebenaran dari fungsi hash dalam mengenkripsi password menggunakan bcrypt. Di sini, kita menggunakan teknik spy untuk melihat apakah fungsi hash dari bcrypt dipanggil dan diperlakukan dengan benar. Di sini juga kita memastikan nilai “plain_password” sudah terenkripsi.

#### Membuat Service Locator
Kita sudah selesai membuat `UserRepositoryPostgres` dan `BcryptPasswordHash`. Selain itu, kita juga sudah memastikan semua yang kita buat berkerja dengan baik dan sesuai melalui pengujian automatis. Selanjutnya, kita akan membuat HTTP server menggunakan repository, use case, dan helper yang sudah kita buat di sana. Tapi tunggu! Sebelum itu, ada hal penting yang perlu Anda ketahui dulu.

**Dampak dari Penerapan Dependency Injection**
gan pola dependency injection (DI)? Sejauh latihan yang sudah dilalui, kita banyak menerapkan pola dependency injection. Manfaat dari menerapkan pola ini adalah hubungan antar objek tidak saling terikat erat, dengan begitu kita dapat menciptakan arsitektur yang *clean* dan mudah menerapkan *test double* ketika pengujian. Kami yakin Anda sudah mengetahui dan merasakannya secara langsung.

Salah satu dampak dari pola dependency injection adalah pembuatan instance dari class menjadi rumit, terutama bila ia memiliki dependency yang banyak. Karena, kita perlu menyiapkan seluruh objek yang dibutuhkan ketika membuat suatu class. Contoh, kita sudah membuat `AddUserUseCase` dan kita akan menggunakanya pada route handler nantinya. Pada handler, tentu kita perlu membuat instance dari `AddUserUseCase`. Sedangkan untuk membuat instance tersebut, kita butuh menyiapkan objek yang dibutuhkan, yaitu `UserRepository` dan `AuthenticationTokenManager`. Karena itu, pembuatan instance `AddUserUseCase` menjadi rumit dan mahal. Belum lagi bila `AddUserUseCase` digunakan di banyak handler. Kita perlu mengulang proses pembuatannya yang rumit.

Tenang, setiap masalah pasti ada solusinya. Untuk dapat membuat dan menggunakan instance class yang menerapkan pola DI dengan mudah, kita perlu membuat objek khusus yang memang bertugas untuk mengatur seluruh instances atau services yang diperlukan oleh aplikasi. Objek tersebut dikenal sebagai [Service Locator](https://en.wikipedia.org/wiki/Service_locator_pattern).

**Service Locator**
Service locator merupakan objek yang berfungsi untuk mengabstraksikan pembuatan dan pengaksesan sebuah instance class. Sesuai namanya, ketika menggunakan service locator, kita bisa mendapatkan instance secara mudah karena ia berada di satu lokasi saja. Karena service locator menampung banyak instance di dalamnya, ia juga berfungsi sebagai service container. 

Ketahuilah bahwa kita akan menggunakan teknik service locator untuk menyelesaikan masalah dependency injection. Namun, alih-alih kita membuatnya sendiri, kita akan menggunakan package [instances-container](https://github.com/dimasmds/instances-container/blob/master/README.id-ID.md) dalam membuat service locator atau container. Tujuannya untuk meringankan efort dan tentunya lebih optimal. 

Silakan pasang package instances-container menggunakan perintah:
```bash
npm install instances-container
```
Setelah package berhasil dipasang, kemudian buat berkas JavaScript baru dengan nama container.js pada *Infrastructures*/.

Kemudian di dalamnya tulis kode untuk membuat container dan daftarkan seluruh class *use case* dan *services* yang dibutuhkan oleh aplikasi:
```js:container.js
* istanbul ignore file */
 
const { createContainer } = require('instances-container');
 
// external agency
const { nanoid } = require('nanoid');
const bcrypt = require('bcrypt');
const pool = require('./database/postgres/pool');
 
// service (repository, helper, manager, etc)
const UserRepositoryPostgres = require('./repository/UserRepositoryPostgres');
const BcryptPasswordHash = require('./security/BcryptPasswordHash');
 
// use case
const AddUserUseCase = require('../Applications/use_case/AddUserUseCase');
const UserRepository = require('../Domains/users/UserRepository');
const PasswordHash = require('../Applications/security/PasswordHash');
 
// creating container
const container = createContainer();
 
// registering services and repository
container.register([
  {
    key: UserRepository.name,
    Class: UserRepositoryPostgres,
    parameter: {
      dependencies: [
        {
          concrete: pool,
        },
        {
          concrete: nanoid,
        },
      ],
    },
  },
  {
    key: PasswordHash.name,
    Class: BcryptPasswordHash,
    parameter: {
      dependencies: [
        {
          concrete: bcrypt,
        },
      ],
    },
  },
]);
 
// registering use cases
container.register([
  {
    key: AddUserUseCase.name,
    Class: AddUserUseCase,
    parameter: {
      injectType: 'destructuring',
      dependencies: [
        {
          name: 'userRepository',
          internal: UserRepository.name,
        },
        {
          name: 'passwordHash',
          internal: PasswordHash.name,
        },
      ],
    },
  },
]);
 
module.exports = container;
```

Objek container yang kita buat merupakan objek yang menampung seluruh instance dari class yang didaftarkan di dalamnya. Untuk mendapatkan instance di dalam container, nantinya kita akan menggunakan fungsi `container.getInstance(key)`. Key merupakan kata kunci dalam bentuk string yang digunakan untuk mendapatkan instance.

Pada kode di atas, ketika mendaftarkan class, kita memberikan nilai `Class.name` (contohnya `UserRepository.name`) sebagai key. Hal itu bertujuan untuk menghindari kesalahan penulisan (typo).

Jangan khawatir bila Anda belum mengerti bagaimana menuliskan konfigurasi untuk mendaftarkan class di package instance-container. Untuk mengetahuinya lebih lanjut, silakan baca [dokumentasi yang disedikan](https://github.com/dimasmds/instances-container/blob/master/README.id-ID.md). Di sana Anda akan mengetahui secara rinci penggunaan instances-container. Kontributor dari package menyediakan dokumentasi dalam Bahasa Indonesia yang harusnya mudah Anda pahami.

> Kita tidak perlu menguji kode container.js. karena instances-container sudah teruji ketika mengembangkannya. Itulah sebabnya istanbul ignore files ditambahkan di awal kode.

Selain instances-container, Anda juga bisa menggunakan package lain dalam menerapkan service locator seperti:
  * [Awilix](https://github.com/jeffijoe/awilix)
  * [Bottlejs](https://github.com/young-steveo/bottlejs)