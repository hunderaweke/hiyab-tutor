import React, { useState } from "react";
import Footer from "../components/Footer";

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

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const addressValue = `${form.city}${form.place ? ", " + form.place : ""}`;
      const payload = {
        first_name: form.first_name,
        last_name: form.last_name,
        gender: form.gender,
        age: Number(form.age) || 0,
        grade: Number(form.grade) || 0,
        address: addressValue,
        phone_number: form.phone_number,
        day_per_week: Number(form.day_per_week) || 0,
        hr_per_day: Number(form.hr_per_day) || 0,
      };
      const resp = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!resp.ok) {
        const body = await resp.json().catch(() => null);
        throw new Error((body && body.message) || "Failed to create booking");
      }
      setSuccess(true);
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
              tutor.
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
                <label className="block text-sm mb-1">Gender</label>
                <select
                  name="gender"
                  value={form.gender}
                  onChange={onChange}
                  required
                  className="w-full rounded px-3 py-2 bg-white text-black border border-white/10"
                >
                  <option value="">Select</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm mb-1">Age</label>
                <input
                  type="number"
                  name="age"
                  value={form.age}
                  onChange={onChange}
                  className="w-full rounded px-3 py-2 bg-transparent border border-white/10"
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Grade</label>
                <input
                  type="number"
                  name="grade"
                  value={form.grade}
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
              <div>
                <label className="block text-sm mb-1">Phone</label>
                <input
                  name="phone_number"
                  value={form.phone_number}
                  onChange={onChange}
                  required
                  className="w-full rounded px-3 py-2 bg-transparent border border-white/10"
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Days / week</label>
                <input
                  type="number"
                  name="day_per_week"
                  value={form.day_per_week}
                  onChange={onChange}
                  className="w-full rounded px-3 py-2 bg-transparent border border-white/10"
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Hours / day</label>
                <input
                  type="number"
                  name="hr_per_day"
                  value={form.hr_per_day}
                  onChange={onChange}
                  className="w-full rounded px-3 py-2 bg-transparent border border-white/10"
                />
              </div>

              <div className="md:col-span-2 flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-brand-green text-main px-6 py-2 rounded font-semibold"
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
