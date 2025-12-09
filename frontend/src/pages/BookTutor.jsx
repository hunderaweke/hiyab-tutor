import { useState } from "react";
import Footer from "../components/Footer";
import { FiX } from "react-icons/fi";

const BookTutor = () => {
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    gender: "",
    age: "",
    grade: "",
    city: "Adama",
    place: "",
    phone_number: "",
    day_per_week: "",
    hr_per_day: "",
  });
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

      case "gender":
        if (!value || !value.trim()) {
          errorMsg = "Please select a gender";
        }
        break;

      case "age":
        if (!value || value.trim() === "") {
          errorMsg = "Age is required";
        } else {
          const ageNum = parseInt(value);
          if (isNaN(ageNum) || ageNum < 5 || ageNum > 100) {
            errorMsg = "Age must be between 5 and 100";
          }
        }
        break;

      case "grade":
        if (!value || value.trim() === "") {
          errorMsg = "Grade is required";
        } else {
          const gradeNum = parseInt(value);
          if (isNaN(gradeNum) || gradeNum < 1 || gradeNum > 12) {
            errorMsg = "Grade must be between 1 and 12";
          }
        }
        break;

      case "city":
        if (!value || !value.trim()) {
          errorMsg = "Please select a city";
        }
        break;

      case "place":
        if (!value || !value.trim()) {
          errorMsg = "Please select a place/neighbourhood";
        }
        break;

      case "phone_number":
        if (!value || !value.trim()) {
          errorMsg = "Phone number is required";
        } else if (!/^[+]?[\d\s()-]{10,}$/.test(value)) {
          errorMsg = "Please enter a valid phone number (min 10 digits)";
        }
        break;

      case "day_per_week":
        if (!value || value.trim() === "") {
          errorMsg = "Days per week is required";
        } else {
          const days = parseInt(value);
          if (isNaN(days) || days < 1 || days > 7) {
            errorMsg = "Days must be between 1 and 7";
          }
        }
        break;

      case "hr_per_day":
        if (!value || value.trim() === "") {
          errorMsg = "Hours per day is required";
        } else {
          const hours = parseInt(value);
          if (isNaN(hours) || hours < 1 || hours > 12) {
            errorMsg = "Hours must be between 1 and 12";
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

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    setErrors([]);
    setSuccess(false);

    // Comprehensive validation
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

    // Gender validation
    if (!form.gender || !form.gender.trim()) {
      validationErrors.push("Gender is required");
    }

    // Age validation
    if (!form.age || form.age.trim() === "") {
      validationErrors.push("Age is required");
    } else {
      const ageNum = parseInt(form.age);
      if (isNaN(ageNum) || ageNum < 5 || ageNum > 100) {
        validationErrors.push("Age must be between 5 and 100 years");
      }
    }

    // Grade validation
    if (!form.grade || form.grade.trim() === "") {
      validationErrors.push("Grade is required");
    } else {
      const gradeNum = parseInt(form.grade);
      if (isNaN(gradeNum) || gradeNum < 1 || gradeNum > 12) {
        validationErrors.push("Grade must be between 1 and 12");
      }
    }

    // City validation
    if (!form.city || !form.city.trim()) {
      validationErrors.push("City is required");
    }

    // Place validation
    if (!form.place || !form.place.trim()) {
      validationErrors.push("Place/Neighbourhood is required");
    }

    // Phone validation
    if (!form.phone_number || !form.phone_number.trim()) {
      validationErrors.push("Phone number is required");
    } else if (!/^[+]?[\d\s()-]{10,}$/.test(form.phone_number)) {
      validationErrors.push(
        "Please enter a valid phone number (at least 10 digits)"
      );
    }

    // Days per week validation
    if (!form.day_per_week || form.day_per_week.trim() === "") {
      validationErrors.push("Days per week is required");
    } else {
      const days = parseInt(form.day_per_week);
      if (isNaN(days) || days < 1 || days > 7) {
        validationErrors.push("Days per week must be between 1 and 7");
      }
    }

    // Hours per day validation
    if (!form.hr_per_day || form.hr_per_day.trim() === "") {
      validationErrors.push("Hours per day is required");
    } else {
      const hours = parseInt(form.hr_per_day);
      if (isNaN(hours) || hours < 1 || hours > 12) {
        validationErrors.push(
          "Hours per day must be between 1 and 12 (reasonable tutoring hours)"
        );
      }
    }

    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setLoading(true);
    try {
      const addressValue = `${form.city}${form.place ? ", " + form.place : ""}`;
      const payload = {
        first_name: form.first_name,
        last_name: form.last_name,
        gender: form.gender,
        age: Number(form.age),
        grade: Number(form.grade),
        address: addressValue,
        phone_number: form.phone_number,
        day_per_week: Number(form.day_per_week),
        hr_per_day: Number(form.hr_per_day),
      };
      const resp = await fetch("/api/v1/bookings/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!resp.ok) {
        const body = await resp.json().catch(() => null);
        throw new Error((body && body.message) || "Failed to create booking");
      }
      setSuccess(true);
      setErrors([]);
      setFieldErrors({});
      setForm({
        first_name: "",
        last_name: "",
        gender: "",
        age: "",
        grade: "",
        city: "Adama",
        place: "",
        phone_number: "",
        day_per_week: "",
        hr_per_day: "",
      });
    } catch (err) {
      setError(err.message || String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <main className="min-h-screen bg-[radial-gradient(120%_120%_at_80%_0%,_rgba(29,185,84,0.05),_transparent_60%)] py-12">
        <div className="container mx-auto px-4 lg:px-6">
          <div className="max-w-3xl mx-auto bg-white/5 backdrop-blur rounded-lg p-8 shadow">
            <h1 className="text-3xl font-bold mb-2">Book a Tutor</h1>
            <p className="text-sm text-white/80 mb-6">
              Fill in the details below and we'll match you with a suitable
              tutor. All fields marked with{" "}
              <span className="text-red-400">*</span> are required.
            </p>
            {success && (
              <div className="p-3 mb-4 bg-green-700/20 text-green-300 rounded">
                Booking created — we will contact you soon.
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
                <label className="block text-sm mb-1">Gender *</label>
                <select
                  name="gender"
                  value={form.gender}
                  onChange={onChange}
                  onBlur={onBlur}
                  required
                  className={`w-full rounded px-3 py-2 bg-white text-black border ${
                    fieldErrors.gender ? "border-red-500" : "border-white/10"
                  }`}
                >
                  <option value="">Select gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
                {fieldErrors.gender && (
                  <p className="text-xs text-red-400 mt-1">
                    {fieldErrors.gender}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm mb-1">Age (years) *</label>
                <input
                  type="number"
                  name="age"
                  value={form.age}
                  onChange={onChange}
                  onBlur={onBlur}
                  min="5"
                  max="100"
                  placeholder="5-100"
                  required
                  className={`w-full rounded px-3 py-2 bg-transparent border ${
                    fieldErrors.age ? "border-red-500" : "border-white/10"
                  }`}
                />
                {fieldErrors.age && (
                  <p className="text-xs text-red-400 mt-1">{fieldErrors.age}</p>
                )}
              </div>
              <div>
                <label className="block text-sm mb-1">Grade (1-12) *</label>
                <input
                  type="number"
                  name="grade"
                  value={form.grade}
                  onChange={onChange}
                  onBlur={onBlur}
                  min="1"
                  max="12"
                  placeholder="1-12"
                  required
                  className={`w-full rounded px-3 py-2 bg-transparent border ${
                    fieldErrors.grade ? "border-red-500" : "border-white/10"
                  }`}
                />
                {fieldErrors.grade && (
                  <p className="text-xs text-red-400 mt-1">
                    {fieldErrors.grade}
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
                  Place / Neighbourhood *
                </label>
                <select
                  name="place"
                  value={form.place}
                  onChange={onChange}
                  onBlur={onBlur}
                  required
                  className={`w-full rounded px-3 py-2 bg-white text-black border ${
                    fieldErrors.place ? "border-red-500" : "border-white/10"
                  }`}
                >
                  <option value="">Select Kebele</option>
                  <option value="Bole">Bole</option>
                  <option value="College">College</option>
                  <option value="Kela">Kela</option>
                </select>
                {fieldErrors.place && (
                  <p className="text-xs text-red-400 mt-1">
                    {fieldErrors.place}
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
                  required
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
                  Days per week (1-7) *
                </label>
                <input
                  type="number"
                  name="day_per_week"
                  value={form.day_per_week}
                  onChange={onChange}
                  onBlur={onBlur}
                  min="1"
                  max="7"
                  placeholder="1-7"
                  required
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
                  Hours per day (1-12) *
                </label>
                <input
                  type="number"
                  name="hr_per_day"
                  value={form.hr_per_day}
                  onChange={onChange}
                  onBlur={onBlur}
                  min="1"
                  max="12"
                  placeholder="1-12"
                  required
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

              <div className="md:col-span-2 flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className={`px-6 py-2 rounded font-semibold transition-all ${
                    loading
                      ? "bg-gray-500 text-gray-300 cursor-not-allowed"
                      : "bg-brand-green text-main hover:bg-green-600 cursor-pointer"
                  }`}
                >
                  {loading ? "Sending..." : "Request Tutor"}
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

export default BookTutor;
