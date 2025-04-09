import { useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios";

const AuthLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:9000/users/adminlogin", {
        email,
        password,
      });

      const { token, user } = res.data;

      if (user.user_type !== "ADMIN") {
        alert("Access restricted to admin users.");
        return;
      }

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      navigate("/"); // ✅ Redirect to dashboard
    } catch (err) {
      alert("Invalid credentials");
    }
  };

  return (
    <form onSubmit={handleLogin} className="flex flex-col gap-4">
      <input
        className="border p-2 rounded"
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <input
        className="border p-2 rounded"
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <button
        type="submit"
        className="bg-primary text-white p-2 rounded hover:bg-opacity-80"
      >
        Login
      </button>
    </form>
  );
};

export default AuthLogin;
