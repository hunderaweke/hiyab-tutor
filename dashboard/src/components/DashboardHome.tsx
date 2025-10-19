import React, { useEffect, useState } from "react";
import api from "@/lib/api";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "./ui/table";
import { useNavigate } from "react-router-dom";

interface Booking {
  id: number;
  first_name: string;
  last_name: string;
  grade: number;
  address: string;
  created_at?: string;
}

interface Tutor {
  id: number;
  first_name: string;
  last_name: string;
  day_per_week?: number;
  hr_per_day?: number;
}

const DashboardHome: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [bookingsTotal, setBookingsTotal] = useState(0);
  const [tutorsTotal, setTutorsTotal] = useState(0);
  const [partnersTotal, setPartnersTotal] = useState(0);
  const [servicesTotal, setServicesTotal] = useState(0);
  const [testimonialsTotal, setTestimonialsTotal] = useState(0);
  const navigate = useNavigate();

  const fetchSummary = async () => {
    try {
      const b = await api.get(`/bookings/`, {
        params: { page: 1, limit: 5 },
      });
      if (b.data) {
        setBookings(Array.isArray(b.data.data) ? b.data.data : []);
        if (b.data.pagination && typeof b.data.pagination.total === "number")
          setBookingsTotal(b.data.pagination.total);
      }
      const t = await api.get(`/tutors/`, {
        params: { page: 1, limit: 5 },
      });
      if (t.data) {
        setTutors(Array.isArray(t.data.data) ? t.data.data : []);
        if (t.data.pagination && typeof t.data.pagination.total === "number")
          setTutorsTotal(t.data.pagination.total);
      }
      // analytics route is mounted at /api/v1/analytics on the backend
      const a = await api.get(`/analytics`);
      const totals = a?.data?.totals;
      if (totals) {
        setPartnersTotal(totals.partners ?? 0);
        setServicesTotal(totals.other_services ?? 0);
        setTestimonialsTotal(totals.testimonials ?? 0);
      }
    } catch (err) {
      // Log analytics fetch errors for debugging
      console.debug("DashboardHome: fetchSummary error", err);
    }
  };

  const formatNumber = (n: number) => {
    if (n >= 1000000) return (n / 1000000).toFixed(1) + "M";
    if (n >= 1000) return (n / 1000).toFixed(1) + "k";
    return String(n);
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-white">Dashboard</h2>
        <div className="flex gap-2">
          <Button
            onClick={() => navigate("/bookings")}
            className="bg-[var(--color-brand-green)] hover:bg-[#1ed760] text-[var(--color-main)]"
          >
            View Bookings
          </Button>
          <Button
            onClick={() => navigate("/tutors")}
            className="bg-white/10 border-white/20 text-white hover:bg-white/20"
          >
            View Tutors
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {[
          { label: "Bookings", value: bookingsTotal },
          { label: "Tutors", value: tutorsTotal },
          { label: "Partners", value: partnersTotal },
          { label: "Services", value: servicesTotal },
          { label: "Testimonials", value: testimonialsTotal },
        ].map((c, idx) => (
          <Card key={idx}>
            <div className="text-sm text-white/70">Total {c.label}</div>
            <div className="text-3xl font-bold text-white">
              {formatNumber(c.value)}
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white/5 backdrop-blur rounded-xl border border-white/10 p-4">
          <h3 className="font-semibold mb-2 text-white">Recent Bookings</h3>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-white/10 border-b border-white/10">
                  <TableHead className="text-white">Name</TableHead>
                  <TableHead className="text-white">Grade</TableHead>
                  <TableHead className="text-white">Address</TableHead>
                  <TableHead className="text-white">Created</TableHead>
                  <TableHead className="text-white">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bookings.length ? (
                  bookings.map((b) => (
                    <TableRow
                      key={b.id}
                      className="hover:bg-white/5 border-b border-white/5"
                    >
                      <TableCell className="text-white">
                        {b.first_name} {b.last_name}
                      </TableCell>
                      <TableCell className="text-white">{b.grade}</TableCell>
                      <TableCell className="text-white">{b.address}</TableCell>
                      <TableCell className="text-white/80 text-sm">
                        {b.created_at
                          ? new Date(b.created_at).toLocaleString()
                          : "-"}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/bookings/${b.id}`)}
                          className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                        >
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center text-white/70"
                    >
                      No recent bookings
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur rounded-xl border border-white/10 p-4">
          <h3 className="font-semibold mb-2 text-white">Recent Tutors</h3>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-white/10 border-b border-white/10">
                  <TableHead className="text-white">Name</TableHead>
                  <TableHead className="text-white">Days/Week</TableHead>
                  <TableHead className="text-white">Hours/Day</TableHead>
                  <TableHead className="text-white">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tutors.length ? (
                  tutors.map((t) => (
                    <TableRow
                      key={t.id}
                      className="hover:bg-white/5 border-b border-white/5"
                    >
                      <TableCell className="text-white">
                        {t.first_name} {t.last_name}
                      </TableCell>
                      <TableCell className="text-white">
                        {t.day_per_week ?? "-"}
                      </TableCell>
                      <TableCell className="text-white">
                        {t.hr_per_day ?? "-"}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/tutors/${t.id}`)}
                          className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                        >
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="text-center text-white/70"
                    >
                      No recent tutors
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;
