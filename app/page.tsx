"use client"

import { useState, useRef, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { useTheme } from "next-themes"
import { Sun, Moon, Monitor, Copy, Check } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { ToolsSection } from "@/components/tools-section"
import { addFinancialValues } from "@/utils/financialMath"

export default function Calculator() {
  const [values, setValues] = useState({
    masterLearner: "",
    masterCare: "",
    budzet: "",
    integracje: "",
    inne: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [showDialog, setShowDialog] = useState(false)
  const [output, setOutput] = useState("")
  const [totalSum, setTotalSum] = useState(0)
  const [copied, setCopied] = useState(false)
  const [copiedSum, setCopiedSum] = useState(false)
  const [showTooltip, setShowTooltip] = useState(false)
  const [showSumTooltip, setShowSumTooltip] = useState(false)
  const { theme, setTheme } = useTheme()
  const outputRef = useRef<HTMLDivElement>(null)

  const handleInputChange = useCallback((field: string, value: string) => {
    setValues((prev) => ({ ...prev, [field]: value }))

    if (value === "") {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    } else {
      const numValue = Number(value)
      if (numValue < 0) {
        setErrors((prev) => ({ ...prev, [field]: "Value cannot be negative" }))
      } else if ((field === "masterLearner" && numValue > 6000) || (field === "masterCare" && numValue > 500)) {
        setErrors((prev) => ({ ...prev, [field]: `Value cannot exceed ${field === "masterLearner" ? 6000 : 500}` }))
      } else {
        setErrors((prev) => {
          const newErrors = { ...prev }
          delete newErrors[field]
          return newErrors
        })
      }
    }
  }, [])

  const handleCalculate = useCallback(() => {
    if (Object.keys(errors).length > 0) {
      return // Don't proceed if there are validation errors
    }

    const processedValues = Object.entries(values).reduce(
      (acc, [key, value]) => {
        acc[key] = value === "" ? "0" : value
        return acc
      },
      {} as Record<string, string>,
    )

    // Calculate sum only for non-empty fields
    const budzetValue = processedValues.budzet === "0" ? 0 : Number(processedValues.budzet)
    const integracjeValue = processedValues.integracje === "0" ? 0 : Number(processedValues.integracje)
    const inneValue = processedValues.inne === "0" ? 0 : Number(processedValues.inne)
    const mlValue = processedValues.masterLearner === "0" ? 0 : Number(processedValues.masterLearner)
    const mcValue = processedValues.masterCare === "0" ? 0 : Number(processedValues.masterCare)
    const toolsTotal = processedValues.narzedzia === "0" ? 0 : Number(processedValues.narzedzia)

    const razem = addFinancialValues(toolsTotal, budzetValue, integracjeValue, inneValue).toFixed(2)

    const result = `ML;${processedValues.masterLearner};MC;${processedValues.masterCare};REIM.RAZEM;${razem};narzędzia;${toolsTotal.toFixed(2)};budżet na dojazdy i noclegi;${processedValues.budzet};integracje;${processedValues.integracje};inne;${processedValues.inne}`
    setOutput(result)

    const sum = addFinancialValues(mlValue, mcValue, toolsTotal, budzetValue, integracjeValue, inneValue)
    setTotalSum(sum)

    setShowDialog(true)
  }, [errors, values])

  const handleCopy = useCallback(
    async (text: string, setCopiedState: (state: boolean) => void, setTooltipState: (state: boolean) => void) => {
      await navigator.clipboard.writeText(text)
      setCopiedState(true)
      setTooltipState(true)
      setTimeout(() => {
        setCopiedState(false)
        setTooltipState(false)
      }, 2000)
    },
    [],
  )

  const handleOutputClick = useCallback(() => {
    if (outputRef.current) {
      const range = document.createRange()
      range.selectNodeContents(outputRef.current)
      const selection = window.getSelection()
      if (selection) {
        selection.removeAllRanges()
        selection.addRange(range)
      }
    }
  }, [])

  const handleClear = useCallback(() => {
    setValues({
      masterLearner: "",
      masterCare: "",
      budzet: "",
      integracje: "",
      inne: "",
    })
    setErrors({}) // Clear all errors
  }, [])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      <Card className="w-full max-w-3xl">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="space-y-1">
            <CardTitle>Calculator</CardTitle>
            <CardDescription>Enter your reimbursements to calculate Invoice Heaven string.</CardDescription>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                {theme === "light" ? (
                  <Sun className="h-[1.2rem] w-[1.2rem]" />
                ) : theme === "dark" ? (
                  <Moon className="h-[1.2rem] w-[1.2rem]" />
                ) : (
                  <Monitor className="h-[1.2rem] w-[1.2rem]" />
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setTheme("light")}>
                <Sun className="mr-2 h-4 w-4" />
                Light
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("dark")}>
                <Moon className="mr-2 h-4 w-4" />
                Dark
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("system")}>
                <Monitor className="mr-2 h-4 w-4" />
                System
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="masterLearner">Master Learner</Label>
            <Input
              id="masterLearner"
              type="number"
              value={values.masterLearner}
              onChange={(e) => handleInputChange("masterLearner", e.target.value)}
              placeholder="0"
              className={errors.masterLearner ? "border-destructive" : ""}
            />
            {errors.masterLearner && <p className="text-sm text-destructive">{errors.masterLearner}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="masterCare">Master Care</Label>
            <Input
              id="masterCare"
              type="number"
              value={values.masterCare}
              onChange={(e) => handleInputChange("masterCare", e.target.value)}
              placeholder="0"
              className={errors.masterCare ? "border-destructive" : ""}
            />
            {errors.masterCare && <p className="text-sm text-destructive">{errors.masterCare}</p>}
          </div>

          <div className="space-y-2">
            <Label className="text-base font-medium">Narzędzia</Label>
            <ToolsSection onChange={(value) => handleInputChange("narzedzia", value)} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="budzet">Budżet na dojazdy i noclegi</Label>
            <Input
              id="budzet"
              type="number"
              value={values.budzet}
              onChange={(e) => handleInputChange("budzet", e.target.value)}
              placeholder="0"
              className={errors.budzet ? "border-destructive" : ""}
            />
            {errors.budzet && <p className="text-sm text-destructive">{errors.budzet}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="integracje">Integracje</Label>
            <Input
              id="integracje"
              type="number"
              value={values.integracje}
              onChange={(e) => handleInputChange("integracje", e.target.value)}
              placeholder="0"
              className={errors.integracje ? "border-destructive" : ""}
            />
            {errors.integracje && <p className="text-sm text-destructive">{errors.integracje}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="inne">Inne</Label>
            <Input
              id="inne"
              type="number"
              value={values.inne}
              onChange={(e) => handleInputChange("inne", e.target.value)}
              placeholder="0"
              className={errors.inne ? "border-destructive" : ""}
            />
            {errors.inne && <p className="text-sm text-destructive">{errors.inne}</p>}
          </div>

          <div className="flex justify-end gap-4 pt-4">
            <Button variant="outline" onClick={handleClear}>
              Clear
            </Button>
            <Button onClick={handleCalculate}>Calculate</Button>
          </div>
        </CardContent>
      </Card>
      <a
        href="https://forms.gle/wGpx3q8DCcsHWGou9"
        className="mt-4 text-sm text-muted-foreground hover:underline"
        rel="noopener noreferrer nofollow"
        target="_blank"
      >
        Leave feedback 📣
      </a>
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Generated Output</DialogTitle>
            <DialogDescription>Here&apos;s your Invoice Heaven string:</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-muted rounded-md p-3 gap-4">
              <div
                ref={outputRef}
                onClick={handleOutputClick}
                className="break-all font-mono text-sm cursor-text flex-grow"
              >
                {output}
              </div>
              <TooltipProvider>
                <Tooltip open={showTooltip}>
                  <TooltipTrigger asChild>
                    <Button
                      size="sm"
                      className="shadow-md transition-all hover:scale-105"
                      onClick={() => handleCopy(output, setCopied, setShowTooltip)}
                    >
                      {copied ? <Check className="h-4 w-4 mr-1" /> : <Copy className="h-4 w-4 mr-1" />}
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
            <div className="flex items-center justify-between bg-muted rounded-md p-3 gap-4">
              <div>
                <h4 className="font-semibold">Total Sum (PLN):</h4>
                <p className="text-2xl font-bold">{totalSum.toFixed(2)} zł</p>
              </div>
              <TooltipProvider>
                <Tooltip open={showSumTooltip}>
                  <TooltipTrigger asChild>
                    <Button
                      size="sm"
                      className="shadow-md transition-all hover:scale-105"
                      onClick={() => handleCopy(totalSum.toFixed(2), setCopiedSum, setShowSumTooltip)}
                    >
                      {copiedSum ? <Check className="h-4 w-4 mr-1" /> : <Copy className="h-4 w-4 mr-1" />}
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
    </div>
  )
}
