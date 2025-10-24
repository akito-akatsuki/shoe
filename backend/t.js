const { sendEmail } = require("./utils/sendMail/sendMail");

const run = async () => {
  try {
    // Gửi email test

    await sendEmail("welcome", "hoan21041995@gmail.com", { userName: "Hoàn" });
  } catch (error) {
    console.error("Lỗi khi chạy sendMail:", error);
  }
};

run();
