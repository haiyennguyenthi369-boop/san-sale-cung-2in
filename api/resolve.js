export default async function handler(req, res) {
  const rawUrl = req.query.url;

  if (!rawUrl) {
    return res.status(400).json({
      error: "Thiếu link Shopee",
    });
  }

  try {
    const input = new URL(rawUrl);

    const allowedHosts = [
      "vn.shp.ee",
      "s.shopee.vn",
      "shopee.vn",
    ];

    if (!allowedHosts.includes(input.hostname)) {
      return res.status(400).json({
        error: "Link Shopee không hợp lệ",
      });
    }

    let currentUrl = input.toString();

    for (let i = 0; i < 5; i++) {
      const response = await fetch(currentUrl, {
        method: "GET",
        redirect: "manual",
      });

      const location = response.headers.get("location");

      if (!location) {
        break;
      }

      currentUrl = new URL(location, currentUrl).toString();
    }

    const finalUrl = new URL(currentUrl);

    if (
      finalUrl.hostname !== "shopee.vn" &&
      !finalUrl.hostname.endsWith(".shopee.vn")
    ) {
      return res.status(400).json({
        error: "Không tìm thấy trang sản phẩm Shopee",
      });
    }

    return res.status(200).json({
      finalUrl: finalUrl.toString(),
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: "Không thể xử lý link Shopee",
    });
  }
}
