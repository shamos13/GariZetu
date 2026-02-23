import { useEffect, useState, useMemo } from "react";
import { 
    Car, 
    Calendar, 
    DollarSign, 
    TrendingUp, 
    TrendingDown,
    CarFront,
    Users
} from "lucide-react";
import { 
    LineChart, 
    Line, 
    PieChart, 
    Pie, 
    Cell,
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    Legend, 
    ResponsiveContainer 
} from "recharts";
import { adminDashboardService, type DashboardStats, type Booking, type RevenueDataPoint, type CarAvailability } from "../service/AdminDashboardService.ts";
import { useIsMobile } from "../../../components/ui/use-mobile.ts";

const COLORS = {
    available: "#10b981", // emerald-500
    rented: "#3b82f6",   // blue-500
    maintenance: "#f59e0b", // amber-500
    revenue: "#8b5cf6",   // violet-500
};

export function DashboardPage() {
    const isMobile = useIsMobile();
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [recentBookings, setRecentBookings] = useState<Booking[]>([]);
    const [revenueTrend, setRevenueTrend] = useState<RevenueDataPoint[]>([]);
    const [carAvailability, setCarAvailability] = useState<CarAvailability | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Load all dashboard data
    useEffect(() => {
        const loadDashboardData = async () => {
            setIsLoading(true);
            try {
                // Load all data in parallel for better performance
                const [statsData, bookingsData, revenueData, availabilityData] = await Promise.all([
                    adminDashboardService.getStats(),
                    adminDashboardService.getRecentBookings(5),
                    adminDashboardService.getRevenueTrend(),
                    adminDashboardService.getCarAvailability(),
                ]);

                setStats(statsData);
                setRecentBookings(bookingsData);
                setRevenueTrend(revenueData);
                setCarAvailability(availabilityData);
            } catch (error) {
                console.error("Failed to load dashboard data:", error);
            } finally {
                setIsLoading(false);
            }
        };

        loadDashboardData();
    }, []);

    // Format currency
    const formatCurrency = (amount: number) => {
        if (amount >= 1000000) {
            return `Ksh ${(amount / 1000000).toFixed(1)}M`;
        }
        if (amount >= 1000) {
            return `Ksh ${(amount / 1000).toFixed(0)}K`;
        }
        return `Ksh ${amount.toFixed(0)}`;
    };

    // Format date
    const formatDate = (dateString: string) => {
        let date: Date;
        if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
            const [year, month, day] = dateString.split("-").map(Number);
            date = new Date(year, month - 1, day);
        } else {
            date = new Date(dateString);
        }

        if (Number.isNaN(date.getTime())) {
            return dateString;
        }

        return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    const getStatusClass = (status: Booking["status"]) => {
        switch (status) {
            case "PENDING_PAYMENT":
            case "PENDING":
                return "bg-amber-500/20 text-amber-400 border border-amber-500/30";
            case "ADMIN_NOTIFIED":
                return "bg-orange-500/20 text-orange-400 border border-orange-500/30";
            case "CONFIRMED":
                return "bg-blue-500/20 text-blue-400 border border-blue-500/30";
            case "ACTIVE":
                return "bg-violet-500/20 text-violet-400 border border-violet-500/30";
            case "COMPLETED":
                return "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30";
            case "REJECTED":
                return "bg-rose-500/20 text-rose-400 border border-rose-500/30";
            case "EXPIRED":
                return "bg-slate-500/20 text-slate-300 border border-slate-500/30";
            case "CANCELLED":
            default:
                return "bg-red-500/20 text-red-400 border border-red-500/30";
        }
    };

    const getStatusLabel = (status: Booking["status"]) => {
        if (status === "PENDING_PAYMENT" || status === "PENDING") {
            return "Pending Payment";
        }
        return status.replaceAll("_", " ");
    };

    // Prepare pie chart data
    const pieChartData = useMemo(() => {
        if (!carAvailability) return [];
        return [
            { name: "Available", value: carAvailability.available, color: COLORS.available },
            { name: "Rented", value: carAvailability.rented, color: COLORS.rented },
            { name: "Maintenance", value: carAvailability.maintenance, color: COLORS.maintenance },
        ];
    }, [carAvailability]);

    if (isLoading) {
        return (
            <div className="flex min-h-[280px] items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-400">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    if (!stats) {
        return (
            <div className="text-center py-12">
                <p className="text-red-400">Failed to load dashboard data</p>
            </div>
        );
    }

    return (
        <div className="space-y-4 sm:space-y-6">
            {/* Metric Cards */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4 sm:gap-5 lg:gap-6">
                {/* Total Cars */}
                <MetricCard
                    title="Total Cars"
                    value={stats.totalCars.toString()}
                    subtitle="In fleet"
                    icon={<Car className="w-5 h-5" />}
                    change={stats.carsChange}
                    changeLabel="from last month"
                    color="blue"
                />

                {/* Available Cars */}
                <MetricCard
                    title="Available Cars"
                    value={stats.availableCars.toString()}
                    subtitle="Ready to rent"
                    icon={<CarFront className="w-5 h-5" />}
                    color="emerald"
                />

                {/* Active Bookings */}
                <MetricCard
                    title="Active Bookings"
                    value={stats.activeBookings.toString()}
                    subtitle="Currently rented"
                    icon={<Calendar className="w-5 h-5" />}
                    change={stats.bookingsChange}
                    changeLabel="from last month"
                    color="violet"
                />

                {/* Revenue */}
                <MetricCard
                    title="Revenue"
                    value={formatCurrency(stats.monthlyRevenue)}
                    subtitle="This month"
                    icon={<DollarSign className="w-5 h-5" />}
                    change={stats.revenueChange}
                    changeLabel="from last month"
                    color="emerald"
                />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 gap-4 sm:gap-5 lg:grid-cols-2 lg:gap-6">
                {/* Revenue Trend Chart */}
                <div className="bg-[#1a1a1a] rounded-xl border border-gray-800 p-4 sm:p-5 lg:p-6">
                    <h3 className="text-white font-semibold mb-4">Revenue Trend (Last 6 Months)</h3>
                    <ResponsiveContainer width="100%" height={isMobile ? 220 : 300}>
                        <LineChart
                            data={revenueTrend}
                            margin={{ top: 8, right: 8, bottom: 8, left: isMobile ? -12 : 0 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                            <XAxis 
                                dataKey="month" 
                                stroke="#9ca3af"
                                interval="preserveStartEnd"
                                tick={{ fontSize: isMobile ? 10 : 12 }}
                            />
                            <YAxis 
                                stroke="#9ca3af"
                                width={isMobile ? 42 : 56}
                                tick={{ fontSize: isMobile ? 10 : 12 }}
                                tickFormatter={(value) => `Ksh ${(value / 1000).toFixed(0)}K`}
                            />
                            <Tooltip 
                                contentStyle={{ 
                                    backgroundColor: '#1a1a1a', 
                                    border: '1px solid #374151',
                                    borderRadius: '8px',
                                    color: '#fff'
                                }}
                                formatter={(value) => formatCurrency(Number(value ?? 0))}
                            />
                            <Legend wrapperStyle={{ color: '#9ca3af' }} />
                            <Line 
                                type="monotone" 
                                dataKey="revenue" 
                                stroke={COLORS.revenue} 
                                strokeWidth={2}
                                dot={{ fill: COLORS.revenue, r: 4 }}
                                name="Revenue"
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* Car Availability Pie Chart */}
                <div className="bg-[#1a1a1a] rounded-xl border border-gray-800 p-4 sm:p-5 lg:p-6">
                    <h3 className="text-white font-semibold mb-4">Car Availability</h3>
                    <ResponsiveContainer width="100%" height={isMobile ? 220 : 300}>
                        <PieChart>
                            <Pie
                                data={pieChartData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={
                                    isMobile
                                        ? false
                                        : ({ name, percent = 0 }) => `${name}: ${(percent * 100).toFixed(0)}%`
                                }
                                outerRadius={isMobile ? 76 : 100}
                                fill="#8884d8"
                                dataKey="value"
                            >
                                {pieChartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip 
                                contentStyle={{ 
                                    backgroundColor: '#1a1a1a', 
                                    border: '1px solid #374151',
                                    borderRadius: '8px',
                                    color: '#fff'
                                }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="mt-4 space-y-2">
                        {pieChartData.map((item, index) => (
                            <div key={index} className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2">
                                    <div 
                                        className="w-3 h-3 rounded-full" 
                                        style={{ backgroundColor: item.color }}
                                    />
                                    <span className="text-gray-400">{item.name}</span>
                                </div>
                                <span className="text-white font-medium">{item.value}</span>
                            </div>
                        ))}
                        <div className="pt-2 border-t border-gray-800">
                            <div className="flex items-center justify-between text-sm font-semibold">
                                <span className="text-gray-300">Total Fleet</span>
                                <span className="text-white">{carAvailability?.total || 0} Cars</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Bookings Table */}
            <div className="bg-[#1a1a1a] rounded-xl border border-gray-800 p-4 sm:p-5 lg:p-6">
                <h3 className="text-white font-semibold mb-4">Recent Bookings</h3>
                <div className="-mx-1 overflow-x-auto px-1">
                    <table className="w-full min-w-[760px]">
                        <thead>
                            <tr className="border-b border-gray-800">
                                <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">ID</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Customer</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Car</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Date</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Amount</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentBookings.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="text-center py-8 text-gray-500">
                                        No bookings found
                                    </td>
                                </tr>
                            ) : (
                                recentBookings.map((booking) => (
                                    <tr 
                                        key={booking.bookingId} 
                                        className="border-b border-gray-800/50 hover:bg-gray-900/50 transition-colors"
                                    >
                                        <td className="py-4 px-4">
                                            <span className="text-sm font-mono text-gray-300">{booking.bookingId}</span>
                                        </td>
                                        <td className="py-4 px-4">
                                            <div className="flex items-center gap-2">
                                                <Users className="w-4 h-4 text-gray-500" />
                                                <span className="text-sm text-white">{booking.customerName}</span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-4">
                                            <div className="flex items-center gap-2">
                                                <Car className="w-4 h-4 text-gray-500" />
                                                <span className="text-sm text-white">{booking.carName}</span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-4">
                                            <div className="flex items-center gap-2 text-gray-400">
                                                <Calendar className="w-4 h-4" />
                                                <span className="text-sm">{formatDate(booking.date)}</span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-4">
                                            <span className="text-sm font-semibold text-emerald-400">
                                                {formatCurrency(booking.amount)}
                                            </span>
                                        </td>
                                        <td className="py-4 px-4">
                                            <span
                                                className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getStatusClass(booking.status)}`}
                                            >
                                                {getStatusLabel(booking.status)}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

interface MetricCardProps {
    title: string;
    value: string;
    subtitle: string;
    icon: React.ReactNode;
    change?: number;
    changeLabel?: string;
    color?: "blue" | "emerald" | "violet" | "amber";
}

function MetricCard({ 
    title, 
    value, 
    subtitle, 
    icon, 
    change, 
    changeLabel,
    color = "blue" 
}: MetricCardProps) {
    const colorClasses = {
        blue: "bg-blue-500/20 text-blue-400 border-blue-500/30",
        emerald: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
        violet: "bg-violet-500/20 text-violet-400 border-violet-500/30",
        amber: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    };

    return (
        <div className="bg-[#1a1a1a] rounded-xl p-6 border border-gray-800 hover:border-gray-700 transition-colors">
            <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-lg border ${colorClasses[color]}`}>
                    {icon}
                </div>
                {change !== undefined && (
                    <div className="flex items-center gap-1 text-sm">
                        {change > 0 ? (
                            <TrendingUp className="w-4 h-4 text-emerald-400" />
                        ) : (
                            <TrendingDown className="w-4 h-4 text-red-400" />
                        )}
                        <span className={change > 0 ? "text-emerald-400" : "text-red-400"}>
                            {change > 0 ? "+" : ""}{change}%
                        </span>
                    </div>
                )}
            </div>
            <div>
                <h3 className="text-gray-400 text-sm font-medium mb-1">{title}</h3>
                <p className="text-white text-2xl font-bold mb-1">{value}</p>
                <p className="text-gray-500 text-sm">{subtitle}</p>
                {change !== undefined && changeLabel && (
                    <p className="text-gray-500 text-xs mt-1">{changeLabel}</p>
                )}
            </div>
        </div>
    );
}
