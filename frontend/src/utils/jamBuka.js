/**
 * Menentukan apakah kedai sedang buka.
 * Jam dihitung dalam zona waktu kedai (mis. Asia/Jakarta), bukan zona waktu
 * perangkat pembeli, supaya hasilnya sama di mana pun website dibuka.
 */

/** "10:00" → 600 (menit sejak tengah malam) */
const keMenit = (hhmm) => {
  const [jam, menit] = hhmm.split(':').map(Number)
  return jam * 60 + menit
}

/**
 * @param {{ jam_mulai: string, jam_tutup: string, zona_waktu?: string }} info  data dari /api/info
 * @param {Date} waktu  waktu yang dicek (default: sekarang)
 * @returns {boolean} true jika sedang buka
 */
export function sedangBuka(info, waktu = new Date()) {
  const bagian = new Intl.DateTimeFormat('en-GB', {
    timeZone: info.zona_waktu || 'Asia/Jakarta',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(waktu)

  // Ambil angka jam / menit dari hasil format waktu.
  const ambil = (jenis) => Number(bagian.find((b) => b.type === jenis).value)
  const sekarang = ambil('hour') * 60 + ambil('minute')
  const mulai = keMenit(info.jam_mulai)
  const tutup = keMenit(info.jam_tutup)

  // Jam biasa (10:00–21:00) atau melewati tengah malam (mis. 18:00–02:00)
  return mulai <= tutup ? sekarang >= mulai && sekarang < tutup : sekarang >= mulai || sekarang < tutup
}
