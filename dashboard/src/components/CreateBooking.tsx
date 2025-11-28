import React from "react";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectGroup,
  SelectContent,
  SelectTrigger,
  SelectValue,
  SelectLabel,
} from "@/components/ui/select";
import axios from "axios";
import { Card } from "./ui/card";
import { SelectItem } from "@radix-ui/react-select";
import { Label } from "./ui/label";

interface FormValues {
  first_name: string;
  last_name: string;
  gender: "male" | "female";
  grade: number;
  age: number;
  phone_number: string;
  day_per_week: number;
  hr_per_day: number;
  address: string;
}

const genderOptions = [
  { code: "male", Label: "Male" },
  { code: "female", Label: "Female" },
];

const CreateBooking: React.FC = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormValues>({
    defaultValues: {
      gender: "male",
      first_name: "",
      last_name: "",
      age: 0,
      grade: 0,
      phone_number: "",
      day_per_week: 0,
      hr_per_day: 0,
    },
  });

  const onSubmit = async (data: FormValues) => {
    // Convert string values to correct types
    const transformed = {
      ...data,
      age: typeof data.age === "string" ? parseInt(data.age) : data.age,
      grade: typeof data.grade === "string" ? parseInt(data.grade) : data.grade,
      day_per_week:
        typeof data.day_per_week === "string"
          ? parseInt(data.day_per_week)
          : data.day_per_week,
      hr_per_day:
        typeof data.hr_per_day === "string"
          ? parseInt(data.hr_per_day)
          : data.hr_per_day,
      gender: data.gender === "male" ? "male" : "female",
    };
    const token = localStorage.getItem("auth");
    try {
      console.log(transformed);
      await axios.post("/api/v1/bookings", transformed, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      reset();
      alert("Booking created successfully!");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      alert(message || "Failed to create booking");
    }
  };

  return (
    <Card className="max-w-full mx-auto p-6 space-y-4">
      <h2 className="text-2xl font-bold mb-2 text-white">Create Booking</h2>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="flex w-full">
          <div className="pr-20">
            <Label htmlFor="first_name">First Name</Label>
            <Input
              type="text"
              placeholder="First Name"
              {...register("first_name", {
                required: "First Name is required",
              })}
            />
            {errors.first_name && (
              <span className="text-red-500 text-xs">
                {errors.first_name.message}
              </span>
            )}
          </div>
          <div>
            <Label htmlFor="last_name">Last Name</Label>
            <Input
              type="text"
              placeholder="Last Name"
              {...register("last_name", { required: "Last Name is required" })}
            />
            {errors.last_name && (
              <span className="text-red-500 text-xs">
                {errors.last_name.message}
              </span>
            )}
          </div>
        </div>
        <Label htmlFor="phone_number">Phone Number</Label>
        <Input
          type="text"
          placeholder="Phone Number"
          {...register("phone_number", {
            required: "Phone Number is required",
          })}
        />
        {errors.phone_number && (
          <span className="text-red-500 text-xs">
            {errors.phone_number.message}
          </span>
        )}
        <div className="flex justify-between">
          <div>
            <Label htmlFor="address">Address</Label>
            <Input
              type="text"
              placeholder="Address"
              {...register("address", { required: "Address is required" })}
            />
            {errors.address && (
              <span className="text-red-500 text-xs">
                {errors.address.message}
              </span>
            )}
          </div>
          <div>
            <Label htmlFor="gender">Gender</Label>
            <Select {...register("gender", { required: "Gender is required" })}>
              <SelectTrigger>
                <SelectValue placeholder="Select Gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Gender</SelectLabel>
                  {genderOptions.map((option) => (
                    <SelectItem key={option.code} value={option.code}>
                      {option.Label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            {errors.gender && (
              <span className="text-red-500 text-xs">
                {errors.gender.message}
              </span>
            )}
          </div>
        </div>
        <div className="flex justify-between">
          <div>
            <Label htmlFor="age">Age</Label>
            <Input
              type="number"
              placeholder="Age"
              {...register("age", { required: "Age is required" })}
            />
            {errors.age && (
              <span className="text-red-500 text-xs">{errors.age.message}</span>
            )}
          </div>
          <div>
            <Label htmlFor="grade">Grade</Label>
            <Input
              type="number"
              placeholder="Grade"
              {...register("grade", { required: "Grade is required" })}
            />
            {errors.grade && (
              <span className="text-red-500 text-xs">
                {errors.grade.message}
              </span>
            )}
          </div>
        </div>
        <div className="flex justify-between">
          <div>
            <Label htmlFor="day_per_week">Days per Week</Label>
            <Input
              type="number"
              placeholder="Days per Week"
              {...register("day_per_week", {
                required: "Days per Week is required",
              })}
            />
            {errors.day_per_week && (
              <span className="text-red-500 text-xs">
                {errors.day_per_week.message}
              </span>
            )}
          </div>
          <div>
            <Label htmlFor="hr_per_day">Hours per Day</Label>
            <Input
              type="number"
              placeholder="Hours per Day"
              {...register("hr_per_day", {
                required: "Hours per Day is required",
              })}
            />
            {errors.hr_per_day && (
              <span className="text-red-500 text-xs">
                {errors.hr_per_day.message}
              </span>
            )}
          </div>
        </div>
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Submitting..." : "Create"}
        </Button>
      </form>
    </Card>
  );
};

export default CreateBooking;
