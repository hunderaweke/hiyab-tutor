import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Eye, Trash } from "lucide-react";
import CustomAlertDialog from "./CustomAlertDialog";

export interface Testimonial {
  id: number;
  name: string;
  role: string;
  created_at: string;
  video?: string;
  thumbnail?: string;
}

interface TestimonialTableProps {
  testimonials: Testimonial[];
  sortBy: string;
  sortOrder: string;
  onSort: (field: "name" | "role" | "created_at") => void;
  onView: (id: number) => void;
  onDelete: (id: number) => void;
}

export const TestimonialTable: React.FC<TestimonialTableProps> = ({
  testimonials,
  sortBy,
  sortOrder,
  onSort,
  onView,
  onDelete,
}) => (
  <Table>
    <TableCaption>Testimonials List</TableCaption>
    <TableHeader>
      <TableRow className="bg-white/10 hover:bg-white/15 border-b border-white/10 md:text-lg">
        <TableHead
          className="cursor-pointer select-none text-white font-semibold"
          onClick={() => onSort("name")}
        >
          Name {sortBy === "name" ? (sortOrder === "asc" ? "▲" : "▼") : null}
        </TableHead>
        <TableHead
          className="cursor-pointer select-none text-white font-semibold"
          onClick={() => onSort("role")}
        >
          Role {sortBy === "role" ? (sortOrder === "asc" ? "▲" : "▼") : null}
        </TableHead>
        <TableHead
          className="cursor-pointer select-none text-white font-semibold"
          onClick={() => onSort("created_at")}
        >
          Created{" "}
          {sortBy === "created_at" ? (sortOrder === "asc" ? "▲" : "▼") : null}
        </TableHead>
        <TableHead className="text-white font-semibold">Thumbnail</TableHead>
        <TableHead className="text-white font-semibold">Actions</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {testimonials.length ? (
        testimonials.map((t) => (
          <TableRow
            className="hover:bg-white/5 border-b border-white/5"
            key={t.id}
          >
            <TableCell className="text-white">{t.name}</TableCell>
            <TableCell className="text-white">{t.role}</TableCell>
            <TableCell className="text-white text-sm">
              {new Date(t.created_at).toLocaleString()}
            </TableCell>
            <TableCell>
              {t.thumbnail ? (
                <img
                  src={`/api/${t.thumbnail}`}
                  alt="thumbnail"
                  className="h-12 w-24 object-cover rounded-md border border-white/20"
                />
              ) : (
                <div className="h-12 w-24 bg-white/10 text-white/60 flex items-center justify-center rounded-md">
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
            No testimonials found.
          </TableCell>
        </TableRow>
      )}
    </TableBody>
  </Table>
);
