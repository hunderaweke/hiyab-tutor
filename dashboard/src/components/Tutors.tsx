import React, { useEffect, useState } from "react";
import { HttpStatusCode } from "axios";
import api from "@/lib/api";
import { Button } from "./ui/button";
import { Alert, AlertTitle, AlertDescription } from "./ui/alert";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from "./ui/alert-dialog";
import { Input } from "./ui/input";
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

interface Tutor {
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
  created_at?: string;
}

interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
}

const StatusBadge: React.FC<{ verified?: boolean }> = ({ verified }) =>
  verified ? (
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
      Verified
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
      Unverified
    </span>
  );

const Tutors: React.FC = () => {
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [meta, setMeta] = useState<PaginationMeta>({
    page: 1,
    limit: 10,
    total: 0,
  });
  const [verifiedFilter, setVerifiedFilter] = useState<
    "all" | "verified" | "unverified"
  >("all");
  const [deleteCandidate, setDeleteCandidate] = useState<Tutor | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("first_name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [minDays, setMinDays] = useState<number | null>(null);
  const [maxDays, setMaxDays] = useState<number | null>(null);
  const [minHours, setMinHours] = useState<number | null>(null);
  const [maxHours, setMaxHours] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const fetchTutors = async (
    page = 1,
    searchValue = "",
    sort = sortBy,
    order: "asc" | "desc" = sortOrder
  ) => {
    try {
      const params = new URLSearchParams();
      if (verifiedFilter !== "all")
        params.append(
          "verified",
          verifiedFilter === "verified" ? "true" : "false"
        );
      params.append("search", searchValue);
      params.append("page", String(page));
      params.append("limit", String(meta.limit));
      params.append("sort_by", sort);
      params.append("sort_order", order);
      if (minDays !== null) params.append("min_day_per_week", String(minDays));
      if (maxDays !== null) params.append("max_day_per_week", String(maxDays));
      if (minHours !== null) params.append("min_hr_per_day", String(minHours));
      if (maxHours !== null) params.append("max_hr_per_day", String(maxHours));

      const paramsObj = Object.fromEntries(params.entries());
      const resp = await api.get(`/tutors/`, { params: paramsObj });
      if (resp.data) {
        if (resp.data.pagination) setMeta(resp.data.pagination);
        if (Array.isArray(resp.data.data)) setTutors(resp.data.data);
        else if (Array.isArray(resp.data)) setTutors(resp.data);
      }
      setError(null);
    } catch {
      setError("Failed to fetch tutors");
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this tutor?")) return;
    try {
      const resp = await api.delete(`/tutors/${id}`);
      if (resp.status === HttpStatusCode.NoContent) {
        // refresh current page
        fetchTutors(meta.page, search);
      }
    } catch {
      setError("Failed to delete tutor");
    }
  };

  useEffect(() => {
    fetchTutors(meta.page, search);
    // eslint-disable-next-line
  }, [
    meta.page,
    search,
    sortBy,
    sortOrder,
    minDays,
    maxDays,
    minHours,
    maxHours,
    verifiedFilter,
  ]);

  const handleCreate = () => {
    navigate("/create-tutor");
  };

  return (
    <div className="space-y-6 p-8">
      <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6">
        <div className="flex gap-3 justify-between items-center flex-wrap">
          <div className="flex items-center gap-3 flex-wrap">
            <Input
              type="text"
              placeholder="Search tutors..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setMeta((m) => ({ ...m, page: 1 }));
              }}
              className="max-w-sm bg-white/10 border-white/20 text-white placeholder:text-white/60"
            />
            <Input
              type="number"
              placeholder="Min days"
              value={minDays ?? ""}
              onChange={(e) => {
                setMinDays(e.target.value ? Number(e.target.value) : null);
                setMeta((m) => ({ ...m, page: 1 }));
              }}
              className="w-28 bg-white/10 border-white/20 text-white placeholder:text-white/60"
            />
            <Input
              type="number"
              placeholder="Max days"
              value={maxDays ?? ""}
              onChange={(e) => {
                setMaxDays(e.target.value ? Number(e.target.value) : null);
                setMeta((m) => ({ ...m, page: 1 }));
              }}
              className="w-28 bg-white/10 border-white/20 text-white placeholder:text-white/60"
            />
            <Input
              type="number"
              placeholder="Min hrs"
              value={minHours ?? ""}
              onChange={(e) => {
                setMinHours(e.target.value ? Number(e.target.value) : null);
                setMeta((m) => ({ ...m, page: 1 }));
              }}
              className="w-28 bg-white/10 border-white/20 text-white placeholder:text-white/60"
            />
            <select
              value={verifiedFilter}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                setVerifiedFilter(
                  e.target.value as "all" | "verified" | "unverified"
                );
                setMeta((m) => ({ ...m, page: 1 }));
              }}
              className="bg-white/10 border-white/20 text-white rounded px-3 py-2"
            >
              <option value="all" className="bg-[var(--color-main)] text-white">
                All
              </option>
              <option
                value="verified"
                className="bg-[var(--color-main)] text-white"
              >
                Verified
              </option>
              <option
                value="unverified"
                className="bg-[var(--color-main)] text-white"
              >
                Unverified
              </option>
            </select>
            <Input
              type="number"
              placeholder="Max hrs"
              value={maxHours ?? ""}
              onChange={(e) => {
                setMaxHours(e.target.value ? Number(e.target.value) : null);
                setMeta((m) => ({ ...m, page: 1 }));
              }}
              className="w-28 bg-white/10 border-white/20 text-white placeholder:text-white/60"
            />
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={handleCreate}
              className="bg-[var(--color-brand-green)] hover:bg-[#1ed760] text-[var(--color-main)] font-semibold px-6 py-2 rounded-lg transition-colors"
            >
              Create Tutor
            </Button>
          </div>
        </div>
      </div>
      {error && (
        <Alert variant="destructive" className="mb-2">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden">
        <Table className="mb-0">
          <TableHeader>
            <TableRow className="bg-white/10 hover:bg-white/15 border-b border-white/10">
              <TableHead
                className="cursor-pointer select-none text-white font-semibold hover:text-[var(--color-brand-green)] transition-colors"
                onClick={() => {
                  setSortBy("first_name");
                  setSortOrder((p) =>
                    sortBy === "first_name" && p === "asc" ? "desc" : "asc"
                  );
                }}
              >
                First Name{" "}
                {sortBy === "first_name" && (sortOrder === "asc" ? "▲" : "▼")}
              </TableHead>
              <TableHead
                className="cursor-pointer select-none text-white font-semibold hover:text-[var(--color-brand-green)] transition-colors"
                onClick={() => {
                  setSortBy("last_name");
                  setSortOrder((p) =>
                    sortBy === "last_name" && p === "asc" ? "desc" : "asc"
                  );
                }}
              >
                Last Name{" "}
                {sortBy === "last_name" && (sortOrder === "asc" ? "▲" : "▼")}
              </TableHead>
              <TableHead className="text-white font-semibold">Image</TableHead>
              <TableHead className="text-white font-semibold">
                Education Level
              </TableHead>
              <TableHead className="text-white font-semibold">
                Phone Number
              </TableHead>
              <TableHead className="text-white font-semibold">Email</TableHead>
              <TableHead
                className="cursor-pointer select-none text-white font-semibold hover:text-[var(--color-brand-green)] transition-colors"
                onClick={() => {
                  setSortBy("day_per_week");
                  setSortOrder((p) =>
                    sortBy === "day_per_week" && p === "asc" ? "desc" : "asc"
                  );
                }}
              >
                Days/Week{" "}
                {sortBy === "day_per_week" && (sortOrder === "asc" ? "▲" : "▼")}
              </TableHead>
              <TableHead
                className="cursor-pointer select-none text-white font-semibold hover:text-[var(--color-brand-green)] transition-colors"
                onClick={() => {
                  setSortBy("hr_per_day");
                  setSortOrder((p) =>
                    sortBy === "hr_per_day" && p === "asc" ? "desc" : "asc"
                  );
                }}
              >
                Hours/Day{" "}
                {sortBy === "hr_per_day" && (sortOrder === "asc" ? "▲" : "▼")}
              </TableHead>
              <TableHead className="text-white font-semibold">
                Verified
              </TableHead>
              <TableHead
                className="cursor-pointer select-none text-white font-semibold hover:text-[var(--color-brand-green)] transition-colors"
                onClick={() => {
                  setSortBy("created_at");
                  setSortOrder((p) =>
                    sortBy === "created_at" && p === "asc" ? "desc" : "asc"
                  );
                }}
              >
                Created At{" "}
                {sortBy === "created_at" && (sortOrder === "asc" ? "▲" : "▼")}
              </TableHead>
              <TableHead className="text-white font-semibold">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tutors.map((tutor) => (
              <TableRow
                key={tutor.id}
                className="hover:bg-white/5 border-b border-white/5"
              >
                <TableCell className="text-white">{tutor.first_name}</TableCell>
                <TableCell className="text-white">{tutor.last_name}</TableCell>
                <TableCell>
                  {tutor.image ? (
                    <img
                      src={`/api/${tutor.image}`}
                      alt="t"
                      className="w-12 h-12 object-cover rounded-lg border border-white/20"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-white/10 flex items-center justify-center text-white/60 rounded-lg border border-white/20">
                      N/A
                    </div>
                  )}
                </TableCell>
                <TableCell className="text-white">
                  {tutor.education_level}
                </TableCell>
                <TableCell className="text-white">
                  {tutor.phone_number}
                </TableCell>
                <TableCell className="text-white">{tutor.email}</TableCell>
                <TableCell className="text-white">
                  {tutor.day_per_week}
                </TableCell>
                <TableCell className="text-white">{tutor.hr_per_day}</TableCell>
                <TableCell>
                  <StatusBadge verified={tutor.verified} />
                </TableCell>
                <TableCell className="text-white/80 text-sm">
                  {tutor.created_at
                    ? new Date(tutor.created_at).toLocaleString()
                    : "-"}
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/tutors/${tutor.id}`)}
                      className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                    >
                      View
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(tutor.id)}
                      className="bg-red-500/20 border-red-500/30 text-red-300 hover:bg-red-500/30"
                    >
                      Delete
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {successMessage && (
              <div className="mt-2">
                <Alert className="mb-2">
                  <AlertTitle>Success</AlertTitle>
                  <AlertDescription>{successMessage}</AlertDescription>
                </Alert>
              </div>
            )}
            <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete tutor</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete{" "}
                    <strong>
                      {deleteCandidate
                        ? `${deleteCandidate.first_name} ${deleteCandidate.last_name}`
                        : ""}
                    </strong>
                    ?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={async () => {
                      if (!deleteCandidate) return;
                      try {
                        const resp = await api.delete(
                          `/tutors/${deleteCandidate.id}`
                        );
                        if (resp.status === HttpStatusCode.NoContent) {
                          setSuccessMessage("Tutor deleted successfully");
                          fetchTutors(meta.page, search);
                        }
                      } catch {
                        setError("Failed to delete tutor");
                      } finally {
                        setIsDeleteOpen(false);
                        setDeleteCandidate(null);
                      }
                    }}
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </TableBody>
        </Table>
      </div>
      <div className="mt-6">
        <SharedPagination
          meta={meta}
          onPageChange={(page) => setMeta((m) => ({ ...m, page }))}
        />
      </div>
    </div>
  );
};

export default Tutors;
