import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "@/lib/api";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card } from "./ui/card";
import { Select } from "./ui/select";

interface BookingData {
  first_name: string;
  last_name: string;
  gender: "male" | "female";
  grade: number;
  age: number;
  phone_number: string;
  day_per_week: number;
  hr_per_day: number;
  address: string;
  assigned: boolean;
}

const Booking: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [booking, setBooking] = useState<BookingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<BookingData | null>(null);

  useEffect(() => {
    if (id) {
      setLoading(true);
      api
        .get(`/bookings/${id}`)
        .then((res) => {
          // api instance may wrap data; prefer res.data or res.data.data
          const data = res.data && (res.data.data ?? res.data);
          setBooking(data);
          setForm(data);
        })
        .catch(() => setError("Failed to fetch booking details."))
        .finally(() => setLoading(false));
    }
  }, [id]);

  const handleAssign = async () => {
    if (!id) return;
    setAssigning(true);
    try {
      await api.put(`/bookings/${id}/assign`);
      setBooking((prev) => (prev ? { ...prev, assigned: true } : prev));
      setError(null);
    } catch {
      setError("Failed to assign booking.");
    } finally {
      setAssigning(false);
    }
  };

  const startEdit = () => {
    setForm(booking);
    setEditing(true);
  };

  const cancelEdit = () => {
    setForm(booking);
    setEditing(false);
  };

  const handleSave = async () => {
    if (!id || !form) return;
    setSaving(true);
    try {
      const resp = await api.put(`/bookings/${id}`, form);
      const data = resp.data && (resp.data.data ?? resp.data);
      setBooking(data);
      setForm(data);
      setEditing(false);
      setError(null);
    } catch {
      setError("Failed to save booking.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div>Loading booking details...</div>;
  if (error) return <div className="text-red-600 font-semibold">{error}</div>;
  if (!booking) return <div>No booking found.</div>;

  return (
    <Card className="max-w-xl mx-auto p-8 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold mb-0">Booking Details</h2>
        {!editing ? (
          <div className="flex gap-2">
            <Button onClick={startEdit} className="bg-white/5 text-white">
              Edit
            </Button>
            <Button
              className="bg-[var(--color-brand-green)] text-[var(--color-main)]"
              onClick={handleAssign}
              disabled={booking.assigned || assigning}
            >
              {booking.assigned
                ? "Assigned"
                : assigning
                ? "Assigning..."
                : "Assign"}
            </Button>
          </div>
        ) : (
          <div className="flex gap-2">
            <Button variant="outline" onClick={cancelEdit} disabled={saving}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-[var(--color-brand-green)] text-[var(--color-main)]"
            >
              {saving ? "Saving..." : "Save"}
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-6">
        {editing && form ? (
          <>
            <div>
              <Label className="font-semibold">First Name</Label>
              <Input
                value={form.first_name}
                onChange={(e) =>
                  setForm({ ...form, first_name: e.target.value })
                }
              />
            </div>
            <div>
              <Label className="font-semibold">Last Name</Label>
              <Input
                value={form.last_name}
                onChange={(e) =>
                  setForm({ ...form, last_name: e.target.value })
                }
              />
            </div>
            <div>
              <Label className="font-semibold">Phone Number</Label>
              <Input
                value={form.phone_number}
                onChange={(e) =>
                  setForm({ ...form, phone_number: e.target.value })
                }
              />
            </div>
            <div>
              <Label className="font-semibold">Address</Label>
              <Input
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
              />
            </div>
            <div>
              <Label className="font-semibold">Gender</Label>
              <Select
                value={form.gender}
                onValueChange={(v) =>
                  setForm({ ...form, gender: v as BookingData["gender"] })
                }
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
              </Select>
            </div>
            <div>
              <Label className="font-semibold">Age</Label>
              <Input
                type="number"
                value={String(form.age)}
                onChange={(e) =>
                  setForm({ ...form, age: Number(e.target.value) })
                }
              />
            </div>
            <div>
              <Label className="font-semibold">Grade</Label>
              <Input
                type="number"
                value={String(form.grade)}
                onChange={(e) =>
                  setForm({ ...form, grade: Number(e.target.value) })
                }
              />
            </div>
            <div>
              <Label className="font-semibold">Days per Week</Label>
              <Input
                type="number"
                value={String(form.day_per_week)}
                onChange={(e) =>
                  setForm({ ...form, day_per_week: Number(e.target.value) })
                }
              />
            </div>
            <div>
              <Label className="font-semibold">Hours per Day</Label>
              <Input
                type="number"
                value={String(form.hr_per_day)}
                onChange={(e) =>
                  setForm({ ...form, hr_per_day: Number(e.target.value) })
                }
              />
            </div>
          </>
        ) : (
          <>
            <Detail label="First Name" value={booking.first_name} />
            <Detail label="Last Name" value={booking.last_name} />
            <Detail label="Phone Number" value={booking.phone_number} />
            <Detail label="Address" value={booking.address} />
            <Detail label="Gender" value={booking.gender} />
            <Detail label="Age" value={booking.age} />
            <Detail label="Grade" value={booking.grade} />
            <Detail label="Days per Week" value={booking.day_per_week} />
            <Detail label="Hours per Day" value={booking.hr_per_day} />
            <div>
              <Label className="font-semibold">Assigned</Label>
              <div className="mt-2">
                {booking.assigned ? (
                  <StatusBadge assigned />
                ) : (
                  <>
                    <StatusBadge assigned={false} />
                    <Button
                      className="mt-3 w-full"
                      variant="outline"
                      disabled={assigning}
                      onClick={handleAssign}
                    >
                      {assigning ? "Assigning..." : "Assign"}
                    </Button>
                  </>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </Card>
  );
};

// Detail field component
const Detail: React.FC<{ label: string; value: React.ReactNode }> = ({
  label,
  value,
}) => (
  <div>
    <Label className="font-semibold">{label}</Label>
    <div className="text-lg text-gray-200">{value}</div>
  </div>
);

// Status badge component
const StatusBadge: React.FC<{ assigned?: boolean }> = ({ assigned }) =>
  assigned ? (
    <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-100 text-green-700 font-semibold text-base shadow">
      <svg
        className="w-5 h-5 text-green-500"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
      </svg>
      Assigned
    </span>
  ) : (
    <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-100 text-red-700 font-semibold text-base shadow">
      <svg
        className="w-5 h-5 text-red-500"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M6 18L18 6M6 6l12 12"
        />
      </svg>
      Unassigned
    </span>
  );

export default Booking;
