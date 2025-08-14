import React, { useEffect, useState } from "react";
import axios from "axios";
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
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
} from "@/components/ui/select";
import { useNavigate } from "react-router-dom";

interface OtherServiceTranslation {
  language_code: string;
  name: string;
  description: string;
  tag_line: string;
}
interface OtherService {
  id: number;
  website_url: string;
  image: string;
  languages: OtherServiceTranslation[];
}

interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
}

const OtherServices: React.FC = () => {
  const [services, setServices] = useState<OtherService[]>([]);
  const [meta, setMeta] = useState<PaginationMeta>({
    page: 1,
    limit: 10,
    total: 0,
  });
  const [search, setSearch] = useState("");
  const [language, setLanguage] = useState("en");
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const fetchServices = async (
    page = 1,
    searchValue = "",
    lang = "en",
    sort = "name",
    order: "asc" | "desc" = "asc"
  ) => {
    try {
      const resp = await axios.get(
        `/api/other-services/?search=${encodeURIComponent(
          searchValue
        )}&page=${page}&limit=${
          meta.limit
        }&language_codes=${lang}&sort_by=${sort}&sort_order=${order}`
      );
      setServices(resp.data.data || []);
      if (resp.data.meta) setMeta(resp.data.meta);
      setError(null);
    } catch {
      setError("Failed to fetch services");
    }
  };
  const handleDelete = async (id: number) => {
    const token = localStorage.getItem("auth");
    const resp = await axios.delete(`/api/other-services/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (resp.status === 200) {
      fetchServices();
    }
  };
  useEffect(() => {
    fetchServices(meta.page, search, language, sortBy, sortOrder);
    // eslint-disable-next-line
  }, [meta.page, search, language, sortBy, sortOrder]);

  const handleCreate = () => {
    navigate("/create-other-service");
  };

  return (
    <div className="space-y-4 p-10">
      <div className="flex gap-2 justify-between items-center">
        <Input
          type="text"
          placeholder="Search other services..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
        <Select value={language} onValueChange={setLanguage}>
          <SelectTrigger>
            <SelectValue placeholder="Language" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Languages</SelectLabel>
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="am">Amharic</SelectItem>
              <SelectItem value="om">Oromo</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
        <Button onClick={handleCreate}>Create Other Service</Button>
      </div>
      {error && <div className="text-red-500 mb-2">{error}</div>}
      <Table className="mb-4">
        <TableHeader>
          <TableRow className="bg-gray-100">
            <TableHead>Image</TableHead>
            <TableHead>Website</TableHead>
            <TableHead
              className="cursor-pointer select-none"
              onClick={() => {
                setSortBy("name");
                setSortOrder((prev) =>
                  sortBy === "name" && prev === "asc" ? "desc" : "asc"
                );
              }}
            >
              Name ({language.toUpperCase()})
              {sortBy === "name" && (sortOrder === "asc" ? " ▲" : " ▼")}
            </TableHead>
            <TableHead
              className="cursor-pointer select-none"
              onClick={() => {
                setSortBy("description");
                setSortOrder((prev) =>
                  sortBy === "description" && prev === "asc" ? "desc" : "asc"
                );
              }}
            >
              Description ({language.toUpperCase()})
              {sortBy === "description" && (sortOrder === "asc" ? " ▲" : " ▼")}
            </TableHead>
            <TableHead
              className="cursor-pointer select-none"
              onClick={() => {
                setSortBy("tag_line");
                setSortOrder((prev) =>
                  sortBy === "tag_line" && prev === "asc" ? "desc" : "asc"
                );
              }}
            >
              Tag Line ({language.toUpperCase()})
              {sortBy === "tag_line" && (sortOrder === "asc" ? " ▲" : " ▼")}
            </TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {services.map((service) => {
            const translation =
              service.languages?.find((l) => l.language_code === language) ||
              service.languages?.[0];
            return (
              <TableRow key={service.id}>
                <TableCell>
                  {service.image ? (
                    <img
                      src={`/api/${service.image}`}
                      alt="Service"
                      className="w-16 h-16 object-cover rounded"
                    />
                  ) : (
                    <span className="text-gray-400">No Image</span>
                  )}
                </TableCell>
                <TableCell>
                  {service.website_url ? (
                    <a
                      href={service.website_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline"
                    >
                      {service.website_url}
                    </a>
                  ) : (
                    <span className="text-gray-400">N/A</span>
                  )}
                </TableCell>
                <TableCell>{translation?.name || "-"}</TableCell>
                <TableCell>{translation?.description || "-"}</TableCell>
                <TableCell>{translation?.tag_line || "-"}</TableCell>
                <TableCell>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mr-2"
                    onClick={() => navigate(`/other-services/${service.id}`)}
                  >
                    View
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(service.id)}
                  >
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      <SharedPagination
        meta={meta}
        onPageChange={(page) => setMeta((m) => ({ ...m, page }))}
      />
    </div>
  );
};

export default OtherServices;
