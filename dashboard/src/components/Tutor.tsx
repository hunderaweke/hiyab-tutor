import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { Alert, AlertTitle, AlertDescription } from "./ui/alert";

interface TutorData {
  id: number;
  first_name: string;
  last_name: string;
  document: string;
  image: string;
  education_level: string;
  phone_number: string;
  day_per_week: number;
  hr_per_day: number;
  verified: boolean;
  address: string;
  email: string;
}

const Tutor: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [tutor, setTutor] = useState<TutorData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    if (id) {
      setLoading(true);
      axios
        .get(`/api/tutors/${id}`)
        .then((res) => {
          setTutor(res.data);
          setError(null);
        })
        .catch(() => setError("Failed to fetch tutor details."))
        .finally(() => setLoading(false));
    }
  }, [id]);

  if (loading) {
    return <div>Loading tutor details...</div>;
  }
  if (error) {
    return (
      <div className="max-w-xl mx-auto p-8">
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }
  if (!tutor) {
    return <div>No tutor found.</div>;
  }

  const handleVerify = async () => {
    const token = localStorage.getItem("auth");
    if (!tutor) return;
    setVerifying(true);
    try {
      await axios.put(`/api/tutors/${tutor.id}/verify`, null, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setTutor({ ...tutor, verified: true });
      setError(null);
    } catch {
      setError("Failed to verify tutor.");
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-8 space-y-6 border rounded-lg bg-white shadow-md">
      <h2 className="text-3xl font-bold mb-6 text-center">Tutor Details</h2>

      <div className="flex justify-center">
        {tutor.image ? (
          <img
            src={`/api/${tutor.image}`}
            alt="Tutor"
            className="w-32 h-32 object-cover rounded-full border shadow"
          />
        ) : (
          <div className="w-32 h-32 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
            No image
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-6">
        <Detail label="ID" value={tutor.id} />
        <Detail label="First Name" value={tutor.first_name} />
        <Detail label="Last Name" value={tutor.last_name} />
        <Detail label="Education Level" value={tutor.education_level} />
        <Detail label="Phone Number" value={tutor.phone_number} />
        <Detail label="Email" value={tutor.email} />
        <Detail
          label="Address"
          value={tutor.address || <span className="text-gray-400">N/A</span>}
        />
        <Detail label="Days per Week" value={tutor.day_per_week} />
        <Detail label="Hours per Day" value={tutor.hr_per_day} />
        <div>
          <Label className="font-semibold">Document</Label>
          <div className="mt-2">
            {tutor.document ? (
              <a
                href={`/api/${tutor.document}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline"
              >
                View Document
              </a>
            ) : (
              <span className="text-gray-400">No document</span>
            )}
          </div>
        </div>

        <div>
          <Label className="font-semibold">Verified</Label>
          <div className="mt-2">
            <StatusBadge verified={tutor.verified} />
            {!tutor.verified && (
              <div className="mt-3">
                <Button onClick={handleVerify} disabled={verifying}>
                  {verifying ? "Verifying..." : "Verify Tutor"}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const Detail: React.FC<{ label: string; value: React.ReactNode }> = ({
  label,
  value,
}) => (
  <div>
    <Label className="font-semibold">{label}</Label>
    <div className="text-lg text-gray-700">{value}</div>
  </div>
);

const StatusBadge: React.FC<{ verified?: boolean }> = ({ verified }) =>
  verified ? (
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
      Verified
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
      Unverified
    </span>
  );

export default Tutor;
