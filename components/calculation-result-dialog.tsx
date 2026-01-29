"use client";

import { useState, useCallback, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { formatCurrency, formatAmount } from "@/utils/currency";

interface CalculationResultDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoiceString: string;
  totalSum: number;
}

export function CalculationResultDialog({
  open,
  onOpenChange,
  invoiceString,
  totalSum,
}: CalculationResultDialogProps) {
  const [copied, setCopied] = useState(false);
  const [copiedSum, setCopiedSum] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [showSumTooltip, setShowSumTooltip] = useState(false);
  const outputRef = useRef<HTMLDivElement>(null);

  const handleCopy = useCallback(
    async (
      text: string,
      setCopiedState: (state: boolean) => void,
      setTooltipState: (state: boolean) => void
    ) => {
      await navigator.clipboard.writeText(text);
      setCopiedState(true);
      setTooltipState(true);
      setTimeout(() => {
        setCopiedState(false);
        setTooltipState(false);
      }, 2000);
    },
    []
  );

  const handleOutputClick = useCallback(() => {
    if (outputRef.current) {
      const range = document.createRange();
      range.selectNodeContents(outputRef.current);
      const selection = window.getSelection();
      if (selection) {
        selection.removeAllRanges();
        selection.addRange(range);
      }
    }
  }, []);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Generated Output</DialogTitle>
          <DialogDescription>
            Here&apos;s your Invoice Heaven string:
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {/* Invoice String */}
          <div className="flex items-center justify-between bg-muted rounded-md p-3 gap-4">
            <div
              ref={outputRef}
              onClick={handleOutputClick}
              className="break-all font-mono text-sm cursor-text grow"
            >
              {invoiceString}
            </div>
            <TooltipProvider>
              <Tooltip open={showTooltip}>
                <TooltipTrigger asChild>
                  <Button
                    size="sm"
                    className="shadow-md transition-all hover:scale-105"
                    onClick={() =>
                      handleCopy(invoiceString, setCopied, setShowTooltip)
                    }
                  >
                    {copied ? (
                      <Check className="h-4 w-4 mr-1" />
                    ) : (
                      <Copy className="h-4 w-4 mr-1" />
                    )}
                    {copied ? "Copied" : "Copy"}
                  </Button>
                </TooltipTrigger>
                <TooltipContent
                  side="top"
                  className="animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=top]:slide-in-from-bottom-2 tooltip-pop"
                >
                  <p>Copied to clipboard!</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          {/* Total Sum */}
          <div className="flex items-center justify-between bg-muted rounded-md p-3 gap-4">
            <div>
              <h4 className="font-semibold">Total Sum (PLN):</h4>
              <p className="text-2xl font-bold tabular-nums">
                {formatCurrency(totalSum)}
              </p>
            </div>
            <TooltipProvider>
              <Tooltip open={showSumTooltip}>
                <TooltipTrigger asChild>
                  <Button
                    size="sm"
                    className="shadow-md transition-all hover:scale-105"
                    onClick={() =>
                      handleCopy(
                        formatAmount(totalSum),
                        setCopiedSum,
                        setShowSumTooltip
                      )
                    }
                  >
                    {copiedSum ? (
                      <Check className="h-4 w-4 mr-1" />
                    ) : (
                      <Copy className="h-4 w-4 mr-1" />
                    )}
                    {copiedSum ? "Copied" : "Copy"}
                  </Button>
                </TooltipTrigger>
                <TooltipContent
                  side="top"
                  className="animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=top]:slide-in-from-bottom-2 tooltip-pop"
                >
                  <p>Copied to clipboard!</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
