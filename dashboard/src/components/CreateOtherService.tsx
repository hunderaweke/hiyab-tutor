import React, { useState } from "react";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "./ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
} from "@/components/ui/select";
import axios from "axios";
import { Label } from "@radix-ui/react-label";

interface Translation {
  language_code: string;
  name: string;
  description: string;
  tag_line: string;
}

interface FormValues {
  website_url: string;
  image: string;
  languages: Translation[];
}

const languageOptions = [
  { code: "en", label: "English" },
  { code: "am", label: "Amharic" },
  { code: "om", label: "Oromo" },
  // Add more languages as needed
];

const CreateOtherService: React.FC = () => {
  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormValues>({
    defaultValues: {
      languages: [
        { language_code: "en", name: "", description: "", tag_line: "" },
      ],
    },
  });
  const { fields, append, remove } = useFieldArray({
    control,
    name: "languages",
  });
  const [imagePreview, setImagePreview] = useState<string>("");
  const [imageFile, setImageFile] = useState<File | null>(null);

  const onSubmit = async (data: FormValues) => {
    const token = localStorage.getItem("auth");
    try {
      const formData = new FormData();
      formData.append("website_url", data.website_url);
      if (imageFile) formData.append("image", imageFile);
      formData.append("languages", JSON.stringify(data.languages));
      await axios.post("/api/other-services/", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      reset();
      setImagePreview("");
      setImageFile(null);
      alert("Other service created successfully!");
    } catch (err: any) {
      alert(err.message || "Failed to create other service");
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="max-w-full mx-auto p-6 space-y-4 border rounded-md bg-white"
    >
      <h2 className="text-2xl font-bold mb-2">Create Other Service</h2>
      <label htmlFor="website_url">Website URL</label>
      <Input
        type="text"
        placeholder="Website URL"
        {...register("website_url", { required: "Website URL is required" })}
      />
      {errors.website_url && (
        <span className="text-red-500 text-xs">
          {errors.website_url.message}
        </span>
      )}

      <label htmlFor="image">Image</label>
      <Input
        type="file"
        accept="image/*"
        onChange={(e) => {
          const file = e.target.files?.[0] || null;
          setImageFile(file);
          setImagePreview(file ? URL.createObjectURL(file) : "");
        }}
      />
      {imagePreview && (
        <img
          src={imagePreview}
          alt="Preview"
          className="w-24 h-24 object-cover rounded mb-2"
        />
      )}

      <h3 className="text-lg font-semibold mt-4">Translations</h3>
      {fields.map((field, idx) => (
        <div key={field.id} className="border p-2 mb-2 rounded">
          <label className="block mb-1">Language</label>
          <Controller
            name={`languages.${idx}.language_code`}
            control={control}
            rules={{ required: "Language is required" }}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Languages</SelectLabel>
                    {languageOptions.map((lang) => (
                      <SelectItem key={lang.code} value={lang.code}>
                        {lang.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            )}
          />
          <Label htmlFor={`languages.${idx}.name`}>Name</Label>
          <Input
            type="text"
            placeholder="Name"
            {...register(`languages.${idx}.name`, {
              required: "Name is required",
            })}
          />
          <Label htmlFor={`languages.${idx}.description`}>Description</Label>
          <Textarea
            placeholder="Description"
            {...register(`languages.${idx}.description`, {
              required: "Description is required",
            })}
          />
          <Label htmlFor={`languages.${idx}.tag_line`}>Tag Line</Label>
          <Input
            type="text"
            placeholder="Tag Line"
            {...register(`languages.${idx}.tag_line`, {
              required: "Tag line is required",
            })}
          />
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={() => remove(idx)}
            className="mt-2"
          >
            Remove
          </Button>
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() =>
          append({
            language_code: "en",
            name: "",
            description: "",
            tag_line: "",
          })
        }
      >
        Add Translation
      </Button>
      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Submitting..." : "Create"}
      </Button>
    </form>
  );
};

export default CreateOtherService;
