import axios from "axios";
import { useEffect, useState, type ChangeEvent } from "react";
import { useParams } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface TestimonialTranslationType {
  id: number;
  language_code: string;
  text: string;
}

interface TestimonialType {
  id: number;
  name: string;
  role: string;
  created_at: string;
  video_url?: string;
  thumbnail?: string;
  translations: TestimonialTranslationType[];
}

const Testimonial = () => {
  const [testimonial, setTestimonial] = useState<TestimonialType | null>(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({
    name: "",
    role: "",
    translations: [""],
    video: null as File | null,
    thumbnail: null as File | null,
  });
  const [newTranslation, setNewTranslation] = useState({
    language_code: "",
    text: "",
  });
  const [videoPreview, setVideoPreview] = useState<string | undefined>(
    undefined
  );
  const [thumbnailPreview, setThumbnailPreview] = useState<string | undefined>(
    undefined
  );
  const params = useParams();

  useEffect(() => {
    const loadTestimonial = async () => {
      const id = params.id;
      const response = await axios.get(`/api/v1/testimonials/${id}`);
      setTestimonial(response.data);
      setForm({
        name: response.data.name,
        role: response.data.role,
        translations: response.data.translations || [""],
        video: null,
        thumbnail: null,
      });
      setVideoPreview(
        response.data.video ? `/api/v1/${response.data.video}` : undefined
      );
      setThumbnailPreview(
        response.data.thumbnail ? `/api/v1/${response.data.thumbnail}` : undefined
      );
      setLoading(false);
    };
    loadTestimonial();
  }, [params.id]);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement>,
    field: string,
    idx?: number
  ) => {
    if (field === "translations" && typeof idx === "number") {
      const newTranslations = [...form.translations];
      newTranslations[idx] = e.target.value;
      setForm({ ...form, translations: newTranslations });
    } else if (field === "video" || field === "thumbnail") {
      const file = e.target.files?.[0] || null;
      setForm({ ...form, [field]: file });
      if (file) {
        const url = URL.createObjectURL(file);
        if (field === "video") setVideoPreview(url);
        if (field === "thumbnail") setThumbnailPreview(url);
      }
    } else {
      setForm({ ...form, [field]: e.target.value });
    }
  };

  const handleNewTranslationChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target as HTMLInputElement;
    setNewTranslation({ ...newTranslation, [name]: value } as any);
  };

  const handleEditToggle = () => setEditMode((prev) => !prev);

  const handleSave = async () => {
    if (!testimonial) return;
    const formData = new FormData();
    formData.append("name", form.name);
    formData.append("role", form.role);
    form.translations.forEach((t, i) =>
      formData.append(`translations[${i}]`, t)
    );
    if (form.video) formData.append("video", form.video);
    if (form.thumbnail) formData.append("thumbnail", form.thumbnail);
    const token = localStorage.getItem("auth");
    await axios.put(`/api/v1/testimonials/${testimonial.id}`, formData, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setEditMode(false);
    const response = await axios.get(`/api/v1/testimonials/${testimonial.id}`);
    setTestimonial(response.data);
    setVideoPreview(
      response.data.video_url ? `/api/v1/${response.data.video_url}` : undefined
    );
    setThumbnailPreview(
      response.data.thumbnail ? `/api/v1/${response.data.thumbnail}` : undefined
    );
  };

  const handleAddTranslation = async () => {
    if (!testimonial) return;
    if (!newTranslation.language_code || !newTranslation.text) {
      alert("Please provide language code and text for the translation.");
      return;
    }
    try {
      const token = localStorage.getItem("auth");
      await axios.post(
        `/api/v1/testimonials/${testimonial.id}/translations`,
        {
          language_code: newTranslation.language_code,
          text: newTranslation.text,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // refresh testimonial
      const response = await axios.get(`/api/v1/testimonials/${testimonial.id}`);
      setTestimonial(response.data);
      setNewTranslation({ language_code: "", text: "" });
    } catch (err) {
      console.error(err);
      alert("Failed to add translation");
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <main className="max-w-full mx-auto p-auto md:p-6 mt-5 bg-background rounded-lg shadow">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Testimonial Detail</h1>
        <Button variant="outline" onClick={handleEditToggle}>
          {editMode ? "Cancel" : "Edit"}
        </Button>
      </div>
      <Separator className="mb-4" />
      <form
        className="space-y-6 text-xl"
        onSubmit={(e) => {
          e.preventDefault();
          handleSave();
        }}
      >
        <div>
          <label className="block font-medium mb-1">Name</label>
          <Input
            value={form.name}
            onChange={(e) => handleChange(e, "name")}
            required
            disabled={!editMode}
          />
        </div>
        <div>
          <label className="block font-medium mb-1">Role</label>
          <Input
            value={form.role}
            onChange={(e) => handleChange(e, "role")}
            required
            disabled={!editMode}
          />
        </div>
        <div className="flex flex-col md:flex-row gap-10 h-full">
          <div>
            <label className="block font-medium mb-1">Video</label>
            <div className="h-full flex flex-col justify-between  items-center gap-4">
              <video
                src={videoPreview}
                controls
                className="max-w-sm md:max-w-lg h-full border rounded"
              />
              {editMode && (
                <Input
                  type="file"
                  accept="video/*"
                  onChange={(e) => handleChange(e, "video")}
                />
              )}
            </div>
          </div>
          <div>
            <label className="block font-medium mb-1">Thumbnail</label>
            <div className="max-w-sm md:max-w-lg h-full flex justify-between gap-4 flex-col">
              {thumbnailPreview && (
                <img
                  src={thumbnailPreview}
                  alt="Thumbnail"
                  className="max-w-lg max-h-[32rem] border rounded"
                />
              )}
              {editMode && (
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleChange(e, "thumbnail")}
                />
              )}
            </div>
          </div>
        </div>
        {editMode && (
          <Button type="submit" variant="default" className="w-full md:mt-5">
            Save Changes
          </Button>
        )}
      </form>
      {/* Translations section (separate from edit mode) */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-2">Translations</h2>
        <div className="space-y-3">
          {testimonial &&
          testimonial.translations &&
          testimonial.translations.length ? (
            testimonial.translations.map((tr) => (
              <div key={tr.id} className="p-3 border rounded">
                <div className="text-sm text-white/60">{tr.language_code}</div>
                <div className="text-base">{tr.text}</div>
              </div>
            ))
          ) : (
            <div className="text-sm text-white/60">No translations yet.</div>
          )}
        </div>

        <div className="mt-4 p-4 border rounded bg-panel">
          <h3 className="font-medium mb-2">Add Translation</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Input
              name="language_code"
              placeholder="Language code (e.g., en, am)"
              value={newTranslation.language_code}
              onChange={handleNewTranslationChange}
            />
            <Input
              name="text"
              placeholder="Translation text"
              value={newTranslation.text}
              onChange={handleNewTranslationChange}
            />
            <div className="flex items-center gap-2">
              <Button onClick={handleAddTranslation} className="w-full">
                Add Translation
              </Button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Testimonial;
