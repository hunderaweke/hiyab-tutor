import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import axios from "axios";
import api from "@/lib/api";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

type LoginFormInputs = {
  username: string;
  password: string;
};
interface User {
  id: number;
  created_at: string;
  updated_at: string;
  username: string;
  role: string;
  name: string;
}
interface LoginResponse {
  refresh_token: string;
  access_token: string;
  user: User;
}
const LoginPage = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormInputs>();
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const onSubmit = async (data: LoginFormInputs) => {
    setError("");
    try {
      const response = await api.post("/admin/login", data);
      const resp = response.data as LoginResponse;
      localStorage.setItem("auth", resp.access_token);
      navigate("/");
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || "Login failed");
      } else {
        setError("Login failed");
      }
    }
  };

  return (
    <section className="container mx-auto w-screen h-screen flex flex-col justify-center items-center bg-gradient-to-br from-[var(--color-main)] to-[#002A0F]">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-10 w-fit flex flex-col gap-6 min-w-80 shadow-2xl"
      >
        <h1 className="scroll-m-20 text-center text-4xl font-extrabold tracking-tight text-balance text-white">
          Welcome to Hyab Tutor
        </h1>
        <Input
          type="text"
          placeholder="Username"
          {...register("username", { required: "Username is required" })}
          className="bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:border-[var(--color-brand-green)]"
        />
        {errors.username && (
          <span className="text-red-400 text-xs">
            {errors.username.message}
          </span>
        )}
        <div className="relative">
          <Input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            {...register("password", { required: "Password is required" })}
            className="bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:border-[var(--color-brand-green)] pr-10"
          />
          <button
            type="button"
            tabIndex={-1}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white transition-colors"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        {errors.password && (
          <span className="text-red-400 text-xs">
            {errors.password.message}
          </span>
        )}
        {error && (
          <span className="text-red-400 text-xs text-center bg-red-500/10 border border-red-500/20 rounded px-3 py-2">
            {error}
          </span>
        )}
        <Button
          className="w-full bg-[var(--color-brand-green)] hover:bg-[#1ed760] text-[var(--color-main)] font-semibold py-3 rounded-lg transition-colors"
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Logging in..." : "Login"}
        </Button>
      </form>
    </section>
  );
};

export default LoginPage;
