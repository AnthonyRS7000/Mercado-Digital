import React, { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import bdMercado from "../services/bdMercado";

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Extraemos token y email desde la URL
  const token = searchParams.get("token");
  const email = searchParams.get("email");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Las contraseñas no coinciden");
      return;
    }

    setLoading(true);
    try {
      const { data } = await bdMercado.post("/reset-password", {
        email,
        token,
        password,
        password_confirmation: confirmPassword,
      });

      toast.success(data.message || "Contraseña restablecida");
      setTimeout(() => navigate("/login"), 2000); // Redirige a login después de 2s
    } catch (err) {
      toast.error(err.response?.data?.error || "Error al restablecer la contraseña");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
      <div className="card shadow p-4" style={{ maxWidth: "400px", width: "100%" }}>
        <h4 className="mb-3 text-center">Restablecer Contraseña</h4>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <input
              type="password"
              className="form-control"
              placeholder="Nueva contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
            />
          </div>
          <div className="mb-3">
            <input
              type="password"
              className="form-control"
              placeholder="Confirmar contraseña"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={8}
            />
          </div>
          <button className="btn btn-primary w-100" type="submit" disabled={loading}>
            {loading ? "Procesando..." : "Restablecer Contraseña"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
