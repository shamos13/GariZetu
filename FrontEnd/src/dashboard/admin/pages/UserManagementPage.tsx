import { useEffect, useState, useCallback } from "react";
import { adminUserService, User, UserStats } from "../service/AdminUserService.ts";
import { authService } from "../../../services/AuthService.ts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card.tsx";
import { Button } from "../../../components/ui/button.tsx";
import {
    User as UserIcon,
    Shield,
    Calendar,
    Search,
    Filter,
    MoreVertical,
    Ban,
    Unlock,
    Trash2,
    Edit2,
    CheckCircle2,
    UserX
} from "lucide-react";
import { toast } from "sonner";
import { 
    DropdownMenu, 
    DropdownMenuContent, 
    DropdownMenuItem, 
    DropdownMenuLabel, 
    DropdownMenuSeparator, 
    DropdownMenuTrigger 
} from "../../../components/ui/dropdown-menu.tsx";
import { 
    Dialog, 
    DialogContent, 
    DialogDescription, 
    DialogFooter, 
    DialogHeader, 
    DialogTitle 
} from "../../../components/ui/dialog.tsx";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "../../../components/ui/alert-dialog.tsx";
import { Input } from "../../../components/ui/input.tsx";
import { Label } from "../../../components/ui/label.tsx";
import { getAdminActionErrorMessage } from "../../../lib/adminErrorUtils.ts";

