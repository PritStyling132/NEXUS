"use client"

import { useState, useEffect } from "react"
import { toast } from "sonner"
import {
    Loader2,
    CheckCircle,
    XCircle,
    Clock,
    LogOut,
    User,
    Phone,
    Mail,
    Eye,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"

import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/global/theme-toggle"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"

interface Application {
    id: string
    firstname: string
    lastname: string
    email: string
    phone: string
    cvUrl: string
    cvFileName: string | null
    status: string
    createdAt: string
    reviewedAt: string | null
    rejectionReason: string | null
}

interface Counts {
    pending: number
    approved: number
    rejected: number
    completed: number
}

export default function AdminApplicationsPage() {
    const [applications, setApplications] = useState<Application[]>([])
    const [counts, setCounts] = useState<Counts>({
        pending: 0,
        approved: 0,
        rejected: 0,
        completed: 0,
    })
    const [isLoading, setIsLoading] = useState(true)
    const [activeTab, setActiveTab] = useState("PENDING")
    const [selectedApp, setSelectedApp] = useState<Application | null>(null)
    const [rejectReason, setRejectReason] = useState("")
    const [showRejectDialog, setShowRejectDialog] = useState(false)
    const [isProcessing, setIsProcessing] = useState(false)
    const router = useRouter()

    const fetchApplications = async (status: string) => {
        try {
            const response = await fetch(
                `/api/admin/applications?status=${status}`,
            )

            if (response.status === 401) {
                router.push("/admin/login")
                return
            }

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error)
            }

            setApplications(data.applications)
            setCounts(data.counts)
        } catch (error: any) {
            toast.error(error.message || "Failed to fetch applications")
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchApplications(activeTab)
    }, [activeTab])

    const handleApprove = async (application: Application) => {
        setIsProcessing(true)
        try {
            const response = await fetch("/api/admin/approve", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ applicationId: application.id }),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error)
            }

            toast.success("Application approved! Email sent to the applicant.")
            fetchApplications(activeTab)
        } catch (error: any) {
            toast.error(error.message || "Failed to approve application")
        } finally {
            setIsProcessing(false)
        }
    }

    const handleReject = async () => {
        if (!selectedApp) return

        setIsProcessing(true)
        try {
            const response = await fetch("/api/admin/reject", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    applicationId: selectedApp.id,
                    reason: rejectReason,
                }),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error)
            }

            toast.success("Application rejected. Email sent to the applicant.")
            setShowRejectDialog(false)
            setRejectReason("")
            setSelectedApp(null)
            fetchApplications(activeTab)
        } catch (error: any) {
            toast.error(error.message || "Failed to reject application")
        } finally {
            setIsProcessing(false)
        }
    }

    const handleLogout = async () => {
        document.cookie =
            "admin_session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"
        router.push("/admin/login")
    }

    const handleDownloadCV = (cvUrl: string, fileName: string | null) => {
        // Use server-side proxy API to download CV (bypasses Cloudinary access restrictions)
        const downloadUrl = `/api/admin/download-cv?url=${encodeURIComponent(cvUrl)}&fileName=${encodeURIComponent(fileName || "cv.pdf")}`
        window.open(downloadUrl, "_blank")
        toast.success("Opening CV...")
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "PENDING":
                return (
                    <Badge
                        variant="outline"
                        className="bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-700"
                    >
                        <Clock className="w-3 h-3 mr-1" /> Pending
                    </Badge>
                )
            case "APPROVED":
                return (
                    <Badge
                        variant="outline"
                        className="bg-green-100 text-green-800 border-green-300 dark:bg-green-900/30 dark:text-green-400 dark:border-green-700"
                    >
                        <CheckCircle className="w-3 h-3 mr-1" /> Approved
                    </Badge>
                )
            case "REJECTED":
                return (
                    <Badge
                        variant="outline"
                        className="bg-red-100 text-red-800 border-red-300 dark:bg-red-900/30 dark:text-red-400 dark:border-red-700"
                    >
                        <XCircle className="w-3 h-3 mr-1" /> Rejected
                    </Badge>
                )
            case "COMPLETED":
                return (
                    <Badge
                        variant="outline"
                        className="bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-700"
                    >
                        <CheckCircle className="w-3 h-3 mr-1" /> Completed
                    </Badge>
                )
            default:
                return <Badge variant="outline">{status}</Badge>
        }
    }

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin" />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="border-b bg-background sticky top-0 z-50">
                <div className="container flex h-16 items-center justify-between px-4">
                    <div>
                        <h2 className="text-2xl font-bold">Nexus Admin</h2>
                        <p className="text-sm text-muted-foreground">
                            Owner Applications
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <ThemeToggle />
                        <Button variant="ghost" onClick={handleLogout}>
                            <LogOut className="w-4 h-4 mr-2" />
                            Logout
                        </Button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="container py-8 px-4">
                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">
                                        Pending
                                    </p>
                                    <p className="text-2xl font-bold">
                                        {counts.pending}
                                    </p>
                                </div>
                                <Clock className="w-8 h-8 text-yellow-500" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">
                                        Approved
                                    </p>
                                    <p className="text-2xl font-bold">
                                        {counts.approved}
                                    </p>
                                </div>
                                <CheckCircle className="w-8 h-8 text-green-500" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">
                                        Rejected
                                    </p>
                                    <p className="text-2xl font-bold">
                                        {counts.rejected}
                                    </p>
                                </div>
                                <XCircle className="w-8 h-8 text-red-500" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">
                                        Completed
                                    </p>
                                    <p className="text-2xl font-bold">
                                        {counts.completed}
                                    </p>
                                </div>
                                <User className="w-8 h-8 text-blue-500" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Applications List */}
                <Card>
                    <CardHeader>
                        <CardTitle>Applications</CardTitle>
                        <CardDescription>
                            Review and manage owner applications
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Tabs
                            value={activeTab}
                            onValueChange={(v) => {
                                setActiveTab(v)
                                setIsLoading(true)
                            }}
                        >
                            <TabsList className="mb-4">
                                <TabsTrigger value="PENDING">
                                    Pending ({counts.pending})
                                </TabsTrigger>
                                <TabsTrigger value="APPROVED">
                                    Approved ({counts.approved})
                                </TabsTrigger>
                                <TabsTrigger value="REJECTED">
                                    Rejected ({counts.rejected})
                                </TabsTrigger>
                                <TabsTrigger value="COMPLETED">
                                    Completed ({counts.completed})
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value={activeTab}>
                                {applications.length === 0 ? (
                                    <div className="text-center py-12 text-muted-foreground">
                                        No applications in this category
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {applications.map((app) => (
                                            <Card key={app.id}>
                                                <CardContent className="pt-6">
                                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                                        <div className="space-y-2">
                                                            <div className="flex items-center gap-2">
                                                                <h3 className="font-semibold text-lg">
                                                                    {
                                                                        app.firstname
                                                                    }{" "}
                                                                    {
                                                                        app.lastname
                                                                    }
                                                                </h3>
                                                                {getStatusBadge(
                                                                    app.status,
                                                                )}
                                                            </div>
                                                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-muted-foreground">
                                                                <span className="flex items-center gap-1">
                                                                    <Mail className="w-4 h-4" />
                                                                    {app.email}
                                                                </span>
                                                                <span className="flex items-center gap-1">
                                                                    <Phone className="w-4 h-4" />
                                                                    {app.phone}
                                                                </span>
                                                            </div>
                                                            <p className="text-xs text-muted-foreground">
                                                                Applied:{" "}
                                                                {format(
                                                                    new Date(
                                                                        app.createdAt,
                                                                    ),
                                                                    "PPp",
                                                                )}
                                                            </p>
                                                            {app.rejectionReason && (
                                                                <p className="text-sm text-red-600 mt-2">
                                                                    <strong>
                                                                        Rejection
                                                                        Reason:
                                                                    </strong>{" "}
                                                                    {
                                                                        app.rejectionReason
                                                                    }
                                                                </p>
                                                            )}
                                                        </div>

                                                        <div className="flex items-center gap-2">
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() =>
                                                                    handleDownloadCV(
                                                                        app.cvUrl,
                                                                        app.cvFileName,
                                                                    )
                                                                }
                                                            >
                                                                <Eye className="w-4 h-4 mr-1" />
                                                                View CV
                                                            </Button>

                                                            {app.status ===
                                                                "PENDING" && (
                                                                <>
                                                                    <Button
                                                                        size="sm"
                                                                        onClick={() =>
                                                                            handleApprove(
                                                                                app,
                                                                            )
                                                                        }
                                                                        disabled={
                                                                            isProcessing
                                                                        }
                                                                        className="bg-green-600 hover:bg-green-700"
                                                                    >
                                                                        <CheckCircle className="w-4 h-4 mr-1" />
                                                                        Approve
                                                                    </Button>
                                                                    <Button
                                                                        size="sm"
                                                                        variant="destructive"
                                                                        onClick={() => {
                                                                            setSelectedApp(
                                                                                app,
                                                                            )
                                                                            setShowRejectDialog(
                                                                                true,
                                                                            )
                                                                        }}
                                                                        disabled={
                                                                            isProcessing
                                                                        }
                                                                    >
                                                                        <XCircle className="w-4 h-4 mr-1" />
                                                                        Reject
                                                                    </Button>
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                )}
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>
            </main>

            {/* Reject Dialog */}
            <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Reject Application</DialogTitle>
                        <DialogDescription>
                            Please provide a reason for rejecting this
                            application. This will be sent to the applicant.
                        </DialogDescription>
                    </DialogHeader>
                    <Textarea
                        placeholder="Enter rejection reason..."
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        rows={4}
                    />
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setShowRejectDialog(false)
                                setRejectReason("")
                                setSelectedApp(null)
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleReject}
                            disabled={
                                isProcessing || rejectReason.trim().length < 10
                            }
                        >
                            {isProcessing ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Rejecting...
                                </>
                            ) : (
                                "Reject Application"
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
