import React, { useEffect, useState } from "react";
/* axios removed (unused) */
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
import api from "@/lib/api";

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
    try {
      const params = new URLSearchParams();
      if (searchValue) params.append("search", searchValue);
      params.append("page", String(page));
      params.append("limit", String(meta.limit));
      const res = await api.get(`/admin/`, {
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
    try {
      await api.delete(`/admin/${id}`);
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
    <div className="space-y-6 p-8">
      <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="w-full md:w-auto">
            <Input
              type="text"
              placeholder="Search admins..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setMeta((m) => ({ ...m, page: 1 }));
              }}
              className="max-w-sm bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:border-[var(--color-brand-green)]"
            />
          </div>
          <div className="w-full md:w-auto flex justify-end">
            <Button
              onClick={handleCreate}
              className="bg-[var(--color-brand-green)] hover:bg-[#1ed760] text-[var(--color-main)] font-semibold px-6 py-2 rounded-lg transition-colors"
            >
              Create Admin
            </Button>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg px-4 py-3">
          {error}
        </div>
      )}

      <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <Table className="mb-0 min-w-[700px]">
            <TableHeader>
              <TableRow className="bg-white/10 hover:bg-white/15 border-b border-white/10">
                <TableHead className="text-white font-semibold">
                  Username
                </TableHead>
                <TableHead className="text-white font-semibold">Name</TableHead>
                <TableHead className="text-white font-semibold">Role</TableHead>
                <TableHead className="text-white font-semibold">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {admins.map((admin) => (
                <TableRow
                  key={admin.id}
                  className="hover:bg-white/5 border-b border-white/5"
                >
                  <TableCell className="text-white">{admin.username}</TableCell>
                  <TableCell className="text-white">{admin.name}</TableCell>
                  <TableCell className="text-white">{admin.role}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                      >
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
                            className="bg-red-500/20 border-red-500/30 text-red-300 hover:bg-red-500/30"
                          >
                            Delete
                          </Button>
                        }
                        onAction={() => {
                          if (deleteId) handleDelete(deleteId);
                        }}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
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

export default Admins;
