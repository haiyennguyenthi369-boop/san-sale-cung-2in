import { useState } from "react";
import {
  Clipboard,
  Copy,
  ExternalLink,
  Link2,
  Sparkles,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

export default function App() {
  const [inputUrl, setInputUrl] = useState("");
  const [resultUrl, setResultUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const showMessage = (text, type) => {
    setMessage(text);
    setMessageType(type);
  };

  const pasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();

      if (!text) {
        showMessage("Clipboard đang trống.", "error");
        return;
      }

      setInputUrl(text.trim());
      showMessage("Đã dán link.", "success");
    } catch {
      showMessage("Không đọc được clipboard. Hãy dán link thủ công.", "error");
    }
  };

  const convertLink = async () => {
    const url = inputUrl.trim();

    setMessage("");
    setResultUrl("");

    if (!url) {
      showMessage("Hãy dán link Shopee trước nha.", "error");
      return;
    }

    setLoading(true);

    try {
      // Gọi sang Backend để bảo mật API Key
      const response = await fetch("http://localhost:3001/api/convert", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
      });

      const data = await response.json();

      if (!response.ok) {
        showMessage(data.error || "Không thể chuyển đổi link.", "error");
        return;
      }

      setResultUrl(data.affiliateUrl);
      showMessage("Chuyển đổi thành công 🎉", "success");
    } catch (error) {
      console.error(error);
      showMessage("Không thể kết nối đến máy chủ Backend.", "error");
    } finally {
      setLoading(false);
    }
  };

  const copyResult = async () => {
    if (!resultUrl) return;

    try {
      await navigator.clipboard.writeText(resultUrl);
      showMessage("Đã sao chép link.", "success");
    } catch {
      showMessage("Không thể sao chép link.", "error");
    }
  };

  const buyNow = () => {
    if (!resultUrl) return;

    window.open(resultUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="page">
      <div className="star-background">
        <span className="star star-1"></span>
        <span className="star star-2"></span>
        <span className="star star-3"></span>
        <span className="star star-4"></span>
        <span className="star star-5"></span>
        <span className="star star-6"></span>
        <span className="star star-7"></span>
        <span className="star star-8"></span>
        <span className="star star-9"></span>
        <span className="star star-10"></span>
        <span className="star star-11"></span>
        <span className="star star-12"></span>
        <span className="star star-13"></span>
        <span className="star star-14"></span>
        <span className="star star-15"></span>
        <span className="star star-16"></span>
        <span className="star star-17"></span>
        <span className="star star-18"></span>
        <span className="star star-19"></span>
        <span className="star star-20"></span>
        <span className="star star-21"></span>
        <span className="star star-22"></span>
      </div>
      <main className="container">
        <header
          className="header"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "12px",
          }}
        >
          <img
            src="/gauiu.jpg"
            alt="gauiu"
            style={{
              width: "48px",
              height: "48px",
              objectFit: "cover",
              borderRadius: "12px",
              display: "block",
              flexShrink: 0,
            }}
          />

          <div className="brand">
            <div className="main-title">SĂN SALE CÙNG 2IN</div>
          </div>

          <div className="sparkle">
            <Sparkles size={18} />
          </div>
        </header>

        <section className="card">
          <div className="intro">
            <h1>
              Dán link sản phẩm để nhận
              <br />
              voucher mạng xã hội
            </h1>
          </div>

          <div className="input-box">
            <label>Link Shopee</label>

            <input
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              placeholder="Dán link shopee ở đây nha"
            />

            <button className="paste-button" onClick={pasteFromClipboard}>
              <Clipboard size={18} />
              Dán từ clipboard
            </button>

            <button
              className="convert-button"
              onClick={convertLink}
              disabled={loading}
            >
              {loading ? "Đang chuyển đổi..." : "Chuyển đổi"}
            </button>

            {message ? (
              <div
                className={
                  messageType === "success"
                    ? "message success"
                    : "message error"
                }
              >
                {messageType === "success" ? (
                  <CheckCircle2 size={18} />
                ) : (
                  <AlertCircle size={18} />
                )}
                <span>{message}</span>
              </div>
            ) : null}
          </div>

          {resultUrl ? (
            <div className="result-box">
              <div className="result-title">
                <Link2 size={17} />
                Link kết quả
              </div>

              <div className="result-buttons">
                <button className="copy-button" onClick={copyResult}>
                  <Copy size={18} />
                  Sao chép
                </button>

                <button className="buy-button" onClick={buyNow}>
                  <ExternalLink size={18} />
                  Mua ngay
                </button>
              </div>
            </div>
          ) : null}
        </section>

        <footer>
          Vận hành bởi <b>2IN nha hehe</b>
        </footer>
      </main>
    </div>
  );
}