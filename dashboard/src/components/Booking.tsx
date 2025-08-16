import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { Label } from "./ui/label";
import { Button } from "./ui/button";

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

  useEffect(() => {
    if (id) {
      setLoading(true);
      axios
        .get(`/api/bookings/${id}`)
        .then((res) => {
          setBooking(res.data);
          setError(null);
        })
        .catch(() => setError("Failed to fetch booking details."))
        .finally(() => setLoading(false));
    }
  }, [id]);

  const handleAssign = async () => {
    if (!id) return;
    setAssigning(true);
    try {
      await axios.put(`/api/bookings/${id}/assign`);
      setBooking((prev) => (prev ? { ...prev, assigned: true } : prev));
      setError(null);
    } catch {
      setError("Failed to assign booking.");
    } finally {
      setAssigning(false);
    }
  };

  if (loading) {
    return <div>Loading booking details...</div>;
  }
  if (error) {
    return <div className="text-red-600 font-semibold">{error}</div>;
  }
  if (!booking) {
    return <div>No booking found.</div>;
  }

  return (
    <div className="max-w-xl mx-auto p-8 space-y-6 border rounded-lg bg-white shadow-md">
      <h2 className="text-3xl font-bold mb-6 text-center">Booking Details</h2>
      <div className="grid grid-cols-2 gap-6">
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
      </div>
    </div>
  );
};

// Detail field component
const Detail: React.FC<{ label: string; value: React.ReactNode }> = ({
  label,
  value,
}) => (
  <div>
    <Label className="font-semibold">{label}</Label>
    <div className="text-lg text-gray-700">{value}</div>
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
