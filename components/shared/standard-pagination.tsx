import {
  ChevronFirstIcon,
  ChevronLastIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "lucide-react";

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
} from "@/components/ui/pagination";
import { usePagination } from "@/hooks/use-pagination";

type PaginationProps = {
  currentPage: number;
  totalPages: number;
  paginationItemsToDisplay?: number;
  onPageChange?: (page: number) => void;
};

export default function StandardPagination({
  currentPage,
  totalPages,
  paginationItemsToDisplay = 5,
  onPageChange,
}: PaginationProps) {
  const { pages, showLeftEllipsis, showRightEllipsis } = usePagination({
    currentPage,
    totalPages,
    paginationItemsToDisplay,
  });

  const handleLinkClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    page: number
  ) => {
    if (onPageChange) {
      e.preventDefault();
      onPageChange(page);
    }
  };

  const createHref = (page: number) => (onPageChange ? "#" : `#/page/${page}`);

  return (
    <Pagination>
      <PaginationContent>
        {/* First page button */}
        <PaginationItem>
          <PaginationLink
            className="aria-disabled:pointer-events-none aria-disabled:opacity-50"
            href={currentPage === 1 ? undefined : createHref(1)}
            onClick={
              currentPage === 1 ? undefined : (e) => handleLinkClick(e, 1)
            }
            aria-label="Go to first page"
            aria-disabled={currentPage === 1}
            role={currentPage === 1 ? undefined : "link"}
          >
            <ChevronFirstIcon size={16} aria-hidden="true" />
          </PaginationLink>
        </PaginationItem>

        {/* Previous page button */}
        <PaginationItem>
          <PaginationLink
            className="aria-disabled:pointer-events-none aria-disabled:opacity-50"
            href={currentPage === 1 ? undefined : createHref(currentPage - 1)}
            onClick={
              currentPage === 1
                ? undefined
                : (e) => handleLinkClick(e, currentPage - 1)
            }
            aria-label="Go to previous page"
            aria-disabled={currentPage === 1}
            role={currentPage === 1 ? undefined : "link"}
          >
            <ChevronLeftIcon size={16} aria-hidden="true" />
          </PaginationLink>
        </PaginationItem>

        {/* Left ellipsis (...) */}
        {showLeftEllipsis && (
          <PaginationItem>
            <PaginationEllipsis />
          </PaginationItem>
        )}

        {/* Page number links */}
        {pages.map((page) => (
          <PaginationItem key={page}>
            <PaginationLink
              href={createHref(page)}
              onClick={(e) => handleLinkClick(e, page)}
              isActive={page === currentPage}
              aria-current={page === currentPage ? "page" : undefined}
            >
              {page}
            </PaginationLink>
          </PaginationItem>
        ))}

        {/* Right ellipsis (...) */}
        {showRightEllipsis && (
          <PaginationItem>
            <PaginationEllipsis />
          </PaginationItem>
        )}

        {/* Next page button */}
        <PaginationItem>
          <PaginationLink
            className="aria-disabled:pointer-events-none aria-disabled:opacity-50"
            href={
              currentPage === totalPages
                ? undefined
                : createHref(currentPage + 1)
            }
            onClick={
              currentPage === totalPages
                ? undefined
                : (e) => handleLinkClick(e, currentPage + 1)
            }
            aria-label="Go to next page"
            aria-disabled={currentPage === totalPages}
            role={currentPage === totalPages ? undefined : "link"}
          >
            <ChevronRightIcon size={16} aria-hidden="true" />
          </PaginationLink>
        </PaginationItem>

        {/* Last page button */}
        <PaginationItem>
          <PaginationLink
            className="aria-disabled:pointer-events-none aria-disabled:opacity-50"
            href={
              currentPage === totalPages ? undefined : createHref(totalPages)
            }
            onClick={
              currentPage === totalPages
                ? undefined
                : (e) => handleLinkClick(e, totalPages)
            }
            aria-label="Go to last page"
            aria-disabled={currentPage === totalPages}
            role={currentPage === totalPages ? undefined : "link"}
          >
            <ChevronLastIcon size={16} aria-hidden="true" />
          </PaginationLink>
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
