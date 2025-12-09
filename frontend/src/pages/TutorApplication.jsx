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
  const [fieldErrors, setFieldErrors] = useState({});

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    // Clear field error when user starts typing
    if (fieldErrors[name]) {
      setFieldErrors((prev) => {
        const updated = { ...prev };
        delete updated[name];
        return updated;
      });
    }
  };

  const validateField = (name, value) => {
    let errorMsg = "";

    switch (name) {
      case "first_name":
      case "last_name":
        if (!value || !value.trim()) {
          errorMsg = `${
            name === "first_name" ? "First" : "Last"
          } name is required`;
        } else if (value.trim().length < 2) {
          errorMsg = `${
            name === "first_name" ? "First" : "Last"
          } name must be at least 2 characters`;
        } else if (!/^[a-zA-Z\s'-]+$/.test(value)) {
          errorMsg = "Only letters, spaces, hyphens, and apostrophes allowed";
        }
        break;

      case "email":
        if (!value || !value.trim()) {
          errorMsg = "Email is required";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          errorMsg = "Please enter a valid email (e.g., name@example.com)";
        }
        break;

      case "phone_number":
        if (!value || !value.trim()) {
          errorMsg = "Phone number is required";
        } else if (!/^[+]?[\d\s()-]{10,}$/.test(value)) {
          errorMsg = "Please enter a valid phone number (min 10 digits)";
        }
        break;

      case "education_level":
        if (!value || !value.trim()) {
          errorMsg = "Please select your education level";
        }
        break;

      case "city":
        if (!value || !value.trim()) {
          errorMsg = "Please select a city";
        }
        break;

      case "day_per_week":
        if (value) {
          const days = parseInt(value);
          if (isNaN(days) || days < 0 || days > 7) {
            errorMsg = "Days must be between 0 and 7";
          }
        }
        break;

      case "hr_per_day":
        if (value) {
          const hours = parseInt(value);
          if (isNaN(hours) || hours < 0 || hours > 24) {
            errorMsg = "Hours must be between 0 and 24";
          }
        }
        break;

      default:
        break;
    }

    return errorMsg;
  };

  const onBlur = (e) => {
    const { name, value } = e.target;
    const errorMsg = validateField(name, value);
    if (errorMsg) {
      setFieldErrors((prev) => ({ ...prev, [name]: errorMsg }));
    }
  };

  const onFileChange = (e) => {
    const { name, files } = e.target;
    if (!files || files.length === 0) return;

    if (name === "document") {
      const file = files[0];
      const allowedTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ];

      // Validate file type
      if (!allowedTypes.includes(file.type)) {
        setFieldErrors((prev) => ({
          ...prev,
          document: "Please upload a PDF or Word document only",
        }));
        e.target.value = ""; // Reset input
        return;
      }

      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        setFieldErrors((prev) => ({
          ...prev,
          document: "Document must be less than 5MB",
        }));
        e.target.value = "";
        return;
      }

      // Clear error if valid
      setFieldErrors((prev) => {
        const updated = { ...prev };
        delete updated.document;
        return updated;
      });
      setDocumentFile(file);
    }

    if (name === "image") {
      const file = files[0];

      // Validate file type
      if (!file.type.startsWith("image/")) {
        setFieldErrors((prev) => ({
          ...prev,
          image: "Please upload an image file (JPEG, PNG, etc.)",
        }));
        e.target.value = "";
        return;
      }

      // Validate file size (2MB)
      if (file.size > 2 * 1024 * 1024) {
        setFieldErrors((prev) => ({
          ...prev,
          image: "Image must be less than 2MB",
        }));
        e.target.value = "";
        return;
      }

      // Clear error if valid
      setFieldErrors((prev) => {
        const updated = { ...prev };
        delete updated.image;
        return updated;
      });

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

    // Comprehensive client-side validation
    const validationErrors = [];

    // Name validation
    if (!form.first_name || !form.first_name.trim()) {
      validationErrors.push("First name is required");
    } else if (form.first_name.trim().length < 2) {
      validationErrors.push("First name must be at least 2 characters long");
    } else if (!/^[a-zA-Z\s'-]+$/.test(form.first_name)) {
      validationErrors.push(
        "First name can only contain letters, spaces, hyphens, and apostrophes"
      );
    }

    if (!form.last_name || !form.last_name.trim()) {
      validationErrors.push("Last name is required");
    } else if (form.last_name.trim().length < 2) {
      validationErrors.push("Last name must be at least 2 characters long");
    } else if (!/^[a-zA-Z\s'-]+$/.test(form.last_name)) {
      validationErrors.push(
        "Last name can only contain letters, spaces, hyphens, and apostrophes"
      );
    }

    // Education level validation
    if (!form.education_level || !form.education_level.trim()) {
      validationErrors.push("Please select your education level");
    }

    // Email validation
    if (!form.email || !form.email.trim()) {
      validationErrors.push("Email address is required");
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      validationErrors.push(
        "Please enter a valid email address (e.g., name@example.com)"
      );
    }

    // Phone validation
    if (!form.phone_number || !form.phone_number.trim()) {
      validationErrors.push("Phone number is required");
    } else if (!/^[+]?[\d\s()-]{10,}$/.test(form.phone_number)) {
      validationErrors.push(
        "Please enter a valid phone number (at least 10 digits)"
      );
    }

    // Availability validation
    if (form.day_per_week) {
      const days = parseInt(form.day_per_week);
      if (isNaN(days) || days < 0 || days > 7) {
        validationErrors.push("Days per week must be between 0 and 7");
      }
    }

    if (form.hr_per_day) {
      const hours = parseInt(form.hr_per_day);
      if (isNaN(hours) || hours < 0 || hours > 24) {
        validationErrors.push("Hours per day must be between 0 and 24");
      }
    }

    // Location validation
    if (!form.city || !form.city.trim()) {
      validationErrors.push("Please select a city");
    }

    // File validation
    if (!documentFile) {
      validationErrors.push("Document (CV/certificate) is required");
    } else {
      const allowedDocTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ];
      if (!allowedDocTypes.includes(documentFile.type)) {
        validationErrors.push("Document must be a PDF or Word document");
      }
      // Check file size (max 5MB)
      if (documentFile.size > 5 * 1024 * 1024) {
        validationErrors.push("Document file size must be less than 5MB");
      }
    }

    if (!imageFile) {
      validationErrors.push("Profile image is required");
    } else {
      if (!imageFile.type.startsWith("image/")) {
        validationErrors.push(
          "Profile picture must be an image file (JPEG, PNG, etc.)"
        );
      }
      // Check file size (max 2MB)
      if (imageFile.size > 2 * 1024 * 1024) {
        validationErrors.push("Image file size must be less than 2MB");
      }
    }

    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      // Scroll to top to show errors
      window.scrollTo({ top: 0, behavior: "smooth" });
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
      setErrors([]);
      setFieldErrors({});
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
              image. Fields marked with <span className="text-red-400">*</span>{" "}
              are required.
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
            {errors && errors.length > 0 && (
              <div className="p-3 mb-4 bg-red-700/20 text-red-300 rounded flex items-start justify-between">
                <div>
                  <strong className="block">Please fix the following:</strong>
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

            <form
              onSubmit={submit}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              <div>
                <label className="block text-sm mb-1">First name *</label>
                <input
                  name="first_name"
                  value={form.first_name}
                  onChange={onChange}
                  onBlur={onBlur}
                  required
                  className={`w-full rounded px-3 py-2 bg-transparent border ${
                    fieldErrors.first_name
                      ? "border-red-500"
                      : "border-white/10"
                  }`}
                />
                {fieldErrors.first_name && (
                  <p className="text-xs text-red-400 mt-1">
                    {fieldErrors.first_name}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm mb-1">Last name *</label>
                <input
                  name="last_name"
                  value={form.last_name}
                  onChange={onChange}
                  onBlur={onBlur}
                  required
                  className={`w-full rounded px-3 py-2 bg-transparent border ${
                    fieldErrors.last_name ? "border-red-500" : "border-white/10"
                  }`}
                />
                {fieldErrors.last_name && (
                  <p className="text-xs text-red-400 mt-1">
                    {fieldErrors.last_name}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm mb-1">Education level *</label>
                <select
                  name="education_level"
                  value={form.education_level}
                  onChange={onChange}
                  onBlur={onBlur}
                  className={`w-full rounded px-3 py-2 bg-white text-black border ${
                    fieldErrors.education_level
                      ? "border-red-500"
                      : "border-white/10"
                  }`}
                >
                  <option value="">Select education level</option>
                  <option value="High School">High School</option>
                  <option value="Diploma">Diploma</option>
                  <option value="Bachelor">Bachelor</option>
                  <option value="Master">Master</option>
                  <option value="PhD">PhD</option>
                  <option value="Other">Other</option>
                </select>
                {fieldErrors.education_level && (
                  <p className="text-xs text-red-400 mt-1">
                    {fieldErrors.education_level}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm mb-1">Email *</label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={onChange}
                  onBlur={onBlur}
                  placeholder="example@email.com"
                  className={`w-full rounded px-3 py-2 bg-transparent border ${
                    fieldErrors.email ? "border-red-500" : "border-white/10"
                  }`}
                />
                {fieldErrors.email && (
                  <p className="text-xs text-red-400 mt-1">
                    {fieldErrors.email}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm mb-1">Phone *</label>
                <input
                  name="phone_number"
                  value={form.phone_number}
                  onChange={onChange}
                  onBlur={onBlur}
                  placeholder="+251912345678"
                  className={`w-full rounded px-3 py-2 bg-transparent border ${
                    fieldErrors.phone_number
                      ? "border-red-500"
                      : "border-white/10"
                  }`}
                />
                {fieldErrors.phone_number && (
                  <p className="text-xs text-red-400 mt-1">
                    {fieldErrors.phone_number}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm mb-1">
                  Days / week (available)
                </label>
                <input
                  type="number"
                  name="day_per_week"
                  value={form.day_per_week}
                  onChange={onChange}
                  onBlur={onBlur}
                  min="0"
                  max="7"
                  placeholder="0-7"
                  className={`w-full rounded px-3 py-2 bg-transparent border ${
                    fieldErrors.day_per_week
                      ? "border-red-500"
                      : "border-white/10"
                  }`}
                />
                {fieldErrors.day_per_week && (
                  <p className="text-xs text-red-400 mt-1">
                    {fieldErrors.day_per_week}
                  </p>
                )}
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
                  onBlur={onBlur}
                  min="0"
                  max="24"
                  placeholder="0-24"
                  className={`w-full rounded px-3 py-2 bg-transparent border ${
                    fieldErrors.hr_per_day
                      ? "border-red-500"
                      : "border-white/10"
                  }`}
                />
                {fieldErrors.hr_per_day && (
                  <p className="text-xs text-red-400 mt-1">
                    {fieldErrors.hr_per_day}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm mb-1">City *</label>
                <select
                  name="city"
                  value={form.city}
                  onChange={onChange}
                  onBlur={onBlur}
                  required
                  className={`w-full rounded px-3 py-2 bg-white text-black border ${
                    fieldErrors.city ? "border-red-500" : "border-white/10"
                  }`}
                >
                  <option value="">Select city</option>
                  <option value="Adama">Adama</option>
                </select>
                {fieldErrors.city && (
                  <p className="text-xs text-red-400 mt-1">
                    {fieldErrors.city}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm mb-1">
                  Place / Neighbourhood
                </label>
                <select
                  name="place"
                  value={form.place}
                  onChange={onChange}
                  className="w-full rounded px-3 py-2 bg-transparent border border-white/10"
                >
                  <option value="Bole">Bole</option>
                  <option value="College">College</option>
                  <option value="Mebrat">Mebrat</option>
                  <option value="Kela">Kela</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm mb-1">
                  Document (CV / certificate) *
                </label>
                <div
                  className={`flex items-center gap-3 p-3 border rounded bg-white/5 ${
                    fieldErrors.document ? "border-red-500" : "border-white/10"
                  }`}
                >
                  <FaFilePdf className="text-brand-green text-2xl" />
                  <div className="flex-1">
                    <div className="text-sm text-white/80">
                      Upload your CV or certificate (PDF/DOC, max 5MB)
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
                {fieldErrors.document && (
                  <p className="text-xs text-red-400 mt-1">
                    {fieldErrors.document}
                  </p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm mb-1">Profile image *</label>
                <div
                  className={`flex items-center gap-3 p-3 border rounded bg-white/5 ${
                    fieldErrors.image ? "border-red-500" : "border-white/10"
                  }`}
                >
                  <FaImage className="text-brand-green text-2xl" />
                  <div className="flex-1">
                    <div className="text-sm text-white/80">
                      Upload a profile image (JPEG/PNG, max 2MB)
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
                {fieldErrors.image && (
                  <p className="text-xs text-red-400 mt-1">
                    {fieldErrors.image}
                  </p>
                )}
              </div>

              <div className="md:col-span-2 flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  onClick={submit}
                  className={`px-6 py-2 rounded font-semibold transition-all ${
                    loading
                      ? "bg-gray-500 text-gray-300 cursor-not-allowed"
                      : "bg-brand-green text-main hover:bg-green-600 cursor-pointer"
                  }`}
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
