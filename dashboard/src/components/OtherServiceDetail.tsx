import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";

interface Translation {
  id?: number;
  language_code: string;
  name: string;
  description: string;
  tag_line: string;
}

interface OtherService {
  id: number;
  website_url: string;
  image: string;
  languages?: Translation[];
}

const OtherServiceDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [service, setService] = useState<OtherService | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<Translation>({
    language_code: "",
    name: "",
    description: "",
    tag_line: "",
  });
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    setLoading(true);
    axios
      .get(`/api/other-services/${id}`)
      .then((res) => {
        setService(res.data);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load service");
        setLoading(false);
      });
  }, [id]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAddTranslation = (e: React.FormEvent) => {
    e.preventDefault();
    setAdding(true);
    const token = localStorage.getItem("auth");
    axios
      .post(`/api/other-services/${id}/translations`, form, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        setService((prev) =>
          prev
            ? { ...prev, languages: [...(prev.languages || []), res.data] }
            : prev
        );
        setForm({ language_code: "", name: "", description: "", tag_line: "" });
        setAdding(false);
      })
      .catch(() => {
        setError("Failed to add translation");
        setAdding(false);
      });
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  if (!service) return <div>Service not found</div>;

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">Other Service Detail</h2>
      <div className="mb-6">
        <img
          src={`/api/${service.image}`}
          alt="Service"
          className="w-50 object-cover mb-2"
        />
        <div>
          <strong>Website:</strong>{" "}
          <a
            href={service.website_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline"
          >
            {service.website_url}
          </a>
        </div>
      </div>
      <h3 className="text-xl font-semibold mb-2">Translations</h3>
      <ul className="mb-6">
        {service.languages?.length === 0 ? (
          <li className="text-gray-500">No translations yet.</li>
        ) : (
          service.languages?.map((t) => (
            <li key={t.id} className="mb-2 border-b pb-2">
              <div>
                <strong>Language:</strong> {t.language_code}
              </div>
              <div>
                <strong>Name:</strong> {t.name}
              </div>
              <div>
                <strong>Description:</strong> {t.description}
              </div>
              <div>
                <strong>Tag Line:</strong> {t.tag_line}
              </div>
            </li>
          ))
        )}
      </ul>
      <h3 className="text-xl font-semibold mb-2">Add Translation</h3>
      <form onSubmit={handleAddTranslation} className="space-y-3">
        <Input
          name="language_code"
          placeholder="Language Code (e.g. en, am)"
          value={form.language_code}
          onChange={handleChange}
          required
        />
        <Input
          name="name"
          placeholder="Name"
          value={form.name}
          onChange={handleChange}
          required
        />
        <Textarea
          name="description"
          placeholder="Description"
          value={form.description}
          onChange={handleChange}
          required
        />
        <Input
          name="tag_line"
          placeholder="Tag Line"
          value={form.tag_line}
          onChange={handleChange}
        />
        <Button type="submit" disabled={adding}>
          {adding ? "Adding..." : "Add Translation"}
        </Button>
      </form>
    </div>
  );
};

export default OtherServiceDetail;
