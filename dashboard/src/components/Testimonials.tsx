import axios from "axios";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { NavLink, useNavigate } from "react-router-dom";
import { TestimonialTable, type Testimonial } from "./TestimonialTable";
import SharedPagination from "./SharedPagination";
const Testimonials = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<Testimonial[]>([]);
  const [meta, setMeta] = useState({
    page: 1,
    limit: 10,
    total: 0,
    previous_page: 0,
    next_page: 0,
  });
  const [sortBy, setSortBy] = useState<"name" | "role" | "created_at">(
    "created_at"
  );
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [search, setSearch] = useState("");

  const fetchTestimonials = async (page = meta.page) => {
    const params = new URLSearchParams();
    params.append("sort_by", sortBy);
    params.append("sort_order", sortOrder);
    if (search) params.append("search", search);
    params.append("page", String(page));
    params.append("limit", String(meta.limit));
    const resp = await axios.get(`/api/testimonials/`, {
      params: Object.fromEntries(params.entries()),
    });
    if (resp.data) {
      setData(resp.data.data || []);
      if (resp.data.pagination) setMeta(resp.data.pagination);
    }
  };

  useEffect(() => {
    fetchTestimonials(meta.page);
    // eslint-disable-next-line
  }, [sortBy, sortOrder, search, meta.page]);

  const handleDelete = async (id: number) => {
    const token = localStorage.getItem("auth");
    const resp = await axios.delete(`/api/testimonials/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (resp.status !== 204) {
      alert("Failed to delete testimonial");
      return;
    }
    fetchTestimonials(meta.page);
  };

  const handleSort = (field: "name" | "role" | "created_at") => {
    if (sortBy === field) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  const handleView = (id: number) => {
    navigate(`/testimonials/${id}`);
  };

  const handlePageChange = (newPage: number) => {
    setMeta((prev) => ({ ...prev, page: newPage }));
  };

  return (
    <div className="space-y-6 p-8">
      <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6">
        <div className="flex gap-3 justify-between items-center flex-wrap">
          <div className="flex items-center gap-3 flex-wrap">
            <Input
              type="text"
              placeholder="Search testimonials..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setMeta((m) => ({ ...m, page: 1 }));
              }}
              className="max-w-sm bg-white/10 border-white/20 text-white placeholder:text-white/60"
            />
          </div>
          <div className="flex items-center gap-2">
            <NavLink to="/create-testimonial">
              <Button className="bg-[var(--color-brand-green)] hover:bg-[#1ed760] text-[var(--color-main)] font-semibold px-6 py-2 rounded-lg transition-colors">
                Create Testimonial
              </Button>
            </NavLink>
          </div>
        </div>
      </div>

      <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <TestimonialTable
            testimonials={data}
            sortBy={sortBy}
            sortOrder={sortOrder}
            onSort={handleSort}
            onView={handleView}
            onDelete={handleDelete}
          />
        </div>
      </div>

      <div className="mt-6">
        <SharedPagination meta={meta} onPageChange={handlePageChange} />
      </div>
    </div>
  );
};

export default Testimonials;
