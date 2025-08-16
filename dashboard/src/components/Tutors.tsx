import React, { useEffect, useState } from "react";
import axios, { HttpStatusCode } from "axios";
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
      const resp = await axios.get(`/api/tutors/`, { params: paramsObj });
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
      const token = localStorage.getItem("auth");
      const resp = await axios.delete(`/api/tutors/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
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
    <div className="space-y-4 p-10">
      <div className="flex gap-2 justify-between items-center">
        <div className="flex items-center gap-2">
          <Input
            type="text"
            placeholder="Search tutors..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setMeta((m) => ({ ...m, page: 1 }));
            }}
            className="max-w-sm"
          />
          <Input
            type="number"
            placeholder="Min days"
            value={minDays ?? ""}
            onChange={(e) => {
              setMinDays(e.target.value ? Number(e.target.value) : null);
              setMeta((m) => ({ ...m, page: 1 }));
            }}
            className="w-28"
          />
          <Input
            type="number"
            placeholder="Max days"
            value={maxDays ?? ""}
            onChange={(e) => {
              setMaxDays(e.target.value ? Number(e.target.value) : null);
              setMeta((m) => ({ ...m, page: 1 }));
            }}
            className="w-28"
          />
          <Input
            type="number"
            placeholder="Min hrs"
            value={minHours ?? ""}
            onChange={(e) => {
              setMinHours(e.target.value ? Number(e.target.value) : null);
              setMeta((m) => ({ ...m, page: 1 }));
            }}
            className="w-28"
          />
          <select
            value={verifiedFilter}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
              setVerifiedFilter(
                e.target.value as "all" | "verified" | "unverified"
              );
              setMeta((m) => ({ ...m, page: 1 }));
            }}
            className="border rounded px-2 py-1"
          >
            <option value="all">All</option>
            <option value="verified">Verified</option>
            <option value="unverified">Unverified</option>
          </select>
          <Input
            type="number"
            placeholder="Max hrs"
            value={maxHours ?? ""}
            onChange={(e) => {
              setMaxHours(e.target.value ? Number(e.target.value) : null);
              setMeta((m) => ({ ...m, page: 1 }));
            }}
            className="w-28"
          />
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={handleCreate}>Create Tutor</Button>
        </div>
      </div>
      {error && (
        <Alert variant="destructive" className="mb-2">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <Table className="mb-4">
        <TableHeader>
          <TableRow className="bg-gray-100">
            <TableHead
              className="cursor-pointer"
              onClick={() => {
                setSortBy("first_name");
                setSortOrder((p) => (p === "asc" ? "desc" : "asc"));
              }}
            >
              First Name
            </TableHead>
            <TableHead
              className="cursor-pointer"
              onClick={() => {
                setSortBy("last_name");
                setSortOrder((p) => (p === "asc" ? "desc" : "asc"));
              }}
            >
              Last Name
            </TableHead>
            <TableHead>Image</TableHead>
            <TableHead>Education Level</TableHead>
            <TableHead>Phone Number</TableHead>
            <TableHead>Email</TableHead>
            <TableHead
              className="cursor-pointer"
              onClick={() => {
                setSortBy("day_per_week");
                setSortOrder((p) => (p === "asc" ? "desc" : "asc"));
              }}
            >
              Days/Week
            </TableHead>
            <TableHead
              className="cursor-pointer"
              onClick={() => {
                setSortBy("hr_per_day");
                setSortOrder((p) => (p === "asc" ? "desc" : "asc"));
              }}
            >
              Hours/Day
            </TableHead>
            <TableHead>Verified</TableHead>
            <TableHead
              className="cursor-pointer"
              onClick={() => {
                setSortBy("created_at");
                setSortOrder((p) => (p === "asc" ? "desc" : "asc"));
              }}
            >
              Created At
            </TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tutors.map((tutor) => (
            <TableRow key={tutor.id}>
              <TableCell>{tutor.first_name}</TableCell>
              <TableCell>{tutor.last_name}</TableCell>
              <TableCell>
                {tutor.image ? (
                  <img
                    src={`/api/${tutor.image}`}
                    alt="t"
                    className="w-12 h-12 object-cover rounded"
                  />
                ) : (
                  <div className="w-12 h-12 bg-gray-100 flex items-center justify-center text-gray-400">
                    N/A
                  </div>
                )}
              </TableCell>
              <TableCell>{tutor.education_level}</TableCell>
              <TableCell>{tutor.phone_number}</TableCell>
              <TableCell>{tutor.email}</TableCell>
              <TableCell>{tutor.day_per_week}</TableCell>
              <TableCell>{tutor.hr_per_day}</TableCell>
              <TableCell>
                <StatusBadge verified={tutor.verified} />
              </TableCell>
              <TableCell>
                {tutor.created_at
                  ? new Date(tutor.created_at).toLocaleString()
                  : "-"}
              </TableCell>
              <TableCell>
                <Button
                  variant="outline"
                  size="sm"
                  className="mr-2"
                  onClick={() => navigate(`/tutors/${tutor.id}`)}
                >
                  View
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(tutor.id)}
                >
                  Delete
                </Button>
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
                      const token = localStorage.getItem("auth");
                      const resp = await axios.delete(
                        `/api/tutors/${deleteCandidate.id}`,
                        { headers: { Authorization: `Bearer ${token}` } }
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
      <SharedPagination
        meta={meta}
        onPageChange={(page) => setMeta((m) => ({ ...m, page }))}
      />
    </div>
  );
};

export default Tutors;
