import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import axios from "axios";
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
      // Change the URL to your backend login endpoint
      const response = await axios.post("/api/admin/login", data);
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
    <section className="container mx-auto w-screen h-screen flex flex-col justify-center items-center">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="border-1 p-10 w-fit flex flex-col gap-5 min-w-80"
      >
        <h1 className="scroll-m-20 text-center text-4xl font-extrabold tracking-tight text-balance">
          Welcome to Hiyab Tutor
        </h1>
        <Input
          type="text"
          placeholder="Username"
          {...register("username", { required: "Username is required" })}
        />
        {errors.username && (
          <span className="text-red-500 text-xs">
            {errors.username.message}
          </span>
        )}
        <div className="relative">
          <Input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            {...register("password", { required: "Password is required" })}
          />
          <button
            type="button"
            tabIndex={-1}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        {errors.password && (
          <span className="text-red-500 text-xs">
            {errors.password.message}
          </span>
        )}
        {error && (
          <span className="text-red-500 text-xs text-center">{error}</span>
        )}
        <Button className="w-full" type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Logging in..." : "Login"}
        </Button>
      </form>
    </section>
  );
};

export default LoginPage;
