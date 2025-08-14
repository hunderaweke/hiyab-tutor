import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "./ui/label";
import axios from "axios";
import { useNavigate } from "react-router-dom";
type PartnerFormInputs = {
  name: string;
  website_url?: string;
  image?: FileList;
};

import { useState } from "react";

const CreatePartner = () => {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<PartnerFormInputs>();

  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImagePreview(URL.createObjectURL(file));
    } else {
      setImagePreview(null);
    }
  };

  const onSubmit = async (data: PartnerFormInputs) => {
    const token = localStorage.getItem("auth");
    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("website_url", data.website_url ? data.website_url : "");
    if (data.image) {
      formData.append("image", data.image[0]);
    }
    const resp = await axios.post("/api/partners/", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${token}`,
      },
    });
    console.log(resp.data);
    navigate(`/partners/${resp.data.id}`);
    reset();
    setImagePreview(null);
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="max-w-full mx-auto p-6 space-y-4 border rounded-md bg-white"
    >
      <h2 className="text-2xl font-bold mb-2">Add Partner</h2>
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
      <Label htmlFor="website_url">Website URL</Label>
      <Input
        type="text"
        placeholder="Website URL"
        {...register("website_url")}
        aria-invalid={!!errors.website_url}
      />
      {errors.website_url && (
        <span className="text-red-500 text-xs">
          {errors.website_url.message}
        </span>
      )}
      <Label htmlFor="thumbnail">Logo (Image)</Label>
      <Input
        type="file"
        placeholder="Logo (Image)"
        {...register("image")}
        onChange={handleImageChange}
      />
      {imagePreview && (
        <img
          src={imagePreview}
          alt="Image preview"
          className="max-w-lg max-h-96 border rounded mb-2"
        />
      )}
      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Submitting..." : "Create"}
      </Button>
    </form>
  );
};

export default CreatePartner;
