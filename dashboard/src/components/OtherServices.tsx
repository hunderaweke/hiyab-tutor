import React, { useEffect, useState } from "react";
import { HttpStatusCode } from "axios";
import api from "@/lib/api";
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
      const params = new URLSearchParams();
      if (searchValue) params.append("search", searchValue);
      params.append("page", String(page));
      params.append("limit", String(meta.limit));
      params.append("language_codes", lang);
      params.append("sort_by", sort);
      params.append("sort_order", order);

      const resp = await api.get(`/other-services/`, {
        params: Object.fromEntries(params.entries()),
      });
      if (resp.data) {
        if (Array.isArray(resp.data.data)) setServices(resp.data.data);
        else if (Array.isArray(resp.data)) setServices(resp.data);
        if (resp.data.pagination) setMeta(resp.data.pagination);
      }
      setError(null);
    } catch {
      setError("Failed to fetch services");
    }
  };
  const handleDelete = async (id: number) => {
    const resp = await api.delete(`/other-services/${id}`);
    if (resp.status === HttpStatusCode.NoContent) {
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
      <div className="flex flex-col md:flex-row gap-2 justify-between items-center">
        <div className="flex gap-2 flex-wrap items-center w-full md:w-auto">
          <Input
            type="text"
            placeholder="Search other services..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setMeta((m) => ({ ...m, page: 1 }));
            }}
            className="max-w-sm"
          />
          <Select
            value={language}
            onValueChange={(v) => {
              setLanguage(v);
              setMeta((m) => ({ ...m, page: 1 }));
            }}
          >
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
      </div>
      {error && <div className="text-red-500 mb-2">{error}</div>}
      <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <Table className="mb-4 min-w-[900px]">
            <TableHeader>
              <TableRow className="bg-white/10 hover:bg-white/15 border-b border-white/10 md:text-lg">
                <TableHead className="text-white font-semibold">
                  Image
                </TableHead>
                <TableHead className="text-white font-semibold">
                  Website
                </TableHead>
                <TableHead
                  className="cursor-pointer select-none text-white font-semibold"
                  onClick={() => {
                    setSortBy("name");
                    setSortOrder((prev) =>
                      sortBy === "name" && prev === "asc" ? "desc" : "asc"
                    );
                  }}
                >
                  Name ({language.toUpperCase()}){" "}
                  {sortBy === "name" && (sortOrder === "asc" ? " ▲" : " ▼")}
                </TableHead>
                <TableHead
                  className="cursor-pointer select-none text-white font-semibold"
                  onClick={() => {
                    setSortBy("description");
                    setSortOrder((prev) =>
                      sortBy === "description" && prev === "asc"
                        ? "desc"
                        : "asc"
                    );
                  }}
                >
                  Description ({language.toUpperCase()}){" "}
                  {sortBy === "description" &&
                    (sortOrder === "asc" ? " ▲" : " ▼")}
                </TableHead>
                <TableHead
                  className="cursor-pointer select-none text-white font-semibold"
                  onClick={() => {
                    setSortBy("tag_line");
                    setSortOrder((prev) =>
                      sortBy === "tag_line" && prev === "asc" ? "desc" : "asc"
                    );
                  }}
                >
                  Tag Line ({language.toUpperCase()}){" "}
                  {sortBy === "tag_line" && (sortOrder === "asc" ? " ▲" : " ▼")}
                </TableHead>
                <TableHead className="text-white font-semibold">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {services.map((service) => {
                const translation =
                  service.languages?.find(
                    (l) => l.language_code === language
                  ) || service.languages?.[0];
                return (
                  <TableRow
                    key={service.id}
                    className="hover:bg-white/5 border-b border-white/5"
                  >
                    <TableCell>
                      {service.image ? (
                        <img
                          src={`/api/${service.image}`}
                          alt="Service"
                          className="w-16 h-16 object-cover rounded-md border border-white/20"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-white/10 text-white/60 flex items-center justify-center rounded-md">
                          No Image
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {service.website_url ? (
                        <a
                          href={service.website_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[var(--color-brand-green)] underline"
                        >
                          {service.website_url}
                        </a>
                      ) : (
                        <span className="text-white/60">N/A</span>
                      )}
                    </TableCell>
                    <TableCell className="text-white">
                      {translation?.name || "-"}
                    </TableCell>
                    <TableCell className="text-white">
                      {translation?.description || "-"}
                    </TableCell>
                    <TableCell className="text-white">
                      {translation?.tag_line || "-"}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mr-2 bg-white/10 border-white/20 text-white hover:bg-white/20"
                        onClick={() =>
                          navigate(`/other-services/${service.id}`)
                        }
                      >
                        View
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(service.id)}
                        className="bg-red-500/20 border-red-500/30 text-red-300 hover:bg-red-500/30"
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
      </div>
      <SharedPagination
        meta={meta}
        onPageChange={(page) => setMeta((m) => ({ ...m, page }))}
      />
    </div>
  );
};

export default OtherServices;
