import axios from "axios";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
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
    const resp = await axios.get(
      `/api/testimonials/?sort_by=${sortBy}&sort_order=${sortOrder}&search=${search}&page=${page}&limit=${meta.limit}`
    );
    setData(resp.data.data || []);
    if (resp.data.meta) setMeta(resp.data.meta);
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
    <div className="space-y-4 p-10">
      <div className="flex gap-2 justify-between items-center">
        <Input
          type="text"
          placeholder="Search testimonials..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
        <NavLink to="/create-testimonial">
          <Button className="cursor-pointer">
            Create <span className="hidden md:block">Testimonial</span>
            <Plus className="h-4 w-4" />
          </Button>
        </NavLink>
      </div>
      <TestimonialTable
        testimonials={data}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSort={handleSort}
        onView={handleView}
        onDelete={handleDelete}
      />
      <SharedPagination meta={meta} onPageChange={handlePageChange} />
    </div>
  );
};

export default Testimonials;
