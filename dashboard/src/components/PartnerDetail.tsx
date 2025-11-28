import axios from "axios";
import { Card } from "./ui/card";
import { useEffect, useState, type ChangeEvent } from "react";
import { useParams } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface PartnerType {
  id: number;
  name: string;
  website_url: string;
  image_url?: string;
}

const PartnerDetail = () => {
  const [partner, setPartner] = useState<PartnerType | null>(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({
    name: "",
    website_url: "",
    image: null as File | null,
  });
  const [logoPreview, setLogoPreview] = useState<string | undefined>(undefined);
  const params = useParams();

  useEffect(() => {
    const loadPartner = async () => {
      const id = params.id;
      const response = await axios.get(`/api/v1/partners/${id}`);
      setPartner(response.data);
      setForm({
        name: response.data.name,
        website_url: response.data.website_url,
        image: null,
      });
      setLogoPreview(
        response.data.image_url ? `/api/v1/${response.data.image_url}` : undefined
      );
      setLoading(false);
    };
    loadPartner();
  }, [params.id]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>, field: string) => {
    if (field === "image") {
      const file = e.target.files?.[0] || null;
      setForm({ ...form, image: file });
      if (file) {
        const url = URL.createObjectURL(file);
        setLogoPreview(url);
      }
    } else {
      setForm({ ...form, [field]: e.target.value });
    }
  };

  const handleEditToggle = () => setEditMode((prev) => !prev);

  const handleSave = async () => {
    if (!partner) return;
    const formData = new FormData();
    formData.append("name", form.name);
    formData.append("website_url", form.website_url);
    if (form.image) formData.append("image", form.image);
    console.log(formData);
    const token = localStorage.getItem("auth");
    await axios.put(`/api/v1/partners/${partner.id}`, formData, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setEditMode(false);
    const response = await axios.get(`/api/v1/partners/${partner.id}`);
    setPartner(response.data);

    setLogoPreview(
      response.data.image_url ? `/api/v1/${response.data.image_url}` : undefined
    );
  };

  if (loading) return <p className="text-white">Loading...</p>;

  return (
    <Card className="max-w-full mx-auto p-6 mt-5">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-white">Partner Detail</h1>
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
          <label className="block font-medium mb-1">Website URL</label>
          <Input
            value={form.website_url}
            onChange={(e) => handleChange(e, "website_url")}
            required
            disabled={!editMode}
          />
        </div>
        <div className="flex flex-col md:flex-row gap-10 h-full">
          <div>
            <label className="block font-medium mb-1">Logo</label>
            <div className="max-w-sm md:max-w-lg h-full flex justify-between gap-4 flex-col">
              {logoPreview && (
                <img
                  src={logoPreview}
                  alt="Thumbnail"
                  className="max-w-lg max-h-[32rem] border border-white/10 rounded"
                />
              )}
              {editMode && (
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleChange(e, "image")}
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
    </Card>
  );
};

export default PartnerDetail;
