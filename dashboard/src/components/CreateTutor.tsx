import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Alert, AlertTitle, AlertDescription } from "./ui/alert";
import { Card } from "./ui/card";

const initialState = {
  first_name: "",
  last_name: "",
  education_level: "",
  phone_number: "",
  day_per_week: 1,
  hr_per_day: 1,
  email: "",
  city: "",
  place: "",
};

const cities = ["Addis Ababa", "Bole", "Nefas Silk", "Gulele", "Other"];

const educationLevels = [
  "Primary",
  "Secondary",
  "Diploma",
  "Bachelor",
  "Master",
  "PhD",
];

const CreateTutor: React.FC = () => {
  const [form, setForm] = useState(initialState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [documentPreview, setDocumentPreview] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    let newValue: string | number | boolean = value;
    if (type === "checkbox") {
      newValue = (e.target as HTMLInputElement).checked;
    }
    setForm((prev) => ({
      ...prev,
      [name]: newValue,
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setImageFile(file);
    if (file) {
      setImagePreview(URL.createObjectURL(file));
    } else {
      setImagePreview(null);
    }
  };

  const handleDocumentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setDocumentFile(file);
    if (file) {
      setDocumentPreview(file.name);
    } else {
      setDocumentPreview(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      // concatenate city and place into address
      const address = [form.city, form.place].filter(Boolean).join(", ");
      const toSend = { ...form, address };
      // don't include city/place separately
      Object.entries(toSend).forEach(([key, value]) => {
        formData.append(key, String(value));
      });
      if (imageFile) formData.append("image", imageFile);
      if (documentFile) formData.append("document", documentFile);
      await axios.post("/api/tutors/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      navigate("/tutors");
    } catch {
      setError("Failed to create tutor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-xl mx-auto space-y-6">
      <h2 className="text-3xl font-bold mb-6 text-center text-white">
        Create Tutor
      </h2>
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>First Name</Label>
            <Input
              name="first_name"
              value={form.first_name}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <Label>Last Name</Label>
            <Input
              name="last_name"
              value={form.last_name}
              onChange={handleChange}
              required
            />
          </div>
        </div>
        <div>
          <Label>Education Level</Label>
          <select
            name="education_level"
            value={form.education_level}
            onChange={handleChange}
            required
            className="w-full bg-white/10 border border-white/20 text-white placeholder:text-white/60 rounded px-2 py-1"
          >
            <option value="">Select education level</option>
            {educationLevels.map((lvl) => (
              <option key={lvl} value={lvl}>
                {lvl}
              </option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Phone Number</Label>
            <Input
              name="phone_number"
              value={form.phone_number}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <Label>Email</Label>
            <Input
              name="email"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Days per Week</Label>
            <Input
              type="number"
              name="day_per_week"
              value={form.day_per_week}
              min={1}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <Label>Hours per Day</Label>
            <Input
              type="number"
              name="hr_per_day"
              value={form.hr_per_day}
              min={1}
              onChange={handleChange}
              required
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>City</Label>
            <select
              name="city"
              value={form.city}
              onChange={handleChange}
              className="w-full bg-white/10 border border-white/20 text-white placeholder:text-white/60 rounded px-2 py-1"
            >
              <option value="">Select city</option>
              {cities.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label>Place / Specific area</Label>
            <Input
              name="place"
              value={form.place}
              onChange={handleChange}
              placeholder="e.g. Kazanchis, House #12"
            />
          </div>
        </div>
        <div>
          <Label>Image</Label>
          <Input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="bg-white/10 text-white"
          />
          {imagePreview && (
            <img
              src={imagePreview}
              alt="Preview"
              className="mt-2 w-32 h-32 object-cover rounded border border-white/10"
            />
          )}
        </div>
        <div>
          <Label>Document</Label>
          <Input
            type="file"
            accept="application/pdf,.doc,.docx"
            onChange={handleDocumentChange}
            className="bg-white/10 text-white"
          />
          {documentPreview && (
            <div className="mt-2 text-sm text-white/70">
              Selected: {documentPreview}
            </div>
          )}
        </div>
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "Creating..." : "Create Tutor"}
        </Button>
      </form>
    </Card>
  );
};

export default CreateTutor;
