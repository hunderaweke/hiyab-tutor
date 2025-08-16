import axios from "axios";
import { Eye, Plus, Trash } from "lucide-react";
import { useEffect, useState } from "react";
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
} from "./ui/table";
import SharedPagination from "./SharedPagination";
interface Partners {
  id: number;
  website_url: string;
  image_url: string;
  name: string;
}
const Partners = () => {
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");
  const [partners, setPartners] = useState<Partners[]>([]);
  const [search, setSearch] = useState("");
  const [meta, setMeta] = useState({ page: 1, limit: 10, total: 0 });

  const fetchPartners = async (page = 1) => {
    const params = new URLSearchParams();
    if (search) params.append("search", search);
    params.append("page", String(page));
    params.append("limit", String(meta.limit));
    params.append("sort_by", sortBy);
    params.append("sort_order", sortOrder);
    const response = await axios.get(`/api/partners/`, {
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
  const onClick = () => {
    navigate("/create-partner");
  };
  useEffect(() => {
    fetchPartners(meta.page);
    // eslint-disable-next-line
  }, [sortBy, sortOrder, meta.page, search]);
  const onSort = (field: "name" | "role" | "created_at") => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };
  const onView = (id: number) => {
    navigate(`/partners/${id}`);
  };
  const onDelete = async (id: number) => {
    const token = localStorage.getItem("auth");
    await axios
      .delete(`/api/partners/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(() => {
        fetchPartners();
      });
  };
  return (
    <main className=" px-2 py-10">
      <div className="w-full flex flex-col md:flex-row justify-between gap-5">
        <Input
          placeholder="Search Partners..."
          className="w-full md:w-2/5"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setMeta((m) => ({ ...m, page: 1 }));
          }}
        />
        <div className="flex justify-end mt-2 md:mt-0">
          <Button onClick={onClick}>
            <Plus />
            Add Partner
          </Button>
        </div>
      </div>
      <div className="overflow-x-auto mt-4">
        <Table>
          <TableCaption>Testimonials List</TableCaption>
          <TableHeader>
            <TableRow className="md:text-lg">
              <TableHead
                className="cursor-pointer select-none"
                onClick={() => onSort("name")}
              >
                Name{" "}
                {sortBy === "name" ? (sortOrder === "asc" ? "▲" : "▼") : null}
              </TableHead>
              <TableHead>Website URL</TableHead>
              <TableHead
                className="cursor-pointer select-none"
                onClick={() => onSort("created_at")}
              >
                Image (Logo)
                {sortBy === "created_at"
                  ? sortOrder === "asc"
                    ? "▲"
                    : "▼"
                  : null}
              </TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {partners.length ? (
              partners.map((t) => (
                <TableRow
                  className="h-16 hover:bg-muted/30 cursor-pointer"
                  key={t.id}
                >
                  <TableCell>{t.name}</TableCell>
                  <TableCell>
                    {" "}
                    {t.website_url ? (
                      <a
                        href={`https://${t.website_url}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 underline"
                      >
                        {t.website_url}
                      </a>
                    ) : (
                      <span className="text-gray-400">N/A</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {t.image_url ? (
                      <img
                        src={`/api/${t.image_url}`}
                        alt="thumbnail"
                        className="h-16 object-cover"
                      />
                    ) : (
                      "-"
                    )}
                  </TableCell>
                  <TableCell className="flex gap-3">
                    <Button onClick={() => onView(t.id)}>
                      <Eye className="h-4 w-4" /> View
                    </Button>
                    <CustomAlertDialog
                      trigger={
                        <Button variant="destructive">
                          <Trash className="h-4 w-4" /> Delete
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
                <TableCell colSpan={6} className="text-center">
                  No partners found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <SharedPagination
        meta={meta}
        onPageChange={(page) => setMeta((m) => ({ ...m, page }))}
      />
    </main>
  );
};

export default Partners;
