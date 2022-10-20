# Latihan

## 1. Menghitung Luas dan Keliling Bangun Datar (Persegi dan Segitiga)

### Formula (Rumus)
| 2D Figure (Bangun Datar)    | Perimeter (Keliling)   | Area (Luas)         |
|-----------------------------|------------------------|---------------------|
| Rectangle (Persegi Panjang) | 2 * (length + width)   | length * width      |
| Triangle (Segitiga)         | (sideA + sideB) + base | (base * height) / 2 |

### Catatan
Ketika membuat fungsi untuk perhitungan pada table di atas, bungkus fungsi tersebut dalam sebuah class bernama FigureCalculator.
  * Harus memiliki fungsi calculateRectanglePerimeter, calculateRectangleArea, calculateTrianglePerimeter, dan calculateTriangleArea.
  * Sebuah fungsi calculateRectanglePerimeter:
    - [x] Harus mengembalikan error ketika tidak diberikan dua parameter.
    - [x] Harus mengembalikan error ketika diberikan parameter selain number.
    - [x] Harus mengembalikan nilai yang tepat berdasarkan rumus keliling persegi.
  * Sebuah fungsi calculateRectangleArea:
    - [x] Harus mengembalikan error ketika tidak diberikan dua parameter.
    - [x] Harus mengembalikan error ketika diberikan parameter selain number.
    - [x] Harus mengembalikan nilai yang tepat berdasarkan rumus luas persegi.
  * Sebuah fungsi calculateTrianglePerimeter:
    - [x] Harus mengembalikan error ketika tidak diberikan 3 parameter.
    - [x] Harus mengembalikan error ketika diberikan parameter selain number.
    - [x] Harus mengembalikan nilai yang tepat berdasarkan rumus keliling segitiga.
  * Sebuah fungsi calculateTriangleArea:
    - [x] Harus mengembalikan error ketika tidak diberikan 2 parameter.
    - [x] Harus mengembalikan error ketika diberikan parameter selain number.

## 2. Membangun Math API
Pada latihan ini saya belajar menambahkan HTTP Server (menggunakan Hapi) dengan menerapkan TDD (*Test Driven Development*).
### Desain Endpoint
|Fungsi                                        |Endpoint                                      |
|----------------------------------------------|----------------------------------------------|
|add (pertambahan)                             |GET /add/{a}/{b}                              |
|subtract (pengurangan)                        |GET /subtract/{a}/{b}                         |
|multiply (perkalian)                          |GET /multiply/{a}/{b}                         |
|divide (pembagian)                            |GET /divide/{a}/{b}                           |
|rectangle perimeter (keliling persegi panjang)|GET /rectangle/perimeter/{length}/{width}     |
|rectangle area (luas persegi panjang)         |GET /rectangle/area/{length}/{width}          |
|triangle perimeter (keliling segitiga)        |GET /triangle/perimeter/{sideA}/{sideB}/{base}|
|triangle area (luas segitiga)                 |GET /triangle/area/{base}/{height}            |
### Skenario Pengujian
Sebuah objek HTTP Server:
  * Ketika GET /add
    - [x] Harus menghasilkan response code 200 dan mengembalikan payload value hasil pertambahan a dan b secara tepat.
  * Ketika GET /subtract
    - [x] Harus menghasilkan response code 200 dan mengembalikan payload value hasil pengurangan a dan b secara tepat.
  * Ketika GET /multiply
    - [x] Harus menghasilkan response code 200 dan mengembalikan payload value hasil perkalian a dan b secara tepat.
  * Ketika GET /divide
    - [x] Harus menghasilkan response code 200 dan mengembalikan payload value hasil pembagian a dan b secara tepat.
  * Ketika GET /rectangle/perimeter
    - [x] Harus menghasilkan response code 200 dan mengembalikan payload value hasil perhitungan rumus keliling persegi panjang.
  * Ketika GET /rectangle/area
    - [x] Harus menghasilkan response code 200 dan mengembalikan payload value hasil perhitungan rumus luas persegi panjang.
  * Ketika GET /triangle/perimeter
    - [x] Harus menghasilkan response code 200 dan mengembalikan payload value hasil perhitungan rumus keliling segitiga.
  * Ketika GET /triangle/area
    - [x] Harus menghasilkan response code 200 dan mengembalikan payload value hasil perhitungan rumus luas segitiga.