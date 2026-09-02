import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import crypto from "crypto";

dotenv.config();

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
  })
);

app.use(express.json());

const PORT = process.env.PORT || 3001;

const APP_ID = process.env.SHOPEE_APP_ID;
const APP_SECRET = process.env.SHOPEE_APP_SECRET;

app.get("/", (req, res) => {
  res.json({
    status: "ok",
    message: "Backend Săn Sale Cùng 2IN đang hoạt động!",
  });
});

app.post("/api/convert", async (req, res) => {
  try {
    let { url } = req.body;

    if (!url) {
      return res.status(400).json({ error: "Bạn chưa nhập link Shopee." });
    }

    if (!APP_ID || !APP_SECRET) {
      return res.status(500).json({
        error: "Chưa cấu hình Shopee APP_ID hoặc SHOPEE_APP_SECRET trong file .env",
      });
    }

    try {
      url = decodeURIComponent(url.trim());
    } catch (e) {
      url = url.trim();
    }

    const timestamp = Math.floor(Date.now() / 1000);

    // Cấu trúc GraphQL chứa đối tượng input đúng chuẩn Shopee yêu cầu
    const payload = {
      query: `mutation GenerateLink($input: ShortLinkInput!) {
        generateShortLink(input: $input) {
          shortLink
        }
      }`,
      variables: {
        input: {
          originUrl: url
        }
      }
    };

    const payloadString = JSON.stringify(payload);

    // Tạo chữ ký HMAC-SHA256
    const factor = `${APP_ID}${timestamp}${payloadString}${APP_SECRET}`;
    const signature = crypto.createHash("sha256").update(factor).digest("hex");

    const response = await fetch("https://open-api.affiliate.shopee.vn/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `SHA256 Credential=${APP_ID}, Timestamp=${timestamp}, Signature=${signature}`,
      },
      body: payloadString,
    });

    const data = await response.json();

    console.log("\n=================== SHOPEE API RESPONSE ===================");
    console.log(JSON.stringify(data, null, 2));
    console.log("===========================================================\n");

    const shortLink = data?.data?.generateShortLink?.shortLink;

    if (shortLink) {
      return res.json({ affiliateUrl: shortLink });
    } else {
      const errorDetail = data?.errors?.[0]?.message || "Shopee từ chối tạo link này.";
      return res.status(400).json({
        error: `Shopee báo lỗi: ${errorDetail}`,
        detail: data,
      });
    }
  } catch (error) {
    console.error("SERVER ERROR:", error);
    res.status(500).json({ error: "Lỗi hệ thống máy chủ backend." });
  }
});

app.listen(PORT, () => {
  console.log(`Backend chạy bảo mật tại http://localhost:${PORT}`);
});