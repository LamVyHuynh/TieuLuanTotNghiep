const Hanshids = require("hashids/cjs");

const hashids = new Hanshids("HealtyGo2026", 8);

const encodeId = (id) => {
  if (!id) return id;
  return hashids.encode(id); // Biến số thành chữ (VD: 15 -> 'x7bA9Rkz')
};

const decodeId = (hashId) => {
  if (!hashId) return hashId;

  const decoded = hashids.decode(hashId); // Biến chữ thành số (VD: 'x7bA9Rkz' -> 15)
  return decoded.length > 0 ? decoded[0] : null; // Nếu giải mã thành công, trả về số đầu tiên, nếu không trả về null
};

module.exports = {
  encodeId,
  decodeId,
};
