import React, { useEffect, useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import SharedPagination from "./SharedPagination";
import CustomAlertDialog from "@/components/CustomAlertDialog";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { useNavigate } from "react-router-dom";

interface Admin {
  id: number;
  username: string;
  name: string;
  role: string;
}

interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
}

const Admins: React.FC = () => {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [meta, setMeta] = useState<PaginationMeta>({
    page: 1,
    limit: 10,
    total: 0,
  });
  const [search, setSearch] = useState("");
  // const [loading, setLoading] = useState(false); // Not used
  const [error, setError] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const fetchAdmins = async (page: number = 1, searchValue: string = "") => {
    const token = localStorage.getItem("auth");
    try {
      const params = new URLSearchParams();
      if (searchValue) params.append("search", searchValue);
      params.append("page", String(page));
      params.append("limit", String(meta.limit));
      const res = await axios.get(`/api/admin/`, {
        headers: { Authorization: `Bearer ${token}` },
        params: Object.fromEntries(params.entries()),
      });
      if (res.data) {
        setAdmins(res.data.data || []);
        if (res.data.pagination) setMeta(res.data.pagination);
      }
      setError(null);
    } catch (err: unknown) {
      if (typeof err === "object" && err !== null && "message" in err) {
        setError(
          (err as { message?: string }).message || "Failed to fetch admins"
        );
      } else {
        setError("Failed to fetch admins");
      }
    }
  };
  const navigate = useNavigate();
  const handleCreate = () => {
    navigate("/create-admin");
  };

  useEffect(() => {
    fetchAdmins(meta.page, search);
    // eslint-disable-next-line
  }, [meta.page, search]);

  const handleDelete = async (id: number) => {
    const token = localStorage.getItem("auth");
    try {
      await axios.delete(`/api/admin/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchAdmins(meta.page);
    } catch (err: unknown) {
      if (typeof err === "object" && err !== null && "message" in err) {
        setError(
          (err as { message?: string }).message || "Failed to delete admin"
        );
      } else {
        setError("Failed to delete admin");
      }
    }
    setDeleteId(null);
  };

  return (
    <div className="space-y-4 p-4 md:p-10">
      <div className="flex flex-col md:flex-row gap-2 justify-between items-center">
        <div className="w-full md:w-auto">
          <Input
            type="text"
            placeholder="Search admins..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setMeta((m) => ({ ...m, page: 1 }));
            }}
            className="max-w-sm"
          />
        </div>
        <div className="w-full md:w-auto flex justify-end">
          <Button onClick={handleCreate}>Create Admin</Button>
        </div>
      </div>

      {error && <div className="text-red-500 mb-2">{error}</div>}

      <div className="overflow-x-auto">
        <Table className="mb-4 min-w-[700px]">
          <TableHeader>
            <TableRow className="bg-gray-100">
              <TableHead>Username</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {admins.map((admin) => (
              <TableRow key={admin.id}>
                <TableCell>{admin.username}</TableCell>
                <TableCell>{admin.name}</TableCell>
                <TableCell>{admin.role}</TableCell>
                <TableCell>
                  <Button variant="outline" size="sm" className="mr-2">
                    Edit
                  </Button>
                  <CustomAlertDialog
                    title="Delete Admin"
                    description="Are you sure you want to delete this admin?"
                    trigger={
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => setDeleteId(admin.id)}
                      >
                        Delete
                      </Button>
                    }
                    onAction={() => {
                      if (deleteId) handleDelete(deleteId);
                    }}
                  />
                </TableCell>
              </TableRow>
            ))}
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

export default Admins;
