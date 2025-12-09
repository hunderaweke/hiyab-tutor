import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "./ui/label";
import axios from "axios";
import { useNavigate } from "react-router-dom";
type TestimonialFormInputs = {
  name: string;
  role: string;
  video?: FileList;
  thumbnail?: FileList;
};

import { useState } from "react";

const CreateTestimonial = () => {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<TestimonialFormInputs>();

  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setVideoPreview(URL.createObjectURL(file));
    } else {
      setVideoPreview(null);
    }
  };

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setThumbnailPreview(URL.createObjectURL(file));
    } else {
      setThumbnailPreview(null);
    }
  };

  const onSubmit = async (data: TestimonialFormInputs) => {
    const token = localStorage.getItem("auth");
    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("role", data.role);
    if (data.video) {
      formData.append("video", data.video[0]);
    }
    if (data.thumbnail) {
      formData.append("thumbnail", data.thumbnail[0]);
    }
    const resp = await axios.post("/api/v1/testimonials/", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${token}`,
      },
    });
    navigate(`/testimonials/${resp.data.id}`);
    reset();
    setVideoPreview(null);
    setThumbnailPreview(null);
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="max-w-2xl mx-auto p-6 space-y-6 border rounded-lg bg-card shadow-sm"
    >
      <h2 className="text-2xl font-bold text-foreground">Create Testimonial</h2>

      <div className="space-y-2">
        <Label htmlFor="name" className="text-foreground">
          Name *
        </Label>
        <Input
          type="text"
          placeholder="Enter full name"
          {...register("name", { required: "Name is required" })}
          aria-invalid={!!errors.name}
          className="bg-background text-foreground"
        />
        {errors.name && (
          <span className="text-red-500 text-sm">{errors.name.message}</span>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="role" className="text-foreground">
          Role *
        </Label>
        <Input
          type="text"
          placeholder="e.g., Student, Parent, Teacher"
          {...register("role", { required: "Role is required" })}
          aria-invalid={!!errors.role}
          className="bg-background text-foreground"
        />
        {errors.role && (
          <span className="text-red-500 text-sm">{errors.role.message}</span>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="video" className="text-foreground">
          Video (optional)
        </Label>
        <Input
          type="file"
          accept="video/*"
          {...register("video")}
          onChange={handleVideoChange}
          className="bg-background text-foreground"
        />
        {videoPreview && (
          <video
            src={videoPreview}
            controls
            className="w-full max-h-96 border rounded-md mt-2"
          />
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="thumbnail" className="text-foreground">
          Thumbnail (optional)
        </Label>
        <Input
          type="file"
          accept="image/*"
          {...register("thumbnail")}
          onChange={handleThumbnailChange}
          className="bg-background text-foreground"
        />
        {thumbnailPreview && (
          <img
            src={thumbnailPreview}
            alt="Thumbnail preview"
            className="w-full max-h-96 object-cover border rounded-md mt-2"
          />
        )}
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Creating..." : "Create Testimonial"}
      </Button>
    </form>
  );
};

export default CreateTestimonial;
