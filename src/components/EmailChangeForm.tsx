import { useState } from "react"
import { useAuth } from "@/context/AuthContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Mail } from "lucide-react"

export function EmailChangeForm() {
  const { user, updateUser } = useAuth()
  const { toast } = useToast()
  const [newEmail, setNewEmail] = useState("")
  const [confirmationCode, setConfirmationCode] = useState("")
  const [step, setStep] = useState<"input" | "confirm">("input")
  const [loading, setLoading] = useState(false)

  const sendConfirmation = async () => {
    if (!user || !newEmail) return

    setLoading(true)
    try {
      const response = await fetch(`http://localhost:3001/api/users/${user.id}/request-email-change`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newEmail })
      })

      const data = await response.json()

      if (response.ok) {
        setStep("confirm")
        toast({
          title: "Confirmation sent",
          description: `A confirmation code has been sent to ${newEmail}`
        })
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to send confirmation",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error sending confirmation:', error)
      toast({
        title: "Error",
        description: "Failed to send confirmation. Please try again.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const confirmEmailChange = async () => {
    if (!user || !confirmationCode) return

    setLoading(true)
    try {
      const response = await fetch(`http://localhost:3001/api/users/${user.id}/confirm-email-change`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirmationCode })
      })

      const data = await response.json()

      if (response.ok) {
        updateUser(data.user)
        setStep("input")
        setNewEmail("")
        setConfirmationCode("")
        toast({
          title: "Email updated",
          description: "Your email address has been successfully changed."
        })
      } else {
        toast({
          title: "Error",
          description: data.message || "Invalid confirmation code",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error confirming email change:', error)
      toast({
        title: "Error",
        description: "Failed to confirm email change. Please try again.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setStep("input")
    setNewEmail("")
    setConfirmationCode("")
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Change Email Address
        </CardTitle>
        <CardDescription>
          {user?.email ? `Current email: ${user.email}` : "No email address set"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {step === "input" ? (
          <>
            <div className="space-y-2">
              <Label htmlFor="new-email">New Email Address</Label>
              <Input
                id="new-email"
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="Enter new email address"
              />
            </div>
            <Button 
              onClick={sendConfirmation}
              disabled={!newEmail || loading}
              className="w-full"
            >
              {loading ? "Sending..." : "Send Confirmation"}
            </Button>
            {user?.email && (
              <p className="text-sm text-muted-foreground">
                A confirmation code will be sent to your new email address to verify the change.
              </p>
            )}
          </>
        ) : (
          <>
            <div className="space-y-2">
              <Label htmlFor="confirmation-code">Confirmation Code</Label>
              <Input
                id="confirmation-code"
                value={confirmationCode}
                onChange={(e) => setConfirmationCode(e.target.value)}
                placeholder="Enter confirmation code"
              />
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={confirmEmailChange}
                disabled={!confirmationCode || loading}
                className="flex-1"
              >
                {loading ? "Confirming..." : "Confirm Change"}
              </Button>
              <Button variant="outline" onClick={resetForm}>
                Cancel
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Check your email ({newEmail}) for the confirmation code.
            </p>
          </>
        )}
      </CardContent>
    </Card>
  )
}