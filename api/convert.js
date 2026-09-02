import crypto from "crypto";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { url } = req.body;
  if (!url) {
    return res.status(400).json({ error: "Thiếu URL Shopee" });
  }

  // Lấy API key và cắt bỏ khoảng trắng dư thừa
  const appId = (process.env.SHOPEE_APP_ID || "").trim();
  const appSecret = (process.env.SHOPEE_APP_SECRET || "").trim();

  if (!appId || !appSecret) {
    return res.status(500).json({ error: "Chưa cấu hình API Key trên Vercel" });
  }

  try {
    // 1. Giải mã link rút gọn s.shopee.vn thành link gốc
    let targetUrl = url;
    try {
      const redirectResponse = await fetch(url, { method: "HEAD", redirect: "follow" });
      if (redirectResponse.url) {
        targetUrl = redirectResponse.url;
      }
    } catch (e) {
      // Giữ nguyên URL nếu không mở rộng được
    }

    // 2. Tạo payload GraphQL
    const timestamp = Math.floor(Date.now() / 1000);
    const query = `mutation { generateUrlLink(input: { originUrl: "${targetUrl}" }) { shortLink } }`;
    const payload = JSON.stringify({ query });

    // 3. Tạo Signature chuẩn Shopee Open API: appId + timestamp + payload + appSecret
    const factor = appId + timestamp + payload + appSecret;
    const signature = crypto.createHash("sha256").update(factor).digest("hex");

    // 4. Gọi Shopee Affiliate API
    const response = await fetch("https://open-api.affiliate.shopee.vn/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `SHA256 Credential=${appId}, Timestamp=${timestamp}, Signature=${signature}`,
      },
      body: payload,
    });

    const data = await response.json();
    const shortLink = data?.data?.generateUrlLink?.shortLink;

    if (!shortLink) {
      console.error("Shopee API Error:", JSON.stringify(data));
      return res.status(400).json({ error: data?.errors?.[0]?.message || "Không tạo được link affiliate" });
    }

    return res.status(200).json({ affiliateUrl: shortLink });
  } catch (err) {
    return res.status(500).json({ error: "Lỗi kết nối máy chủ" });
  }
}
