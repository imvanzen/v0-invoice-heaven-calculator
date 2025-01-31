"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { useTheme } from "next-themes"
import { Sun, Moon, Monitor, Copy, Check } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export default function Calculator() {
  const [values, setValues] = useState({
    masterLearner: "",
    masterHealth: "",
    narzedzia: "",
    budzet: "",
    inne: "",
  })
  const [showDialog, setShowDialog] = useState(false)
  const [output, setOutput] = useState("")
  const [copied, setCopied] = useState(false)
  const { theme, setTheme } = useTheme()

  const handleInputChange = (field: string, value: string) => {
    setValues((prev) => ({ ...prev, [field]: value }))
  }

  const handleCalculate = () => {
    const processedValues = Object.entries(values).reduce(
      (acc, [key, value]) => {
        acc[key] = value === "" ? "0" : value
        return acc
      },
      {} as Record<string, string>,
    )

    const result = `ML;${processedValues.masterLearner};MH;${processedValues.masterHealth};REIM.RAZEM;${processedValues.budzet};narzędzia;${processedValues.narzedzia};budżet na dojazdy i noclegi;${processedValues.budzet};inne;${processedValues.inne}`
    setOutput(result)
    setShowDialog(true)
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(output)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen p-4 bg-background">
      <Card className="max-w-xl mx-auto">
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
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="masterHealth">Master Health</Label>
            <Input
              id="masterHealth"
              type="number"
              value={values.masterHealth}
              onChange={(e) => handleInputChange("masterHealth", e.target.value)}
              placeholder="0"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="narzedzia">Narzędzia</Label>
            <Input
              id="narzedzia"
              type="number"
              value={values.narzedzia}
              onChange={(e) => handleInputChange("narzedzia", e.target.value)}
              placeholder="0"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="budzet">Budżet na dojazdy i noclegi</Label>
            <Input
              id="budzet"
              type="number"
              value={values.budzet}
              onChange={(e) => handleInputChange("budzet", e.target.value)}
              placeholder="0"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="inne">Inne</Label>
            <Input
              id="inne"
              type="number"
              value={values.inne}
              onChange={(e) => handleInputChange("inne", e.target.value)}
              placeholder="0"
            />
          </div>

          <div className="flex justify-end gap-4 pt-4">
            <Button
              variant="outline"
              onClick={() =>
                setValues({
                  masterLearner: "",
                  masterHealth: "",
                  narzedzia: "",
                  budzet: "",
                  inne: "",
                })
              }
            >
              Clear
            </Button>
            <Button onClick={handleCalculate}>Calculate</Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Generated Output</DialogTitle>
            <DialogDescription>Here&apos;s your Invoice Heaven string:</DialogDescription>
          </DialogHeader>
          <div className="relative">
            <div className="mt-2 p-3 bg-muted rounded-md break-all">{output}</div>
            <Button size="icon" variant="ghost" className="absolute top-2 right-2" onClick={handleCopy}>
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