export function UserManagementPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [stats, setStats] = useState<UserStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [roleFilter, setRoleFilter] = useState<"ALL" | "ADMIN" | "CUSTOMER">("ALL");
    const [actionLoading, setActionLoading] = useState<number | null>(null); // Track which user action is loading

    // Modal states
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editForm, setEditForm] = useState({
        userName: "",
        email: "",
        phoneNumber: ""
    });

    // Confirmation dialog states
    const [confirmDialog, setConfirmDialog] = useState<{
        open: boolean;
        title: string;
        description: string;
        confirmText: string;
        cancelText: string;
        variant: "default" | "destructive";
        onConfirm: () => void;
    } | null>(null);

    // Check authentication and redirect if not admin
    useEffect(() => {
        const user = authService.getUser();
        const isAdmin = authService.isAdmin();
        const isAuthenticated = authService.isAuthenticated();

        console.log("UserManagementPage - Auth check:", {
            user,
            isAdmin,
            isAuthenticated,
            token: authService.getToken()?.substring(0, 20) + "..."
        });

        if (!isAuthenticated) {
            console.warn("UserManagementPage - User is not authenticated");
            toast.error("Please log in as admin to access user management");
        } else if (!isAdmin) {
            console.warn("UserManagementPage - User is authenticated but not admin");
            toast.error("Admin privileges required to manage users");
        }
    }, []);

    const fetchData = useCallback(async () => {
        // Check authentication before making API calls
        const isAuthenticated = authService.isAuthenticated();
        const isAdmin = authService.isAdmin();

        if (!isAuthenticated || !isAdmin) {
            console.warn("UserManagementPage - Cannot fetch data: not authenticated as admin");
            setIsLoading(false);
            return;
        }

        try {
            setIsLoading(true);
            console.log("UserManagementPage - Starting to fetch data...");

            const [fetchedUsers, fetchedStats] = await Promise.all([
                adminUserService.getAll(),
                adminUserService.getStats()
            ]);

            console.log("UserManagementPage - Fetched data:", {
                usersCount: fetchedUsers.length,
                stats: fetchedStats,
                sampleUser: fetchedUsers[0]
            });

            setUsers(fetchedUsers);
            setStats(fetchedStats);
        } catch (err: any) {
            console.error("UserManagementPage - Failed to fetch users or stats:", err);
            console.error("UserManagementPage - Error details:", {
                message: err.message,
                response: err.response,
                status: err.response?.status,
                data: err.response?.data
            });
            toast.error(getAdminActionErrorMessage(err, "Failed to load user data."));
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Only run once on mount

    const handleSearch = async (query: string) => {
        setSearchQuery(query);
        if (query.length > 2) {
            try {
                const results = await adminUserService.search(query);
                setUsers(results);
            } catch (err) {
                console.error("Search failed:", err);
                toast.error(getAdminActionErrorMessage(err, "Failed to search users."));
            }
        } else if (query.length === 0) {
            fetchData();
        }
    };

    const handleBlockUser = async (userId: number) => {
        if (actionLoading !== null) return; // Prevent multiple simultaneous actions
        
        const user = users.find(u => u.userId === userId);
        
        setConfirmDialog({
            open: true,
            title: "Block User",
            description: `Are you sure you want to block ${user?.userName || 'this user'}? They will not be able to access the system until unblocked.`,
            confirmText: "Block User",
            cancelText: "Cancel",
            variant: "default",
            onConfirm: async () => {
                setConfirmDialog(null);
                try {
                    setActionLoading(userId);
                    const updatedUser = await adminUserService.block(userId);
                    toast.success(`User ${updatedUser.userName} blocked successfully`);
                    await fetchData();
                } catch (err: any) {
                    console.error("Failed to block user:", err);
                    toast.error(getAdminActionErrorMessage(err, "Failed to block user."));
                } finally {
                    setActionLoading(null);
                }
            }
        });
    };

    const handleUnblockUser = async (userId: number) => {
        if (actionLoading !== null) return; // Prevent multiple simultaneous actions
        
        const user = users.find(u => u.userId === userId);
        
        setConfirmDialog({
            open: true,
            title: "Unblock User",
            description: `Are you sure you want to unblock ${user?.userName || 'this user'}? They will regain access to the system.`,
            confirmText: "Unblock User",
            cancelText: "Cancel",
            variant: "default",
            onConfirm: async () => {
                setConfirmDialog(null);
                try {
                    setActionLoading(userId);
                    const updatedUser = await adminUserService.unblock(userId);
                    toast.success(`User ${updatedUser.userName} unblocked successfully`);
                    await fetchData();
                } catch (err: any) {
                    console.error("Failed to unblock user:", err);
                    toast.error(getAdminActionErrorMessage(err, "Failed to unblock user."));
                } finally {
                    setActionLoading(null);
                }
            }
        });
    };

    const handleChangeRole = async (userId: number, newRole: "ADMIN" | "CUSTOMER") => {
        if (actionLoading !== null) return; // Prevent multiple simultaneous actions
        
        const user = users.find(u => u.userId === userId);
        
        setConfirmDialog({
            open: true,
            title: `Change User Role to ${newRole}?`,
            description: `Are you sure you want to change ${user?.userName || 'this user'}'s role from ${user?.userRole} to ${newRole}? This will affect their system permissions.`,
            confirmText: `Change to ${newRole}`,
            cancelText: "Cancel",
            variant: "default",
            onConfirm: async () => {
                setConfirmDialog(null);
                try {
                    setActionLoading(userId);
                    const updatedUser = await adminUserService.changeRole(userId, newRole);
                    toast.success(`${updatedUser.userName}'s role changed to ${newRole} successfully`);
                    await fetchData();
                } catch (err: any) {
                    console.error("Failed to change user role:", err);
                    toast.error(getAdminActionErrorMessage(err, "Failed to change user role."));
                } finally {
                    setActionLoading(null);
                }
            }
        });
    };

    const handleDeleteUser = async (userId: number, permanent: boolean = false) => {
        if (actionLoading !== null) return; // Prevent multiple simultaneous actions
        
        const user = users.find(u => u.userId === userId);
        
        setConfirmDialog({
            open: true,
            title: permanent ? "⚠️ Permanent Delete User" : "Delete User",
            description: permanent 
                ? `Are you sure you want to PERMANENTLY delete ${user?.userName || 'this user'}? This action cannot be undone and will remove all user data permanently from the system.`
                : `Are you sure you want to delete ${user?.userName || 'this user'}? This will perform a soft delete, which can be restored later.`,
            confirmText: permanent ? "Delete Permanently" : "Delete User",
            cancelText: "Cancel",
            variant: "destructive",
            onConfirm: async () => {
                setConfirmDialog(null);
                try {
                    setActionLoading(userId);
                    if (permanent) {
                        await adminUserService.permanentDelete(userId);
                        toast.success(`${user?.userName || 'User'} permanently deleted`);
                    } else {
                        await adminUserService.delete(userId);
                        toast.success(`${user?.userName || 'User'} deleted (soft delete)`);
                    }
                    await fetchData();
                } catch (err: any) {
                    console.error("Failed to delete user:", err);
                    toast.error(getAdminActionErrorMessage(err, "Failed to delete user."));
                } finally {
                    setActionLoading(null);
                }
            }
        });
    };

    const openEditModal = (user: User) => {
        setEditingUser(user);
        setEditForm({
            userName: user.userName,
            email: user.email,
            phoneNumber: user.phoneNumber || ""
        });
        setIsEditModalOpen(true);
    };

    const handleUpdateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingUser) return;
        if (actionLoading !== null) return; // Prevent multiple simultaneous actions

        // Validate form
        if (!editForm.userName.trim()) {
            toast.error("User name is required");
            return;
        }
        if (!editForm.email.trim()) {
            toast.error("Email is required");
            return;
        }

        try {
            setActionLoading(editingUser.userId);
            const updatedUser = await adminUserService.update(editingUser.userId, editForm);
            toast.success(`${updatedUser.userName} updated successfully`);
            setIsEditModalOpen(false);
            setEditingUser(null);
            await fetchData();
        } catch (err: any) {
            console.error("Failed to update user:", err);
            toast.error(getAdminActionErrorMessage(err, "Failed to update user."));
        } finally {
            setActionLoading(null);
        }
    };

    const filteredUsers = users.filter((user) => {
        const matchesRole = roleFilter === "ALL" || user.userRole === roleFilter;
        return matchesRole;
    });

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    if (isLoading && !stats) {
        return (
            <div className="flex items-center justify-center py-24">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-gray-400">Loading user management...</p>
                </div>
            </div>
        );
    }

    // Show authentication required message
    if (!authService.isAuthenticated()) {
        return (
            <div className="flex items-center justify-center py-24">
                <div className="text-center">
                    <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">Authentication Required</h3>
                    <p className="text-gray-400 mb-4">Please log in as an administrator to access user management.</p>
                    <p className="text-sm text-gray-500">Use admin@garizetu.com / admin123 to log in</p>
                </div>
            </div>
        );
    }

    if (!authService.isAdmin()) {
        return (
            <div className="flex items-center justify-center py-24">
                <div className="text-center">
                    <div className="w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">Admin Access Required</h3>
                    <p className="text-gray-400 mb-4">You need administrator privileges to access user management.</p>
                    <p className="text-sm text-gray-500">Contact an administrator for access</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatsCard 
                    title="Total Users" 
                    value={stats?.totalUsers || 0} 
                    icon={<UserIcon className="w-5 h-5 text-blue-400" />}
                    subtitle="All accounts"
                />
                <StatsCard 
                    title="Active" 
                    value={stats?.activeUsers || 0} 
                    icon={<CheckCircle2 className="w-5 h-5 text-emerald-400" />}
                    subtitle="Normal status"
                />
                <StatsCard 
                    title="Blocked" 
                    value={stats?.blockedUsers || 0} 
                    icon={<Ban className="w-5 h-5 text-amber-400" />}
                    subtitle="Restricted access"
                />
                <StatsCard 
                    title="Deleted" 
                    value={stats?.deletedUsers || 0} 
                    icon={<UserX className="w-5 h-5 text-red-400" />}
                    subtitle="Soft deleted"
                />
            </div>

            {/* Role Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="bg-[#1a1a1a] border-gray-800">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-400">Administrators</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">{stats?.totalAdmins || 0}</div>
                        <p className="text-xs text-gray-500 mt-1">Full system access</p>
                    </CardContent>
                </Card>
                <Card className="bg-[#1a1a1a] border-gray-800">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-400">Customers</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">{stats?.totalCustomers || 0}</div>
                        <p className="text-xs text-gray-500 mt-1">Regular users</p>
                    </CardContent>
                </Card>
            </div>

            {/* Search and Filter */}
            <Card className="bg-[#1a1a1a] border-gray-800">
                <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                            <input
                                type="text"
                                placeholder="Search by name or email..."
                                value={searchQuery}
                                onChange={(e) => handleSearch(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-[#0a0a0a] border border-gray-800 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-white/30"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <Filter className="w-5 h-5 text-gray-500" />
                            <select
                                value={roleFilter}
                                onChange={(e) => setRoleFilter(e.target.value as any)}
                                className="px-4 py-3 bg-[#0a0a0a] border border-gray-800 rounded-lg text-white focus:outline-none focus:border-white/30"
                            >
                                <option value="ALL">All Roles</option>
                                <option value="ADMIN">Admin</option>
                                <option value="CUSTOMER">Customer</option>
                            </select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Users Table */}
            <Card className="bg-[#1a1a1a] border-gray-800">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-white">User List</CardTitle>
                            <CardDescription className="text-gray-400">Manage your system users</CardDescription>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => fetchData()}>
                            Refresh
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="relative -mx-1 overflow-x-auto px-1">
                        <table className="w-full min-w-[900px]">
                            <thead>
                                <tr className="border-b border-gray-800">
                                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">User</th>
                                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Role</th>
                                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Status</th>
                                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Last Login</th>
                                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Joined</th>
                                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-400">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredUsers.map((user) => (
                                    <tr key={user.userId} className="border-b border-gray-800/50 hover:bg-gray-800/20 transition-colors">
                                        <td className="py-4 px-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                                                    <span className="text-sm font-semibold text-white">
                                                        {user.userName.charAt(0).toUpperCase()}
                                                    </span>
                                                </div>
                                                <div>
                                                    <p className="text-white font-medium">{user.userName}</p>
                                                    <p className="text-sm text-gray-400">{user.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-4">
                                            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                                                user.userRole === "ADMIN"
                                                    ? "bg-red-500/10 text-red-400 border border-red-500/20"
                                                    : "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                                            }`}>
                                                {user.userRole === "ADMIN" && <Shield className="w-3 h-3" />}
                                                {user.userRole}
                                            </span>
                                        </td>
                                        <td className="py-4 px-4">
                                            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                                                user.status === "ACTIVE"
                                                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                                    : user.status === "BLOCKED"
                                                    ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                                                    : "bg-red-500/10 text-red-400 border border-red-500/20"
                                            }`}>
                                                {user.status}
                                            </span>
                                        </td>
                                        <td className="py-4 px-4">
                                            <div className="flex items-center gap-2 text-gray-400">
                                                {user.lastLogin ? (
                                                    <>
                                                        <span className="text-sm">{formatDate(user.lastLogin)}</span>
                                                    </>
                                                ) : (
                                                    <span className="text-sm text-gray-500">Never</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="py-4 px-4">
                                            <div className="flex items-center gap-2 text-gray-400">
                                                <Calendar className="w-4 h-4" />
                                                <span className="text-sm">{formatDate(user.createdAt)}</span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-4 text-right relative z-10">
                                            <div className="relative">
                                                <UserActions 
                                                    user={user} 
                                                    isLoading={actionLoading === user.userId}
                                                    onEdit={() => openEditModal(user)}
                                                    onBlock={() => handleBlockUser(user.userId)}
                                                    onUnblock={() => handleUnblockUser(user.userId)}
                                                    onDelete={() => handleDeleteUser(user.userId)}
                                                    onPermanentDelete={() => handleDeleteUser(user.userId, true)}
                                                    onChangeRole={(role) => handleChangeRole(user.userId, role)}
                                                />
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {filteredUsers.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="py-12 text-center text-gray-500">
                                            No users found matching your criteria
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            {/* Edit User Modal */}
            <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                <DialogContent className="bg-[#1a1a1a] border-gray-800 text-white sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Edit User</DialogTitle>
                        <DialogDescription className="text-gray-400">
                            Update user information for {editingUser?.userName}
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleUpdateUser} className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Full Name</Label>
                            <Input 
                                id="name" 
                                value={editForm.userName}
                                onChange={(e) => setEditForm({ ...editForm, userName: e.target.value })}
                                className="bg-[#0a0a0a] border-gray-800 focus:border-white/30" 
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email Address</Label>
                            <Input 
                                id="email" 
                                type="email"
                                value={editForm.email}
                                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                                className="bg-[#0a0a0a] border-gray-800 focus:border-white/30" 
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="phone">Phone Number</Label>
                            <Input 
                                id="phone" 
                                value={editForm.phoneNumber}
                                onChange={(e) => setEditForm({ ...editForm, phoneNumber: e.target.value })}
                                className="bg-[#0a0a0a] border-gray-800 focus:border-white/30" 
                                placeholder="Not provided"
                            />
                        </div>
                        <DialogFooter className="pt-4">
                            <Button 
                                type="button" 
                                variant="ghost" 
                                onClick={() => setIsEditModalOpen(false)}
                                disabled={actionLoading === editingUser?.userId}
                            >
                                Cancel
                            </Button>
                            <Button 
                                type="submit" 
                                className="bg-white text-black hover:bg-gray-200"
                                disabled={actionLoading === editingUser?.userId}
                            >
                                {actionLoading === editingUser?.userId ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin mr-2" />
                                        Saving...
                                    </>
                                ) : (
                                    "Save Changes"
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Confirmation Dialog */}
            {confirmDialog && (
                <AlertDialog open={confirmDialog.open} onOpenChange={(open) => {
                    if (!open) setConfirmDialog(null);
                }}>
                    <AlertDialogContent className="bg-[#1a1a1a] border-gray-800 text-white">
                        <AlertDialogHeader>
                            <AlertDialogTitle className="text-xl font-semibold text-white">
                                {confirmDialog.title}
                            </AlertDialogTitle>
                            <AlertDialogDescription className="text-gray-400 text-base mt-2">
                                {confirmDialog.description}
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter className="mt-6">
                            <AlertDialogCancel 
                                onClick={() => setConfirmDialog(null)}
                                className="bg-gray-800 text-white border-gray-700 hover:bg-gray-700"
                            >
                                {confirmDialog.cancelText}
                            </AlertDialogCancel>
                            <AlertDialogAction
                                onClick={confirmDialog.onConfirm}
                                className={
                                    confirmDialog.variant === "destructive"
                                        ? "bg-red-600 text-white hover:bg-red-700"
                                        : "bg-white text-black hover:bg-gray-200"
                                }
                            >
                                {confirmDialog.confirmText}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            )}
        </div>
    );
}

function StatsCard({ title, value, icon, subtitle }: { title: string, value: number, icon: React.ReactNode, subtitle: string }) {
    return (
        <Card className="bg-[#1a1a1a] border-gray-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-400">{title}</CardTitle>
                {icon}
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold text-white">{value}</div>
                <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
            </CardContent>
        </Card>
    );
}

function UserActions({ 
    user, 
    isLoading,
    onEdit, 
    onBlock, 
    onUnblock, 
    onDelete, 
    onPermanentDelete,
    onChangeRole 
}: { 
    user: User, 
    isLoading: boolean,
    onEdit: () => void, 
    onBlock: () => void, 
    onUnblock: () => void, 
    onDelete: () => void, 
    onPermanentDelete: () => void,
    onChangeRole: (role: "ADMIN" | "CUSTOMER") => void
}) {
    return (
        <DropdownMenu modal={true}>
            <DropdownMenuTrigger asChild>
                <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-gray-400 hover:text-white hover:bg-gray-800 relative z-10"
                    disabled={isLoading}
                    type="button"
                >
                    {isLoading ? (
                        <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                    ) : (
                        <MoreVertical className="w-5 h-5" />
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
                align="end" 
                side="bottom"
                className="!bg-[#1a1a1a] !border-gray-800 !text-white w-56 shadow-2xl"
                sideOffset={5}
                collisionPadding={10}
                onCloseAutoFocus={(e) => e.preventDefault()}
                style={{ zIndex: 9999 }}
            >
                <DropdownMenuLabel className="!text-gray-300 !px-2 !py-1.5 !text-xs !font-semibold">Actions</DropdownMenuLabel>
                <DropdownMenuItem 
                    onSelect={(e) => {
                        e.preventDefault();
                        onEdit();
                    }}
                    disabled={isLoading}
                    className="!bg-transparent hover:!bg-gray-800 !text-white !cursor-pointer disabled:!opacity-50 disabled:!cursor-not-allowed focus:!bg-gray-800 !px-2 !py-1.5"
                >
                    <Edit2 className="w-4 h-4 mr-2" />
                    Edit Details
                </DropdownMenuItem>
                
                <DropdownMenuSeparator className="!bg-gray-800 !my-1" />
                
                <DropdownMenuLabel className="!text-gray-300 !px-2 !py-1.5 !text-xs !font-semibold">Permissions</DropdownMenuLabel>
                {user.userRole === "CUSTOMER" ? (
                    <DropdownMenuItem 
                        onSelect={(e) => {
                            e.preventDefault();
                            onChangeRole("ADMIN");
                        }}
                        disabled={isLoading}
                        className="!bg-transparent hover:!bg-gray-800 !text-white !cursor-pointer disabled:!opacity-50 disabled:!cursor-not-allowed focus:!bg-gray-800 !px-2 !py-1.5"
                    >
                        <Shield className="w-4 h-4 mr-2" />
                        Make Admin
                    </DropdownMenuItem>
                ) : (
                    <DropdownMenuItem 
                        onSelect={(e) => {
                            e.preventDefault();
                            onChangeRole("CUSTOMER");
                        }}
                        disabled={isLoading}
                        className="!bg-transparent hover:!bg-gray-800 !text-white !cursor-pointer disabled:!opacity-50 disabled:!cursor-not-allowed focus:!bg-gray-800 !px-2 !py-1.5"
                    >
                        <UserIcon className="w-4 h-4 mr-2" />
                        Revoke Admin
                    </DropdownMenuItem>
                )}
                
                <DropdownMenuSeparator className="!bg-gray-800 !my-1" />
                
                <DropdownMenuLabel className="!text-gray-300 !px-2 !py-1.5 !text-xs !font-semibold">Account Status</DropdownMenuLabel>
                {user.status === "BLOCKED" ? (
                    <DropdownMenuItem 
                        onSelect={(e) => {
                            e.preventDefault();
                            onUnblock();
                        }}
                        disabled={isLoading}
                        className="!bg-transparent hover:!bg-emerald-500/10 !text-emerald-400 !cursor-pointer disabled:!opacity-50 disabled:!cursor-not-allowed focus:!bg-emerald-500/10 !px-2 !py-1.5"
                    >
                        <Unlock className="w-4 h-4 mr-2" />
                        Unblock User
                    </DropdownMenuItem>
                ) : (
                    <DropdownMenuItem 
                        onSelect={(e) => {
                            e.preventDefault();
                            onBlock();
                        }}
                        disabled={isLoading}
                        className="!bg-transparent hover:!bg-amber-500/10 !text-amber-400 !cursor-pointer disabled:!opacity-50 disabled:!cursor-not-allowed focus:!bg-amber-500/10 !px-2 !py-1.5"
                    >
                        <Ban className="w-4 h-4 mr-2" />
                        Block User
                    </DropdownMenuItem>
                )}
                
                <DropdownMenuSeparator className="!bg-gray-800 !my-1" />
                
                <DropdownMenuItem 
                    onSelect={(e) => {
                        e.preventDefault();
                        onDelete();
                    }}
                    disabled={isLoading}
                    className="!bg-transparent hover:!bg-red-500/10 !text-red-400 !cursor-pointer disabled:!opacity-50 disabled:!cursor-not-allowed focus:!bg-red-500/10 !px-2 !py-1.5"
                >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Soft Delete
                </DropdownMenuItem>
                <DropdownMenuItem 
                    onSelect={(e) => {
                        e.preventDefault();
                        onPermanentDelete();
                    }}
                    disabled={isLoading}
                    className="!bg-transparent hover:!bg-red-600/20 !text-red-500 !cursor-pointer disabled:!opacity-50 disabled:!cursor-not-allowed focus:!bg-red-600/20 !px-2 !py-1.5"
                >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Permanent Delete
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
