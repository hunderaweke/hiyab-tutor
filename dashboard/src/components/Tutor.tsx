import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { Alert, AlertTitle, AlertDescription } from "./ui/alert";
import { Card } from "./ui/card";

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
        .get(`/api/v1/tutors/${id}`)
        .then((res) => {
          setTutor(res.data);
          setError(null);
        })
        .catch(() => setError("Failed to fetch tutor details."))
        .finally(() => setLoading(false));
    }
  }, [id]);

  if (loading) {
    return <div className="text-white">Loading tutor details...</div>;
  }
  if (error) {
    return (
      <Card className="max-w-xl mx-auto">
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </Card>
    );
  }
  if (!tutor) {
    return (
      <Card className="max-w-xl mx-auto p-4 text-white">No tutor found.</Card>
    );
  }

  const handleVerify = async () => {
    const token = localStorage.getItem("auth");
    if (!tutor) return;
    setVerifying(true);
    try {
      await axios.put(`/api/v1/tutors/${tutor.id}/verify`, null, {
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
    <Card className="max-w-xl mx-auto space-y-6">
      <h2 className="text-3xl font-bold mb-6 text-center text-white">
        Tutor Details
      </h2>

      <div className="flex justify-center">
        {tutor.image ? (
          <img
            src={`/api/v1/${tutor.image}`}
            alt="Tutor"
            className="w-32 h-32 object-cover rounded-full border border-white/10"
          />
        ) : (
          <div className="w-32 h-32 rounded-full bg-white/5 flex items-center justify-center text-white/60 border border-white/10">
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
                href={`/api/v1/${tutor.document}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--color-brand-green)] underline"
              >
                View Document
              </a>
            ) : (
              <span className="text-white/70">No document</span>
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
    </Card>
  );
};

const Detail: React.FC<{ label: string; value: React.ReactNode }> = ({
  label,
  value,
}) => (
  <div>
    <Label className="font-semibold text-white">{label}</Label>
    <div className="text-lg text-white/90">{value}</div>
  </div>
);

const StatusBadge: React.FC<{ verified?: boolean }> = ({ verified }) =>
  verified ? (
    <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--color-brand-green)] text-[var(--color-main)] font-semibold text-base shadow">
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
    <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 text-white/80 font-semibold text-base shadow">
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
