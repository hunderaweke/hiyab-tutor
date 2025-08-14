import React from "react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
} from "@/components/ui/pagination";

interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
}

interface SharedPaginationProps {
  meta: PaginationMeta;
  onPageChange: (page: number) => void;
}

const SharedPagination: React.FC<SharedPaginationProps> = ({
  meta,
  onPageChange,
}) => {
  const totalPages = Math.max(1, Math.ceil(meta.total / meta.limit));
  const pageNumbers: number[] = [];
  const startPage = Math.max(1, meta.page - 2);
  const endPage = Math.min(totalPages, meta.page + 2);

  for (let i = startPage; i <= endPage; i++) {
    pageNumbers.push(i);
  }

  return (
    <Pagination className="mt-6">
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            href="#"
            onClick={(e) => {
              e.preventDefault();
              if (meta.page > 1) onPageChange(meta.page - 1);
            }}
            aria-disabled={meta.page <= 1}
          />
        </PaginationItem>
        {startPage > 1 && (
          <PaginationItem>
            <PaginationLink
              href="#"
              onClick={(e) => {
                e.preventDefault();
                onPageChange(1);
              }}
            >
              1
            </PaginationLink>
          </PaginationItem>
        )}
        {startPage > 2 && (
          <PaginationItem>
            <PaginationEllipsis />
          </PaginationItem>
        )}
        {pageNumbers.map((pageNum) => (
          <PaginationItem key={pageNum}>
            <PaginationLink
              href="#"
              isActive={meta.page === pageNum}
              onClick={(e) => {
                e.preventDefault();
                onPageChange(pageNum);
              }}
            >
              {pageNum}
            </PaginationLink>
          </PaginationItem>
        ))}
        {endPage < totalPages - 1 && (
          <PaginationItem>
            <PaginationEllipsis />
          </PaginationItem>
        )}
        {endPage < totalPages && (
          <PaginationItem>
            <PaginationLink
              href="#"
              onClick={(e) => {
                e.preventDefault();
                onPageChange(totalPages);
              }}
            >
              {totalPages}
            </PaginationLink>
          </PaginationItem>
        )}
        <PaginationItem>
          <PaginationNext
            href="#"
            onClick={(e) => {
              e.preventDefault();
              if (meta.page < totalPages) onPageChange(meta.page + 1);
            }}
            aria-disabled={meta.page >= totalPages}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
};

export default SharedPagination;
