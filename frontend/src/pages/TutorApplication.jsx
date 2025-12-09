import React, { useState, useEffect } from "react";
import Footer from "../components/Footer";
import { FaFilePdf, FaImage } from "react-icons/fa";
import { FiUpload, FiX } from "react-icons/fi";
import axios from "axios";

const TutorApplication = () => {
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    education_level: "",
    email: "",
    phone_number: "",
    day_per_week: "",
    hr_per_day: "",
    city: "Adama",
    place: "",
  });
  const [documentFile, setDocumentFile] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState([]);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const onFileChange = (e) => {
    const { name, files } = e.target;
    if (!files || files.length === 0) return;
    if (name === "document") setDocumentFile(files[0]);
    if (name === "image") {
      const file = files[0];
      setImageFile(file);
      // create preview URL and revoke previous one
      if (imagePreview) URL.revokeObjectURL(imagePreview);
      const url = URL.createObjectURL(file);
      setImagePreview(url);
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    setErrors([]);
    setError(null);
    setSuccess(false);

    // client-side validation
    const validationErrors = [];
    if (!form.first_name || !form.first_name.trim())
      validationErrors.push("First name is required");
    if (!form.last_name || !form.last_name.trim())
      validationErrors.push("Last name is required");
    if (!form.city) validationErrors.push("City is required");
    if (!documentFile)
      validationErrors.push("Document (CV/certificate) is required");
    if (!imageFile) validationErrors.push("Profile image is required");
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("first_name", form.first_name);
      fd.append("last_name", form.last_name);
      fd.append("education_level", form.education_level);
      fd.append("email", form.email);
      fd.append("phone_number", form.phone_number);
      fd.append("day_per_week", form.day_per_week || "0");
      fd.append("hr_per_day", form.hr_per_day || "0");
      const addressValue = `${form.city}${form.place ? ", " + form.place : ""}`;
      fd.append("address", addressValue);
      fd.append("document", documentFile);
      fd.append("image", imageFile);

      const resp = await axios.post("/api/v1/tutors/", fd, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (resp.status !== 201) {
        const body = resp.data;
        const msg =
          (body && (body.message || body.Message)) ||
          "Failed to submit application";
        // If server returned validation errors array, show it
        if (body && Array.isArray(body.errors)) setErrors(body.errors);
        else setError(msg);
        setLoading(false);
        return;
      }

      // success
      setSuccess(true);
      setForm({
        first_name: "",
        last_name: "",
        education_level: "",
        email: "",
        phone_number: "",
        day_per_week: "",
        hr_per_day: "",
        city: "Adama",
        place: "",
      });
      setDocumentFile(null);
      setImageFile(null);
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
        setImagePreview(null);
      }
      // reset file inputs
      const fileInputs = document.querySelectorAll("input[type=file]");
      fileInputs.forEach((i) => (i.value = ""));
    } catch (err) {
      setError(err.message || String(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  return (
    <>
      <main className="min-h-screen bg-[radial-gradient(120%_120%_at_80%_0%,_rgba(29,185,84,0.05),_transparent_60%)] py-12">
        <div className="container mx-auto px-4 lg:px-6">
          <div className="max-w-3xl mx-auto bg-white/5 backdrop-blur rounded-lg p-8 shadow">
            <h1 className="text-3xl font-bold mb-2">Apply as a Tutor</h1>
            <p className="text-sm text-white/80 mb-6">
              Share your details and upload required documents and a profile
              image.
            </p>

            {success && (
              <div className="p-3 mb-4 bg-green-700/20 text-green-300 rounded">
                Application submitted — we'll be in touch.
              </div>
            )}
            {error && (
              <div className="p-3 mb-4 bg-red-700/20 text-red-300 rounded">
                {error}
              </div>
            )}

            <form
              onSubmit={submit}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              <div>
                <label className="block text-sm mb-1">First name</label>
                <input
                  name="first_name"
                  value={form.first_name}
                  onChange={onChange}
                  required
                  className="w-full rounded px-3 py-2 bg-transparent border border-white/10"
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Last name</label>
                <input
                  name="last_name"
                  value={form.last_name}
                  onChange={onChange}
                  required
                  className="w-full rounded px-3 py-2 bg-transparent border border-white/10"
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Education level</label>
                <select
                  name="education_level"
                  value={form.education_level}
                  onChange={onChange}
                  className="w-full rounded px-3 py-2 bg-white text-black border border-white/10"
                >
                  <option value="">Select education level</option>
                  <option value="High School">High School</option>
                  <option value="Diploma">Diploma</option>
                  <option value="Bachelor">Bachelor</option>
                  <option value="Master">Master</option>
                  <option value="PhD">PhD</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={onChange}
                  className="w-full rounded px-3 py-2 bg-transparent border border-white/10"
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Phone</label>
                <input
                  name="phone_number"
                  value={form.phone_number}
                  onChange={onChange}
                  className="w-full rounded px-3 py-2 bg-transparent border border-white/10"
                />
              </div>
              <div>
                {errors && errors.length > 0 && (
                  <div className="p-3 mb-4 bg-red-700/20 text-red-300 rounded flex items-start justify-between">
                    <div>
                      <strong className="block">
                        Please fix the following:
                      </strong>
                      <ul className="mt-2 list-disc ml-5">
                        {errors.map((err, idx) => (
                          <li key={idx} className="text-sm">
                            {err}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <button
                      type="button"
                      onClick={() => setErrors([])}
                      className="ml-4 text-red-200 hover:text-white"
                    >
                      <FiX />
                    </button>
                  </div>
                )}
                <label className="block text-sm mb-1">
                  Days / week (available)
                </label>
                <input
                  type="number"
                  name="day_per_week"
                  value={form.day_per_week}
                  onChange={onChange}
                  className="w-full rounded px-3 py-2 bg-transparent border border-white/10"
                />
              </div>
              <div>
                <label className="block text-sm mb-1">
                  Hours / day (available)
                </label>
                <input
                  type="number"
                  name="hr_per_day"
                  value={form.hr_per_day}
                  onChange={onChange}
                  className="w-full rounded px-3 py-2 bg-transparent border border-white/10"
                />
              </div>

              <div>
                <label className="block text-sm mb-1">City</label>
                <select
                  name="city"
                  value={form.city}
                  onChange={onChange}
                  required
                  className="w-full rounded px-3 py-2 bg-white text-black border border-white/10"
                >
                  <option value="">Select city</option>
                  <option value="Adama">Adama</option>
                  <option value="Addis Ababa">Addis Ababa</option>
                  <option value="Bahir Dar">Bahir Dar</option>
                  <option value="Gondar">Gondar</option>
                  <option value="Mekelle">Mekelle</option>
                  <option value="Hawassa">Hawassa</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm mb-1">
                  Place / Neighbourhood
                </label>
                <input
                  name="place"
                  value={form.place}
                  onChange={onChange}
                  className="w-full rounded px-3 py-2 bg-transparent border border-white/10"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm mb-1">
                  Document (CV / certificate)
                </label>
                <div className="flex items-center gap-3 p-3 border border-white/10 rounded bg-white/5">
                  <FaFilePdf className="text-brand-green text-2xl" />
                  <div className="flex-1">
                    <div className="text-sm text-white/80">
                      Upload your CV or certificate (PDF/DOC)
                    </div>
                    <div className="text-xs text-white/60 mt-1">
                      {documentFile ? documentFile.name : "No file chosen"}
                    </div>
                  </div>
                  <label className="flex items-center gap-2 bg-brand-green text-main px-3 py-1 rounded cursor-pointer">
                    <FiUpload />
                    <input
                      type="file"
                      name="document"
                      accept="application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                      onChange={onFileChange}
                      required
                      className="hidden"
                    />
                    <span className="text-sm">Choose</span>
                  </label>
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm mb-1">Profile image</label>
                <div className="flex items-center gap-3 p-3 border border-white/10 rounded bg-white/5">
                  <FaImage className="text-brand-green text-2xl" />
                  <div className="flex-1">
                    <div className="text-sm text-white/80">
                      Upload a profile image (JPEG/PNG)
                    </div>
                    <div className="text-xs text-white/60 mt-1">
                      {imageFile ? imageFile.name : "No image chosen"}
                    </div>
                  </div>
                  {imagePreview && (
                    <img
                      src={imagePreview}
                      alt="preview"
                      className="w-16 h-16 object-cover rounded"
                    />
                  )}
                  <label className="flex items-center gap-2 bg-brand-green text-main px-3 py-1 rounded cursor-pointer">
                    <FiUpload />
                    <input
                      type="file"
                      name="image"
                      accept="image/*"
                      onChange={onFileChange}
                      required
                      className="hidden"
                    />
                    <span className="text-sm">Choose</span>
                  </label>
                </div>
              </div>

              <div className="md:col-span-2 flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-brand-green text-main px-6 py-2 rounded font-semibold"
                >
                  {loading ? "Sending..." : "Apply"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default TutorApplication;
