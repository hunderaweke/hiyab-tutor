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
      className="max-w-full mx-auto p-6 space-y-4 border rounded-md bg-white"
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
      <Input
        type="text"
        placeholder="Role"
        {...register("role", { required: "Role is required" })}
        aria-invalid={!!errors.role}
      />
      {errors.role && (
        <span className="text-red-500 text-xs">{errors.role.message}</span>
      )}
      <Label htmlFor="video">Video</Label>
      <Input
        type="file"
        placeholder="Video URL (optional)"
        {...register("video")}
        onChange={handleVideoChange}
      />
      {videoPreview && (
        <video
          src={videoPreview}
          controls
          className="max-w-lg max-h-96 border rounded mb-2"
        />
      )}
      <Label htmlFor="thumbnail">Thumbnail</Label>
      <Input
        type="file"
        placeholder="Thumbnail URL (optional)"
        {...register("thumbnail")}
        onChange={handleThumbnailChange}
      />
      {thumbnailPreview && (
        <img
          src={thumbnailPreview}
          alt="Thumbnail preview"
          className="max-w-lg max-h-96 border rounded mb-2"
        />
      )}
      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Submitting..." : "Create"}
      </Button>
    </form>
  );
};

export default CreateTestimonial;
