import React, { useEffect, useState } from "react";
import axios from "axios";
import { Button } from "./ui/button";
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
  const navigate = useNavigate();

  const fetchSummary = async () => {
    try {
      const b = await axios.get(`/api/bookings`, {
        params: { page: 1, limit: 5 },
      });
      if (b.data) {
        setBookings(Array.isArray(b.data.data) ? b.data.data : []);
        if (b.data.pagination && typeof b.data.pagination.total === "number")
          setBookingsTotal(b.data.pagination.total);
      }
      const t = await axios.get(`/api/tutors`, {
        params: { page: 1, limit: 5 },
      });
      if (t.data) {
        setTutors(Array.isArray(t.data.data) ? t.data.data : []);
        if (t.data.pagination && typeof t.data.pagination.total === "number")
          setTutorsTotal(t.data.pagination.total);
      }
    } catch (err) {
      // silent for now
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Dashboard</h2>
        <div className="flex gap-2">
          <Button onClick={() => navigate("/bookings")}>View Bookings</Button>
          <Button onClick={() => navigate("/tutors")}>View Tutors</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded shadow">
          <div className="text-sm text-gray-500">Total Bookings</div>
          <div className="text-3xl font-bold">{bookingsTotal}</div>
        </div>
        <div className="p-4 bg-white rounded shadow">
          <div className="text-sm text-gray-500">Total Tutors</div>
          <div className="text-3xl font-bold">{tutorsTotal}</div>
        </div>
        <div className="p-4 bg-white rounded shadow">
          <div className="text-sm text-gray-500">Actions</div>
          <div className="mt-2 flex gap-2">
            <Button onClick={() => navigate("/create-booking")}>
              New Booking
            </Button>
            <Button onClick={() => navigate("/create-tutor")}>New Tutor</Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded shadow p-4">
          <h3 className="font-semibold mb-2">Recent Bookings</h3>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Grade</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bookings.length ? (
                  bookings.map((b) => (
                    <TableRow key={b.id}>
                      <TableCell>
                        {b.first_name} {b.last_name}
                      </TableCell>
                      <TableCell>{b.grade}</TableCell>
                      <TableCell>{b.address}</TableCell>
                      <TableCell>
                        {b.created_at
                          ? new Date(b.created_at).toLocaleString()
                          : "-"}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/bookings/${b.id}`)}
                        >
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center">
                      No recent bookings
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        <div className="bg-white rounded shadow p-4">
          <h3 className="font-semibold mb-2">Recent Tutors</h3>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Days/Week</TableHead>
                  <TableHead>Hours/Day</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tutors.length ? (
                  tutors.map((t) => (
                    <TableRow key={t.id}>
                      <TableCell>
                        {t.first_name} {t.last_name}
                      </TableCell>
                      <TableCell>{t.day_per_week ?? "-"}</TableCell>
                      <TableCell>{t.hr_per_day ?? "-"}</TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/tutors/${t.id}`)}
                        >
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center">
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
