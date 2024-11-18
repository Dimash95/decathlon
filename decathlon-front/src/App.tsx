import axios from "axios";
import { QRCodeSVG } from "qrcode.react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function App() {
  const [name, setName] = useState<string>(
    () => localStorage.getItem("name") || "",
  );
  const [action, setAction] = useState(
    () => localStorage.getItem("action") || "Check-in",
  );
  const [qrValue, setQrValue] = useState<string>("");
  const [showModal, setShowModal] = useState<boolean>(!name);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const generateQrCode = () => {
      const uniqueValue = `checkin-${Date.now()}`;
      setQrValue(uniqueValue);
    };

    generateQrCode();
    const interval = setInterval(generateQrCode, 10 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    localStorage.setItem("action", action);
  }, [action]);

  const handleSubmitName = () => {
    if (name.trim()) {
      localStorage.setItem("name", name);
      setShowModal(false);
    }
  };

  const handleSendData = async () => {
    if (!name) {
      alert("Введите имя перед отправкой.");
      return;
    }

    const date = new Date().toISOString();
    const timestamp = new Date(date).toLocaleString("ru-RU", {
      timeZoneName: "short",
    });

    setLoading(true);
    try {
      const response = await axios.post("http://localhost:4000/attendance", {
        name,
        action,
        timestamp,
      });

      if (response.status === 200) {
        console.log("Данные успешно отправлены:", response.data);
        alert(`Успешно отправлено: ${action}`);
        setAction(action === "Check-in" ? "Check-out" : "Check-in");
      } else {
        throw new Error(`Ошибка: ${response.statusText}`);
      }
    } catch (error) {
      console.error("Ошибка при отправке данных:", error);
      alert("Ошибка отправки данных.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-gray-100 p-4">
      <div className="flex flex-col items-center bg-white shadow-lg rounded-lg p-6">
        <h1 className="text-xl font-bold mb-4">Добро пожаловать!</h1>
        <QRCodeSVG value={qrValue} className="w-32 h-32" />
        <p className="mt-4">QR-код обновляется каждые 10 минут.</p>
      </div>

      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
          <div className="flex flex-col gap-4 bg-white rounded-lg p-6 shadow-lg max-w-md w-full">
            <h2 className="text-lg font-bold">Введите ваше имя</h2>
            <Input
              type="text"
              placeholder="Введите имя"
              value={name}
              onChange={e => setName(e.target.value)}
            />
            <Button onClick={handleSubmitName}>Сохранить</Button>
          </div>
        </div>
      )}

      <div className="mt-6 flex gap-4">
        <Button
          onClick={handleSendData}
          disabled={loading}
          variant={`${action === "Check-in" ? "default" : "destructive"}`}
        >
          {action === "Check-in" ? "Приход" : "Уход"}
        </Button>
      </div>
    </div>
  );
}

export default App;
