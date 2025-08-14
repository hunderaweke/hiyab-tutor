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
      <TableRow className="md:text-lg">
        <TableHead
          className="cursor-pointer select-none"
          onClick={() => onSort("name")}
        >
          Name {sortBy === "name" ? (sortOrder === "asc" ? "▲" : "▼") : null}
        </TableHead>
        <TableHead
          className="cursor-pointer select-none"
          onClick={() => onSort("role")}
        >
          Role {sortBy === "role" ? (sortOrder === "asc" ? "▲" : "▼") : null}
        </TableHead>
        <TableHead
          className="cursor-pointer select-none"
          onClick={() => onSort("created_at")}
        >
          Created{" "}
          {sortBy === "created_at" ? (sortOrder === "asc" ? "▲" : "▼") : null}
        </TableHead>
        <TableHead>Thumbnail</TableHead>
        <TableHead>Actions</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {testimonials.length ? (
        testimonials.map((t) => (
          <TableRow
            className="h-16 hover:bg-muted/30 cursor-pointer"
            key={t.id}
          >
            <TableCell>{t.name}</TableCell>
            <TableCell>{t.role}</TableCell>
            <TableCell>{new Date(t.created_at).toLocaleString()}</TableCell>
            <TableCell>
              {t.thumbnail ? (
                <img
                  src={`/api/${t.thumbnail}`}
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
            No testimonials found.
          </TableCell>
        </TableRow>
      )}
    </TableBody>
  </Table>
);
