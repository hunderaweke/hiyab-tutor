import React, { useEffect, useState } from "react";
import { HttpStatusCode } from "axios";
import api from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import SharedPagination from "./SharedPagination";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { useNavigate } from "react-router-dom";
import { Card } from "./ui/card";

// Assignment status badge for table
const StatusBadge: React.FC<{ assigned?: boolean }> = ({ assigned }) =>
  assigned ? (
    <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--color-brand-green)] text-[var(--color-main)] font-semibold text-sm shadow">
      <svg
        className="w-4 h-4 text-[var(--color-main)]"
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
    <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 text-white/80 font-semibold text-sm shadow">
      <svg
        className="w-4 h-4 text-white/80"
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

interface Booking {
  id: number;
  first_name: string;
  last_name: string;
  gender: "male" | "female";
  address: string;
  phone_number: string;
  day_per_week: number;
  hr_per_day: number;
  assigned: boolean;
  grade: number;
}

interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
}

const Bookings: React.FC = () => {
  const [bookings, setServices] = useState<Booking[]>([]);
  const [meta, setMeta] = useState<PaginationMeta>({
    page: 1,
    limit: 10,
    total: 0,
  });
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("first_name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const fetchServices = async (
    page = 1,
    searchValue = "",
    sort = "first_name",
    order: "asc" | "desc" = "asc"
  ) => {
    try {
      const params = new URLSearchParams();
      if (searchValue) params.append("search", searchValue);
      params.append("page", String(page));
      params.append("limit", String(meta.limit));
      params.append("sort_by", sort);
      params.append("sort_order", order);

      const resp = await api.get(`/bookings/`, {
        params: Object.fromEntries(params.entries()),
      });
      // API may return { data: [...], meta: { ... } } or an array directly
      if (resp.data) {
        if (Array.isArray(resp.data)) setServices(resp.data);
        else if (Array.isArray(resp.data.data)) setServices(resp.data.data);
        else setServices([]);
      }
      // backend returns { data: [...], pagination: {...} }
      if (resp.data && resp.data.pagination) setMeta(resp.data.pagination);
      setError(null);
    } catch {
      setError("Failed to fetch services");
    }
  };

  const toggleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
    // reset to first page
    setMeta((m) => ({ ...m, page: 1 }));
  };
  const handleDelete = async (id: number) => {
    const resp = await api.delete(`/bookings/${id}`);
    if (resp.status === HttpStatusCode.NoContent) {
      fetchServices();
    }
  };
  useEffect(() => {
    fetchServices(meta.page, search, sortBy, sortOrder);
    // eslint-disable-next-line
  }, [meta.page, search, sortBy, sortOrder]);

  const handleCreate = () => {
    navigate("/create-booking");
  };

  return (
    <div className="space-y-6 p-8">
      <Card className="p-6">
        <div className="flex flex-col md:flex-row gap-3 justify-between items-center">
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <Input
              type="text"
              placeholder="Search bookings..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setMeta((m) => ({ ...m, page: 1 }));
              }}
              className="max-w-sm bg-white/10 border-white/20 text-white placeholder:text-white/60"
            />
          </div>
          <div className="w-full md:w-auto flex justify-end">
            <Button
              onClick={handleCreate}
              className="bg-[var(--color-brand-green)] hover:bg-[#1ed760] text-[var(--color-main)] font-semibold px-6 py-2 rounded-lg transition-colors"
            >
              Create Booking
            </Button>
          </div>
        </div>
      </Card>
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded px-3 py-2">
          {error}
        </div>
      )}
      <Card className="overflow-hidden">
        <Table className="mb-0 min-w-[800px]">
          <TableHeader>
            <TableRow className="bg-white/10 hover:bg-white/15 border-b border-white/10">
              <TableHead
                className="cursor-pointer select-none text-white font-semibold hover:text-[var(--color-brand-green)]"
                onClick={() => toggleSort("first_name")}
              >
                First Name{" "}
                {sortBy === "first_name" && (sortOrder === "asc" ? " ▲" : " ▼")}
              </TableHead>
              <TableHead
                className="cursor-pointer select-none text-white font-semibold hover:text-[var(--color-brand-green)]"
                onClick={() => toggleSort("last_name")}
              >
                Last Name{" "}
                {sortBy === "last_name" && (sortOrder === "asc" ? " ▲" : " ▼")}
              </TableHead>
              <TableHead
                className="cursor-pointer select-none text-white font-semibold hover:text-[var(--color-brand-green)]"
                onClick={() => toggleSort("gender")}
              >
                Gender{" "}
                {sortBy === "gender" && (sortOrder === "asc" ? " ▲" : " ▼")}
              </TableHead>
              <TableHead
                className="cursor-pointer select-none text-white font-semibold hover:text-[var(--color-brand-green)]"
                onClick={() => toggleSort("grade")}
              >
                Grade{" "}
                {sortBy === "grade" && (sortOrder === "asc" ? " ▲" : " ▼")}
              </TableHead>
              <TableHead
                className="cursor-pointer select-none text-white font-semibold hover:text-[var(--color-brand-green)]"
                onClick={() => toggleSort("address")}
              >
                Address{" "}
                {sortBy === "address" && (sortOrder === "asc" ? " ▲" : " ▼")}
              </TableHead>
              <TableHead
                className="cursor-pointer select-none text-white font-semibold hover:text-[var(--color-brand-green)]"
                onClick={() => toggleSort("phone_number")}
              >
                Phone Number{" "}
                {sortBy === "phone_number" &&
                  (sortOrder === "asc" ? " ▲" : " ▼")}
              </TableHead>

              <TableHead className="text-white font-semibold">
                Assigned
              </TableHead>
              <TableHead className="text-white font-semibold">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bookings.map((booking) => {
              return (
                <TableRow
                  key={booking.id}
                  className="hover:bg-white/5 border-b border-white/5"
                >
                  <TableCell className="text-white">
                    {booking.first_name}
                  </TableCell>
                  <TableCell className="text-white">
                    {booking.last_name}
                  </TableCell>
                  <TableCell className="text-white">
                    {booking.gender.toUpperCase()}
                  </TableCell>
                  <TableCell className="text-white">{booking.grade}</TableCell>
                  <TableCell className="text-white">
                    {booking.address}
                  </TableCell>
                  <TableCell className="text-white">
                    {booking.phone_number}
                  </TableCell>
                  <TableCell>
                    <StatusBadge assigned={booking.assigned} />
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                        onClick={() => navigate(`/bookings/${booking.id}`)}
                      >
                        View
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(booking.id)}
                        className="bg-red-500/20 border-red-500/30 text-red-300 hover:bg-red-500/30"
                      >
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>
      <div className="mt-6">
        <SharedPagination
          meta={meta}
          onPageChange={(page) => setMeta((m) => ({ ...m, page }))}
        />
      </div>
    </div>
  );
};

export default Bookings;
