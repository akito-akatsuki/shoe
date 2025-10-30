function getVNDate() {
  const now = new Date();
  const vietnamOffset = 7 * 60 * 60 * 1000;
  const local = new Date(now.getTime() + vietnamOffset);
  return local.toISOString().slice(0, 19).replace("T", " ");
}

module.exports = getVNDate;