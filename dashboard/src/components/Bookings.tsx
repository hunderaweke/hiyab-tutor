import React, { useEffect, useState } from "react";
import axios, { HttpStatusCode } from "axios";
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

// Assignment status badge for table
const StatusBadge: React.FC<{ assigned?: boolean }> = ({ assigned }) =>
  assigned ? (
    <span className="inline-flex items-center gap-2 px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-semibold text-sm shadow">
      <svg
        className="w-4 h-4 text-green-500"
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
    <span className="inline-flex items-center gap-2 px-2 py-0.5 rounded-full bg-red-100 text-red-700 font-semibold text-sm shadow">
      <svg
        className="w-4 h-4 text-red-500"
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
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const fetchServices = async (
    page = 1,
    searchValue = "",
    sort = "name",
    order: "asc" | "desc" = "asc"
  ) => {
    const token = localStorage.getItem("auth");
    try {
      const params = new URLSearchParams();
      params.append("search", searchValue);
      params.append("page", String(page));
      params.append("limit", String(meta.limit));
      params.append("sort_by", sort);
      params.append("sort_order", order);

      const resp = await axios.get(`/api/bookings`, {
        headers: { Authorization: `Bearer ${token}` },
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
  const handleDelete = async (id: number) => {
    const token = localStorage.getItem("auth");
    const resp = await axios.delete(`/api/bookings/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
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
    <div className="space-y-4 p-4 md:p-10">
      <div className="flex flex-col md:flex-row gap-2 justify-between items-center">
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <Input
            type="text"
            placeholder="Search bookings..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setMeta((m) => ({ ...m, page: 1 }));
            }}
            className="max-w-sm"
          />
        </div>
        <div className="w-full md:w-auto flex justify-end">
          <Button onClick={handleCreate}>Create Booking</Button>
        </div>
      </div>
      {error && <div className="text-red-500 mb-2">{error}</div>}
      <div className="overflow-x-auto">
        <Table className="mb-4 min-w-[800px]">
          <TableHeader>
            <TableRow className="bg-gray-100">
              <TableHead>First Name</TableHead>
              <TableHead>Last Name</TableHead>
              <TableHead>Gender</TableHead>
              <TableHead
                className="cursor-pointer select-none"
                onClick={() => {
                  setSortBy("name");
                  setSortOrder((prev) =>
                    sortBy === "gender" && prev === "asc" ? "desc" : "asc"
                  );
                }}
              >
                Grade
                {sortBy === "gender" && (sortOrder === "asc" ? " ▲" : " ▼")}
              </TableHead>
              <TableHead
                className="cursor-pointer select-none"
                onClick={() => {
                  setSortBy("gender");
                  setSortOrder((prev) =>
                    sortBy === "gender" && prev === "asc" ? "desc" : "asc"
                  );
                }}
              >
                Address
                {sortBy === "grade" && (sortOrder === "asc" ? " ▲" : " ▼")}
              </TableHead>
              <TableHead
                className="cursor-pointer select-none"
                onClick={() => {
                  setSortBy("address");
                  setSortOrder((prev) =>
                    sortBy === "address" && prev === "asc" ? "desc" : "asc"
                  );
                }}
              >
                Phone Number
                {sortBy === "address" && (sortOrder === "asc" ? " ▲" : " ▼")}
              </TableHead>

              <TableHead>Assigned</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bookings.map((booking) => {
              return (
                <TableRow key={booking.id}>
                  <TableCell>{booking.first_name}</TableCell>
                  <TableCell>{booking.last_name}</TableCell>
                  <TableCell>{booking.gender.toUpperCase()}</TableCell>
                  <TableCell>{booking.grade}</TableCell>
                  <TableCell>{booking.address}</TableCell>
                  <TableCell>{booking.phone_number}</TableCell>
                  <TableCell>
                    <StatusBadge assigned={booking.assigned} />
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mr-2"
                      onClick={() => navigate(`/bookings/${booking.id}`)}
                    >
                      View
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(booking.id)}
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
      <SharedPagination
        meta={meta}
        onPageChange={(page) => setMeta((m) => ({ ...m, page }))}
      />
    </div>
  );
};

export default Bookings;
