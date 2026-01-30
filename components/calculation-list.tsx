"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Calculation, CalculationStatus } from "@/types/calculation";
import { Button } from "@/components/ui/button";
import { Copy, Edit, Trash2, Check, ChevronDown } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatMonth } from "@/utils/periods";
import { formatCurrency } from "@/utils/currency";
import { CalculationService } from "@/lib/db";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface CalculationListProps {
  calculations: Calculation[];
  onUpdate: () => void;
}

export function CalculationList({
  calculations,
  onUpdate,
}: CalculationListProps) {
  const router = useRouter();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [calculationToDelete, setCalculationToDelete] =
    useState<Calculation | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = async (calculation: Calculation) => {
    try {
      await navigator.clipboard.writeText(calculation.invoiceHeavenString);
      setCopiedId(calculation.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  const handleEdit = (calculation: Calculation) => {
    router.push(`/edit/${calculation.id}`);
  };

  const handleDeleteClick = (calculation: Calculation) => {
    setCalculationToDelete(calculation);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!calculationToDelete) return;

    setDeleting(true);
    try {
      await CalculationService.delete(calculationToDelete.id);
      onUpdate();
      setDeleteDialogOpen(false);
      setCalculationToDelete(null);
    } catch (error) {
      console.error("Failed to delete calculation:", error);
      alert("Failed to delete calculation. Please try again.");
    } finally {
      setDeleting(false);
    }
  };

  const handleStatusChange = async (
    calculationId: string,
    newStatus: CalculationStatus,
  ) => {
    try {
      await CalculationService.update(calculationId, { status: newStatus });
      onUpdate();
    } catch (error) {
      console.error("Failed to update status:", error);
      alert("Failed to update status. Please try again.");
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "saved":
        return "bg-muted text-muted-foreground";
      case "submitted":
        return "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200";
      case "declined":
        return "bg-destructive-bg text-destructive-text";
      case "approved":
        return "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getStatusLabel = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Month</TableHead>
              <TableHead className="text-right">ML</TableHead>
              <TableHead className="text-right">MC</TableHead>
              <TableHead className="text-right">Tools</TableHead>
              <TableHead className="text-right">Team building</TableHead>
              <TableHead className="text-right">Other</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead className="text-center">Status</TableHead>
              <TableHead className="text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {calculations.map((calc) => (
              <TableRow key={calc.id}>
                <TableCell>{formatMonth(calc.month)}</TableCell>
                <TableCell className="text-right tabular-nums">
                  {calc.masterLearner > 0
                    ? formatCurrency(calc.masterLearner, true)
                    : "-"}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {calc.masterCare > 0
                    ? formatCurrency(calc.masterCare, true)
                    : "-"}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {calc.toolsTotal > 0
                    ? formatCurrency(calc.toolsTotal, true)
                    : "-"}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {calc.integracje > 0
                    ? formatCurrency(calc.integracje, true)
                    : "-"}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {calc.inne > 0 ? formatCurrency(calc.inne, true) : "-"}
                </TableCell>
                <TableCell className="text-right tabular-nums font-semibold">
                  {isNaN(calc.totalSum) || calc.totalSum === undefined
                    ? "-"
                    : formatCurrency(calc.totalSum)}
                </TableCell>
                <TableCell className="text-center">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className={`h-7 rounded-full text-xs px-3 ${getStatusBadgeClass(
                          calc.status,
                        )}`}
                      >
                        {getStatusLabel(calc.status)}
                        <ChevronDown className="ml-1 h-3 w-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="center">
                      <DropdownMenuItem
                        onClick={() => handleStatusChange(calc.id, "saved")}
                      >
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${getStatusBadgeClass(
                            "saved",
                          )}`}
                        >
                          Saved
                        </span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleStatusChange(calc.id, "submitted")}
                      >
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${getStatusBadgeClass(
                            "submitted",
                          )}`}
                        >
                          Submitted
                        </span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleStatusChange(calc.id, "declined")}
                      >
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${getStatusBadgeClass(
                            "declined",
                          )}`}
                        >
                          Declined
                        </span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleStatusChange(calc.id, "approved")}
                      >
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${getStatusBadgeClass(
                            "approved",
                          )}`}
                        >
                          Approved
                        </span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleCopy(calc)}
                      title="Copy InvoiceHeaven string"
                    >
                      {copiedId === calc.id ? (
                        <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleEdit(calc)}
                      title="Edit calculation"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => handleDeleteClick(calc)}
                      title="Delete calculation"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Calculation?</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the calculation for{" "}
              {calculationToDelete && formatMonth(calculationToDelete.month)}?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={deleting}
            >
              {deleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
