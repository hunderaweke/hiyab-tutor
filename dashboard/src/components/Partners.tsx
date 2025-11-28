import axios from "axios";
import { Eye, Trash } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import CustomAlertDialog from "./CustomAlertDialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import SharedPagination from "./SharedPagination";

interface Partner {
  id: number;
  website_url: string;
  image_url: string;
  name: string;
}

const Partners: React.FC = () => {
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");
  const [partners, setPartners] = useState<Partner[]>([]);
  const [search, setSearch] = useState("");
  const [meta, setMeta] = useState({ page: 1, limit: 10, total: 0 });

  const fetchPartners = async (page = 1) => {
    const params = new URLSearchParams();
    if (search) params.append("search", search);
    params.append("page", String(page));
    params.append("limit", String(meta.limit));
    params.append("sort_by", sortBy);
    params.append("sort_order", sortOrder);
    const response = await axios.get(`/api/v1/partners/`, {
      params: Object.fromEntries(params.entries()),
    });
    const data = response.data;
    if (data) {
      if (Array.isArray(data.data)) setPartners(data.data);
      else if (Array.isArray(data)) setPartners(data);
      if (data.pagination) setMeta(data.pagination);
    }
  };

  const navigate = useNavigate();
  const onClick = () => navigate("/create-partner");
  useEffect(() => {
    fetchPartners(meta.page);
    // eslint-disable-next-line
  }, [sortBy, sortOrder, meta.page, search]);
  const onSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };
  const onView = (id: number) => navigate(`/partners/${id}`);
  const onDelete = async (id: number) => {
    const token = localStorage.getItem("auth");
    await axios.delete(`/api/v1/partners/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchPartners(meta.page);
  };

  return (
    <div className="space-y-6 p-8">
      <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6">
        <div className="flex gap-3 justify-between items-center flex-wrap">
          <div className="flex items-center gap-3 flex-wrap">
            <Input
              placeholder="Search Partners..."
              className="max-w-sm bg-white/10 border-white/20 text-white placeholder:text-white/60"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setMeta((m) => ({ ...m, page: 1 }));
              }}
            />
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={onClick}
              className="bg-[var(--color-brand-green)] hover:bg-[#1ed760] text-[var(--color-main)] font-semibold px-6 py-2 rounded-lg transition-colors"
            >
              Add Partner
            </Button>
          </div>
        </div>
      </div>

      <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableCaption>Partners List</TableCaption>
            <TableHeader>
              <TableRow className="bg-white/10 hover:bg-white/15 border-b border-white/10 md:text-lg">
                <TableHead
                  className="cursor-pointer select-none text-white font-semibold"
                  onClick={() => onSort("name")}
                >
                  Name{" "}
                  {sortBy === "name" ? (sortOrder === "asc" ? "▲" : "▼") : null}
                </TableHead>
                <TableHead className="text-white font-semibold">
                  Website URL
                </TableHead>
                <TableHead className="text-white font-semibold">
                  Image (Logo)
                </TableHead>
                <TableHead className="text-white font-semibold">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {partners.length ? (
                partners.map((t) => (
                  <TableRow
                    className="hover:bg-white/5 border-b border-white/5"
                    key={t.id}
                  >
                    <TableCell className="text-white">{t.name}</TableCell>
                    <TableCell>
                      {t.website_url ? (
                        <a
                          href={`https://${t.website_url}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[var(--color-brand-green)] underline"
                        >
                          {t.website_url}
                        </a>
                      ) : (
                        <span className="text-white/60">N/A</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {t.image_url ? (
                        <img
                          src={`/api/v1/${t.image_url}`}
                          alt="thumbnail"
                          className="h-12 w-28 object-cover rounded-md border border-white/20"
                        />
                      ) : (
                        <div className="h-12 w-28 bg-white/10 text-white/60 flex items-center justify-center rounded-md">
                          -
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="flex gap-2">
                      <Button
                        onClick={() => onView(t.id)}
                        className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                      >
                        <Eye className="h-4 w-4 mr-1" /> View
                      </Button>
                      <CustomAlertDialog
                        trigger={
                          <Button
                            variant="destructive"
                            className="bg-red-500/20 border-red-500/30 text-red-300 hover:bg-red-500/30"
                          >
                            <Trash className="h-4 w-4 mr-1" /> Delete
                          </Button>
                        }
                        title="Are you absolutely sure?"
                        description="This action cannot be undone. This will permanently delete the testimonial and remove the data from our servers."
                        cancelText="Cancel"
                        actionText="Continue"
                        onAction={() => onDelete(t.id)}
                      />
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-white/70">
                    No partners found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <SharedPagination
        meta={meta}
        onPageChange={(page) => setMeta((m) => ({ ...m, page }))}
      />
    </div>
  );
};

export default Partners;
