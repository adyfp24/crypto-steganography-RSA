// Fungsi untuk eksponensiasi modular
function modExp(base, exp, mod) {
    let result = 1;
    base = base % mod;
    while (exp > 0) {
        if (exp % 2 === 1) { // Jika exp adalah ganjil
            result = (result * base) % mod;
        }
        exp = Math.floor(exp / 2); // exp dibagi 2
        base = (base * base) % mod; // base kuadrat
    }
    return result;
}

// Fungsi untuk menemukan faktor persekutuan terbesar
function gcd(a, b) {
    while (b !== 0) {
        const temp = b;
        b = a % b;
        a = temp;
    }
    return a;
}

// Fungsi untuk menemukan invers modular
function modInverse(e, phi) {
    let m0 = phi, t, q;
    let x0 = 0, x1 = 1;

    if (phi === 1) return 0;

    while (e > 1) {
        q = Math.floor(e / phi);
        t = phi;

        phi = e % phi;
        e = t;
        t = x0;

        x0 = x1 - q * x0;
        x1 = t;
    }

    if (x1 < 0) {
        x1 += m0;
    }

    return x1;
}

// Fungsi untuk menghasilkan kunci
function generateKeys() {
    const p = 61; // Pilih bilangan prima p
    const q = 53; // Pilih bilangan prima q
    const n = p * q;
    const phi = (p - 1) * (q - 1);
    let e = 3; // Pilih e
    while (gcd(e, phi) !== 1) {
        e += 2;
    }
    const d = modInverse(e, phi);

    return {
        publicKey: { e, n },
        privateKey: { d, n }
    };
}

// Fungsi untuk mengenkripsi pesan
function encryptMessage(message, publicKey) {
    const { e, n } = publicKey;
    return message.split('').map(char => {
        const m = char.charCodeAt(0);
        return modExp(m, e, n);
    }).join(' ');
}

// Fungsi untuk mendekripsi pesan
function decryptMessage(cipher, privateKey) {
    const { d, n } = privateKey;
    return cipher.split(' ').map(num => {
        const c = parseInt(num, 10);
        return String.fromCharCode(modExp(c, d, n));
    }).join('');
}

const { publicKey, privateKey } = generateKeys();

function encryptText() {
    const inputText = document.getElementById("inputText").value;
    const encrypted = encryptMessage(inputText, publicKey);
    document.getElementById("outputText").value = encrypted;
}

function decryptText() {
    const inputText = document.getElementById("inputText").value;
    const decrypted = decryptMessage(inputText, privateKey);
    document.getElementById("outputText").value = decrypted;
}

// Fungsi untuk mengubah string ke dalam bentuk biner
function textToBinary(text) {
    return text.split('').map(char => {
        const binary = char.charCodeAt(0).toString(2);
        return '00000000'.substring(binary.length) + binary;
    }).join('');
}

// Fungsi untuk mengubah biner ke dalam bentuk string
function binaryToText(binary) {
    const bytes = binary.match(/.{1,8}/g);
    return bytes.map(byte => String.fromCharCode(parseInt(byte, 2))).join('');
}

// Steganografi
function embedText() {
    const canvas = document.getElementById("canvas");
    const ctx = canvas.getContext("2d");
    const imageInput = document.getElementById("imageInput");
    const file = imageInput.files[0];
    const encryptedText = document.getElementById("embedTextInput").value;
    const binaryText = textToBinary(encryptedText);

    const reader = new FileReader();
    reader.onload = function (event) {
        const img = new Image();
        img.onload = function () {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);

            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;

            // Menyisipkan teks biner ke dalam gambar
            for (let i = 0; i < binaryText.length; i++) {
                const bit = binaryText[i];
                if (bit === '1') {
                    data[i * 4] |= 1; // Set bit paling tidak signifikan ke 1
                } else {
                    data[i * 4] &= 254; // Set bit paling tidak signifikan ke 0
                }
            }

            ctx.putImageData(imageData, 0, 0);
            const stegoImage = canvas.toDataURL("image/png");
            const downloadLink = document.getElementById("downloadLink");
            downloadLink.href = stegoImage;
            downloadLink.style.display = "inline";
        }
        img.src = event.target.result;
    }
    reader.readAsDataURL(file);
}

function extractText() {
    const canvas = document.getElementById("canvas");
    const ctx = canvas.getContext("2d");
    const imageInput = document.getElementById("stegoImageInput");
    const file = imageInput.files[0];

    const reader = new FileReader();
    reader.onload = function (event) {
        const img = new Image();
        img.onload = function () {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);

            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;

            let binaryText = '';
            for (let i = 0; i < data.length; i += 4) {
                const bit = data[i] & 1; // Ambil bit paling tidak signifikan
                binaryText += bit;
                if (binaryText.length % 8 ===
                    0 && binaryText.slice(-8) === '00000000') break; // Jika menemukan karakter null, berhenti
            }

            const extractedText = binaryToText(binaryText);

            // Mendekripsi teks yang diekstrak
            const decryptedText = decryptMessage(extractedText, privateKey);
            document.getElementById("extractedText").value = decryptedText;
        }
        img.src = event.target.result;
    }
    reader.readAsDataURL(file);
}
