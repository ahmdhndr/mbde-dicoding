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