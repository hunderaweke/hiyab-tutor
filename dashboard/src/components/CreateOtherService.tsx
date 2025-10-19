import React, { useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
/* axios removed (unused) */
import api from "@/lib/api";

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

// language options can be added here if used in the future

const CreateOtherService: React.FC = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    control,
  } = useForm<FormValues>({
    defaultValues: {
      languages: [
        { language_code: "en", name: "", description: "", tag_line: "" },
      ],
    },
  });
  const [imagePreview, setImagePreview] = useState<string>("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const { fields, append, remove } = useFieldArray({
    control,
    name: "languages",
  });

  const onSubmit = async (data: FormValues) => {
    try {
      const formData = new FormData();
      formData.append("website_url", data.website_url);
      if (imageFile) formData.append("image", imageFile);
      formData.append("languages", JSON.stringify(data.languages));
      await api.post("/other-services/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      reset();
      setImagePreview("");
      setImageFile(null);
      alert("Other service created successfully!");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      alert(message || "Failed to create other service");
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="max-w-3xl mx-auto p-6 space-y-6 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl"
    >
      <h2 className="text-2xl font-bold mb-2 text-white">
        Create Other Service
      </h2>

      <div className="space-y-2">
        <label htmlFor="website_url" className="text-white/80 text-sm">
          Website URL
        </label>
        <Input
          type="text"
          placeholder="https://example.com"
          {...register("website_url", { required: "Website URL is required" })}
          className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
        />
        {errors.website_url && (
          <span className="text-red-400 text-xs">
            {errors.website_url.message}
          </span>
        )}
      </div>

      <div className="space-y-2">
        <label htmlFor="image" className="text-white/80 text-sm">
          Image
        </label>
        <Input
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0] || null;
            setImageFile(file);
            setImagePreview(file ? URL.createObjectURL(file) : "");
          }}
          className="bg-white/10 border-white/20 text-white"
        />
        {imagePreview && (
          <img
            src={imagePreview}
            alt="Preview"
            className="w-24 h-24 object-cover rounded-lg border border-white/20"
          />
        )}
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-white font-semibold">Translations</h3>
          <Button
            type="button"
            onClick={() =>
              append({
                language_code: "en",
                name: "",
                description: "",
                tag_line: "",
              })
            }
            className="bg-[var(--color-brand-green)] hover:bg-[#1ed760] text-[var(--color-main)]"
          >
            Add Translation
          </Button>
        </div>
        <div className="space-y-4">
          {fields.map((field, index) => (
            <div
              key={field.id}
              className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-white/5 p-4 rounded-xl border border-white/10"
            >
              <div className="space-y-2">
                <label className="text-white/80 text-sm">Language code</label>
                <Input
                  placeholder="e.g., en, am, om"
                  {...register(`languages.${index}.language_code` as const, {
                    required: "Language code is required",
                  })}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
                />
              </div>
              <div className="space-y-2">
                <label className="text-white/80 text-sm">Name</label>
                <Input
                  placeholder="Service name"
                  {...register(`languages.${index}.name` as const, {
                    required: "Name is required",
                  })}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
                />
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="text-white/80 text-sm">Tag line</label>
                <Input
                  placeholder="Short tag line"
                  {...register(`languages.${index}.tag_line` as const)}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
                />
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="text-white/80 text-sm">Description</label>
                <textarea
                  placeholder="Description"
                  {...register(`languages.${index}.description` as const)}
                  className="min-h-24 bg-white/10 border-white/20 text-white placeholder:text-white/60 rounded-md p-2"
                />
              </div>
              <div className="md:col-span-2 flex justify-end">
                {fields.length > 1 && (
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => remove(index)}
                    className="bg-red-500/20 border-red-500/30 text-red-300 hover:bg-red-500/30"
                  >
                    Remove
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <Button
        type="submit"
        className="w-full bg-[var(--color-brand-green)] hover:bg-[#1ed760] text-[var(--color-main)] font-semibold"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Submitting..." : "Create"}
      </Button>
    </form>
  );
};

export default CreateOtherService;
