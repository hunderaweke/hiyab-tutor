import { useState } from "react";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { useForm, Controller } from "react-hook-form";
import { Eye, EyeOff } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import axios from "axios";
interface AdminFormInputs {
  username: string;
  name: string;
  role: string;
  password: string;
}
const CreateAdmin = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    control,
  } = useForm<AdminFormInputs>();
  const [role, setRole] = useState("admin");
  const [showPassword, setShowPassword] = useState(false);
  const getRole = async () => {
    const token = localStorage.getItem("auth");
    const resp = await axios.get("/api/admin/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    setRole(resp.data.role);
  };
  getRole();
  const onSubmit = async (data: AdminFormInputs) => {
    const token = localStorage.getItem("auth");
    const resp = await axios.post("/api/admin/", data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log(resp.data);
    reset();
  };
  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="max-w-full my-auto mx-auto p-6 space-y-4 border rounded-md bg-white"
    >
      <h2 className="text-2xl font-bold mb-2">Create Testimonial</h2>
      <Label htmlFor="name">Name</Label>
      <Input
        type="text"
        placeholder="Name"
        {...register("name", { required: "Name is required" })}
        aria-invalid={!!errors.name}
      />
      {errors.name && (
        <span className="text-red-500 text-xs">{errors.name.message}</span>
      )}
      <Label htmlFor="role">Role</Label>
      <Controller
        name="role"
        control={control}
        rules={{ required: "Role is required" }}
        render={({ field }) => (
          <Select value={field.value} onValueChange={field.onChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select role" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Roles</SelectLabel>
                <SelectItem value="admin">Admin</SelectItem>
                {role === "superadmin" && (
                  <SelectItem value="superadmin">Super Admin</SelectItem>
                )}
              </SelectGroup>
            </SelectContent>
          </Select>
        )}
      />
      {errors.role && (
        <span className="text-red-500 text-xs">{errors.role.message}</span>
      )}
      <Label htmlFor="username">Username</Label>
      <Input
        type="text"
        placeholder="Username"
        {...register("username", { required: "Username is required" })}
        aria-invalid={!!errors.username}
      />
      {errors.username && (
        <span className="text-red-500 text-xs">{errors.username.message}</span>
      )}
      <Label htmlFor="password">Password</Label>
      <div className="relative">
        <Input
          type={showPassword ? "text" : "password"}
          placeholder="Password"
          {...register("password", { required: "Password is required" })}
          aria-invalid={!!errors.password}
        />
        <button
          type="button"
          className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500"
          onClick={() => setShowPassword((v) => !v)}
          tabIndex={-1}
        >
          {showPassword ? (
            <EyeOff className="w-5 h-5" />
          ) : (
            <Eye className="w-5 h-5" />
          )}
        </button>
      </div>
      {errors.password && (
        <span className="text-red-500 text-xs">{errors.password.message}</span>
      )}
      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Submitting..." : "Create"}
      </Button>
    </form>
  );
};

export default CreateAdmin;
