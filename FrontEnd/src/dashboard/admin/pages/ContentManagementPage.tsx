import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AlertTriangle, RefreshCw, Save, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import { adminContentService } from "../service/AdminContentService.ts";
import type {
    ContactSectionSettingsUpdateRequest,
} from "../service/AdminContentService.ts";
import { adminCarService } from "../service/AdminCarService.ts";
import { DEFAULT_BRAND_LOGOS, toBrandKey } from "../../../constants/brandLogos.ts";
import { getAdminActionErrorMessage } from "../../../lib/adminErrorUtils.ts";
import type { BrandLogoOverride, ContactSectionSettings } from "../../../services/SiteContentService.ts";

type ContentTab = "brand-logos" | "contact-content";

type ContactFormState = {
    phone: string;
    altPhone: string;
    email: string;
    supportEmail: string;
    whatsapp: string;
    address: string;
    city: string;
    hours: string;
    sundayHours: string;
    jkiaDeskHours: string;
    heroTitle: string;
    heroDescription: string;
};

const CONTENT_TAB_STORAGE_KEY = "admin_content_management_tab";

const EMPTY_CONTACT_FORM: ContactFormState = {
    phone: "",
    altPhone: "",
    email: "",
    supportEmail: "",
    whatsapp: "",
    address: "",
    city: "",
    hours: "",
    sundayHours: "",
    jkiaDeskHours: "",
    heroTitle: "",
    heroDescription: "",
};

const toContactFormState = (settings: ContactSectionSettings): ContactFormState => ({
    phone: settings.phone ?? "",
    altPhone: settings.altPhone ?? "",
    email: settings.email ?? "",
    supportEmail: settings.supportEmail ?? "",
    whatsapp: settings.whatsapp ?? "",
    address: settings.address ?? "",
    city: settings.city ?? "",
    hours: settings.hours ?? "",
    sundayHours: settings.sundayHours ?? "",
    jkiaDeskHours: settings.jkiaDeskHours ?? "",
    heroTitle: settings.heroTitle ?? "",
    heroDescription: settings.heroDescription ?? "",
});

const toContactUpdatePayload = (form: ContactFormState): ContactSectionSettingsUpdateRequest => ({
    phone: form.phone.trim(),
    altPhone: form.altPhone.trim() || null,
    email: form.email.trim(),
    supportEmail: form.supportEmail.trim() || null,
    whatsapp: form.whatsapp.trim(),
    address: form.address.trim(),
    city: form.city.trim(),
    hours: form.hours.trim(),
    sundayHours: form.sundayHours.trim(),
    jkiaDeskHours: form.jkiaDeskHours.trim() || null,
    heroTitle: form.heroTitle.trim(),
    heroDescription: form.heroDescription.trim(),
});

const withPreferredFleetOrder = (brands: string[]): string[] => {
    const unique = Array.from(new Set(brands.map((brand) => brand.trim()).filter(Boolean)));
    return unique.sort((a, b) => a.localeCompare(b));
};

const toBrandDisplayName = (brandKey: string): string =>
    brandKey
        .split("-")
        .map((segment) => segment.trim())
        .filter(Boolean)
        .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
        .join(" ");

const getDefaultFleetBrands = (): string[] =>
    withPreferredFleetOrder(Object.keys(DEFAULT_BRAND_LOGOS).map(toBrandDisplayName));

const parseStoredTab = (value: string | null): ContentTab =>
    value === "contact-content" ? "contact-content" : "brand-logos";

export function ContentManagementPage() {
    const [activeTab, setActiveTab] = useState<ContentTab>(() =>
        parseStoredTab(localStorage.getItem(CONTENT_TAB_STORAGE_KEY))
    );
    const [isLoading, setIsLoading] = useState(true);
    const [isSavingLogo, setIsSavingLogo] = useState(false);
    const [isSavingContact, setIsSavingContact] = useState(false);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [fleetLoadWarning, setFleetLoadWarning] = useState<string | null>(null);

    const [brandLogos, setBrandLogos] = useState<BrandLogoOverride[]>([]);
    const [fleetBrands, setFleetBrands] = useState<string[]>([]);
    const [brandNameInput, setBrandNameInput] = useState("");
    const [logoUrlInput, setLogoUrlInput] = useState("");
    const [logoFileInput, setLogoFileInput] = useState<File | null>(null);
    const logoFileRef = useRef<HTMLInputElement | null>(null);

    const [contactForm, setContactForm] = useState<ContactFormState>(EMPTY_CONTACT_FORM);

    useEffect(() => {
        localStorage.setItem(CONTENT_TAB_STORAGE_KEY, activeTab);
    }, [activeTab]);

    const loadData = useCallback(async () => {
        try {
            setIsLoading(true);
            setLoadError(null);
            setFleetLoadWarning(null);

            const [brandLogoData, contactSettingsData] = await Promise.all([
                adminContentService.getBrandLogos(),
                adminContentService.getContactSettings(),
            ]);

            setBrandLogos(brandLogoData);
            setContactForm(toContactFormState(contactSettingsData));

            const fallbackFleetBrands = withPreferredFleetOrder([
                ...brandLogoData.map((entry) => entry.brandName),
                ...getDefaultFleetBrands(),
            ]);

            try {
                const fleetCars = await adminCarService.getAll();
                const loadedFleetBrands = withPreferredFleetOrder(fleetCars.map((car) => car.make));
                setFleetBrands(loadedFleetBrands.length > 0 ? loadedFleetBrands : fallbackFleetBrands);
            } catch (fleetError) {
                console.error("Failed to load fleet brands for content management:", fleetError);
                setFleetBrands(fallbackFleetBrands);
                setFleetLoadWarning(
                    "Fleet cars could not be loaded right now. Logo and contact content management is still available."
                );
            }
        } catch (error) {
            console.error("Failed to load content management data:", error);
            setLoadError(getAdminActionErrorMessage(error, "Unable to load content management data."));
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        void loadData();
    }, [loadData]);

    const overridesByKey = useMemo(
        () => brandLogos.reduce<Record<string, BrandLogoOverride>>((accumulator, item) => {
            accumulator[item.brandKey] = item;
            return accumulator;
        }, {}),
        [brandLogos]
    );

    const brandCoverage = useMemo(() => {
        const fleetEntries = fleetBrands.map((brandName) => {
            const key = toBrandKey(brandName);
            const override = overridesByKey[key];
            const defaultLogo = DEFAULT_BRAND_LOGOS[key];

            return {
                brandName,
                brandKey: key,
                logoUrl: override?.logoUrl || defaultLogo || null,
                source: override ? "override" : (defaultLogo ? "default" : "missing"),
            };
        });

        const extraOverrideEntries = brandLogos
            .filter((item) => !fleetEntries.some((entry) => entry.brandKey === item.brandKey))
            .map((item) => ({
                brandName: item.brandName,
                brandKey: item.brandKey,
                logoUrl: item.logoUrl,
                source: "override" as const,
            }));

        return [...fleetEntries, ...extraOverrideEntries];
    }, [brandLogos, fleetBrands, overridesByKey]);

    const clearLogoInputs = () => {
        setBrandNameInput("");
        setLogoUrlInput("");
        setLogoFileInput(null);
        if (logoFileRef.current) {
            logoFileRef.current.value = "";
        }
    };

    const handleLogoSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        const brandName = brandNameInput.trim();
        const typedLogoUrl = logoUrlInput.trim();
        if (!brandName) {
            toast.error("Brand name is required.");
            return;
        }

        if (!logoFileInput && !typedLogoUrl) {
            toast.error("Upload a logo file or provide a logo URL.");
            return;
        }

        try {
            setIsSavingLogo(true);
            let logoUrl = typedLogoUrl;

            if (logoFileInput) {
                const uploadResult = await adminContentService.uploadBrandLogoImage(logoFileInput);
                logoUrl = uploadResult.logoUrl;
            }

            const saved = await adminContentService.upsertBrandLogo({ brandName, logoUrl });
            setBrandLogos((current) => {
                const withoutOld = current.filter((item) => item.brandKey !== saved.brandKey);
                return [...withoutOld, saved].sort((a, b) => a.brandName.localeCompare(b.brandName));
            });

            clearLogoInputs();
            toast.success(`Logo override saved for ${saved.brandName}.`);
        } catch (error) {
            console.error("Failed to save brand logo override:", error);
            toast.error(getAdminActionErrorMessage(error, "Unable to save brand logo override."));
        } finally {
            setIsSavingLogo(false);
        }
    };

    const handleDeleteLogo = async (brandKey: string) => {
        try {
            await adminContentService.deleteBrandLogo(brandKey);
            setBrandLogos((current) => current.filter((item) => item.brandKey !== brandKey));
            toast.success("Logo override removed.");
        } catch (error) {
            console.error("Failed to delete brand logo override:", error);
            toast.error(getAdminActionErrorMessage(error, "Unable to remove logo override."));
        }
    };

    const handleContactFieldChange = (field: keyof ContactFormState, value: string) => {
        setContactForm((current) => ({ ...current, [field]: value }));
    };

    const handleContactSave = async (event: React.FormEvent) => {
        event.preventDefault();

        try {
            setIsSavingContact(true);
            const updated = await adminContentService.updateContactSettings(toContactUpdatePayload(contactForm));
            setContactForm(toContactFormState(updated));
            toast.success("Contact section updated.");
        } catch (error) {
            console.error("Failed to update contact settings:", error);
            toast.error(getAdminActionErrorMessage(error, "Unable to update contact settings."));
        } finally {
            setIsSavingContact(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex min-h-[280px] items-center justify-center">
                <div className="text-center">
                    <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
                    <p className="text-gray-400">Loading content management...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {loadError && (
                <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
                    {loadError}
                </div>
            )}
            {fleetLoadWarning && (
                <div className="rounded-lg border border-blue-500/40 bg-blue-500/10 px-4 py-3 text-sm text-blue-200">
                    {fleetLoadWarning}
                </div>
            )}

            <div className="rounded-xl border border-gray-800 bg-[#1a1a1a]">
                <div className="flex flex-wrap items-center gap-2 border-b border-gray-800 p-3">
                    <TopNavButton
                        label="Brand Logos Page"
                        active={activeTab === "brand-logos"}
                        onClick={() => setActiveTab("brand-logos")}
                    />
                    <TopNavButton
                        label="Contact Content Page"
                        active={activeTab === "contact-content"}
                        onClick={() => setActiveTab("contact-content")}
                    />

                    <button
                        type="button"
                        onClick={() => void loadData()}
                        className="ml-auto inline-flex items-center gap-2 rounded-lg border border-gray-700 px-3 py-2 text-sm text-gray-300 transition-colors hover:bg-gray-800"
                    >
                        <RefreshCw className="h-4 w-4" />
                        Refresh
                    </button>
                </div>

                <div className="p-5">
                    {activeTab === "brand-logos" ? (
                        <section className="space-y-4">
                            <div>
                                <h2 className="text-lg font-semibold text-white">Rent By Brand Logos</h2>
                                <p className="text-sm text-gray-400">
                                    Upload logo images directly, or provide a logo URL. Supported formats: `svg`, `png`, `jpg`, `jpeg`, `webp`.
                                </p>
                            </div>

                            <form
                                onSubmit={handleLogoSubmit}
                                className="grid gap-3 md:grid-cols-[minmax(0,220px)_minmax(0,1fr)_minmax(0,220px)_auto]"
                            >
                                <input
                                    type="text"
                                    value={brandNameInput}
                                    onChange={(event) => setBrandNameInput(event.target.value)}
                                    placeholder="Brand name (e.g. Lexus)"
                                    className="w-full rounded-lg border border-gray-700 bg-[#101010] px-3 py-2 text-sm text-white outline-none focus:border-emerald-500"
                                />

                                <input
                                    type="text"
                                    value={logoUrlInput}
                                    onChange={(event) => setLogoUrlInput(event.target.value)}
                                    placeholder="Optional logo URL"
                                    className="w-full rounded-lg border border-gray-700 bg-[#101010] px-3 py-2 text-sm text-white outline-none focus:border-emerald-500"
                                />

                                <label className="flex cursor-pointer items-center justify-between rounded-lg border border-gray-700 bg-[#101010] px-3 py-2 text-sm text-gray-300">
                                    <span className="truncate pr-2">
                                        {logoFileInput ? logoFileInput.name : "Upload logo file"}
                                    </span>
                                    <Upload className="h-4 w-4 flex-shrink-0" />
                                    <input
                                        ref={logoFileRef}
                                        type="file"
                                        accept=".svg,.png,.jpg,.jpeg,.webp,image/*"
                                        className="hidden"
                                        onChange={(event) => {
                                            const selectedFile = event.target.files?.[0] ?? null;
                                            setLogoFileInput(selectedFile);
                                        }}
                                    />
                                </label>

                                <button
                                    type="submit"
                                    disabled={isSavingLogo}
                                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-500 disabled:opacity-60"
                                >
                                    {isSavingLogo ? "Saving..." : "Save Logo"}
                                </button>
                            </form>

                            <div className="mt-2 overflow-hidden rounded-lg border border-gray-800">
                                <div className="grid grid-cols-[minmax(0,1fr)_110px_120px_90px] gap-3 bg-[#111111] px-4 py-2 text-xs uppercase tracking-wide text-gray-500">
                                    <span>Brand</span>
                                    <span>Logo</span>
                                    <span>Status</span>
                                    <span>Action</span>
                                </div>

                                {brandCoverage.length === 0 ? (
                                    <div className="px-4 py-4 text-sm text-gray-400">No brand entries available yet.</div>
                                ) : (
                                    <div className="divide-y divide-gray-800">
                                        {brandCoverage.map((entry) => (
                                            <div
                                                key={`${entry.brandKey}-${entry.source}`}
                                                className="grid grid-cols-[minmax(0,1fr)_110px_120px_90px] items-center gap-3 px-4 py-3"
                                            >
                                                <div>
                                                    <p className="text-sm font-medium text-white">{entry.brandName}</p>
                                                    <p className="text-xs text-gray-500">{entry.brandKey}</p>
                                                </div>

                                                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-[#101010]">
                                                    {entry.logoUrl ? (
                                                        <img
                                                            src={entry.logoUrl}
                                                            alt={`${entry.brandName} logo`}
                                                            className="h-8 w-8 object-contain"
                                                        />
                                                    ) : (
                                                        <span className="text-xs font-semibold text-gray-400">
                                                            {entry.brandName.charAt(0).toUpperCase()}
                                                        </span>
                                                    )}
                                                </div>

                                                <span
                                                    className={`inline-flex w-fit rounded-full px-2 py-1 text-xs font-medium ${
                                                        entry.source === "override"
                                                            ? "bg-emerald-500/20 text-emerald-300"
                                                            : entry.source === "default"
                                                                ? "bg-blue-500/20 text-blue-300"
                                                                : "bg-amber-500/20 text-amber-300"
                                                    }`}
                                                >
                                                    {entry.source === "override"
                                                        ? "Override"
                                                        : entry.source === "default"
                                                            ? "Default"
                                                            : "Missing"}
                                                </span>

                                                {entry.source === "override" ? (
                                                    <button
                                                        type="button"
                                                        onClick={() => void handleDeleteLogo(entry.brandKey)}
                                                        className="inline-flex items-center justify-center rounded-md border border-red-500/40 bg-red-500/10 p-1.5 text-red-300 transition-colors hover:bg-red-500/20"
                                                        aria-label={`Remove override for ${entry.brandName}`}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                ) : (
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setBrandNameInput(entry.brandName);
                                                            setLogoUrlInput(entry.logoUrl || "");
                                                            setLogoFileInput(null);
                                                            if (logoFileRef.current) {
                                                                logoFileRef.current.value = "";
                                                            }
                                                        }}
                                                        className="rounded-md border border-gray-700 px-2 py-1 text-xs text-gray-300 transition-colors hover:bg-gray-800"
                                                    >
                                                        Set
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </section>
                    ) : (
                        <section className="space-y-4">
                            <div className="mb-2 flex items-start justify-between gap-3">
                                <div>
                                    <h2 className="text-lg font-semibold text-white">Contact Section Content</h2>
                                    <p className="text-sm text-gray-400">
                                        Edit contact page details shown to customers.
                                    </p>
                                </div>
                                <div className="inline-flex items-center gap-2 text-xs text-amber-300">
                                    <AlertTriangle className="h-4 w-4" />
                                    Changes are live immediately after save.
                                </div>
                            </div>

                            <form onSubmit={handleContactSave} className="space-y-4">
                                <div className="grid gap-3 md:grid-cols-2">
                                    <TextInput
                                        label="Phone"
                                        value={contactForm.phone}
                                        onChange={(value) => handleContactFieldChange("phone", value)}
                                        required
                                    />
                                    <TextInput
                                        label="Alternative Phone"
                                        value={contactForm.altPhone}
                                        onChange={(value) => handleContactFieldChange("altPhone", value)}
                                    />
                                    <TextInput
                                        label="Email"
                                        value={contactForm.email}
                                        onChange={(value) => handleContactFieldChange("email", value)}
                                        required
                                    />
                                    <TextInput
                                        label="Support Email"
                                        value={contactForm.supportEmail}
                                        onChange={(value) => handleContactFieldChange("supportEmail", value)}
                                    />
                                    <TextInput
                                        label="WhatsApp"
                                        value={contactForm.whatsapp}
                                        onChange={(value) => handleContactFieldChange("whatsapp", value)}
                                        required
                                    />
                                    <TextInput
                                        label="City"
                                        value={contactForm.city}
                                        onChange={(value) => handleContactFieldChange("city", value)}
                                        required
                                    />
                                    <TextInput
                                        label="Regular Hours"
                                        value={contactForm.hours}
                                        onChange={(value) => handleContactFieldChange("hours", value)}
                                        required
                                    />
                                    <TextInput
                                        label="Sunday Hours"
                                        value={contactForm.sundayHours}
                                        onChange={(value) => handleContactFieldChange("sundayHours", value)}
                                        required
                                    />
                                    <TextInput
                                        label="JKIA Desk Hours"
                                        value={contactForm.jkiaDeskHours}
                                        onChange={(value) => handleContactFieldChange("jkiaDeskHours", value)}
                                    />
                                    <TextInput
                                        label="Hero Title"
                                        value={contactForm.heroTitle}
                                        onChange={(value) => handleContactFieldChange("heroTitle", value)}
                                        required
                                    />
                                </div>

                                <TextInput
                                    label="Address"
                                    value={contactForm.address}
                                    onChange={(value) => handleContactFieldChange("address", value)}
                                    required
                                />

                                <TextAreaInput
                                    label="Hero Description"
                                    value={contactForm.heroDescription}
                                    onChange={(value) => handleContactFieldChange("heroDescription", value)}
                                    required
                                />

                                <button
                                    type="submit"
                                    disabled={isSavingContact}
                                    className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-500 disabled:opacity-60"
                                >
                                    <Save className="h-4 w-4" />
                                    {isSavingContact ? "Saving..." : "Save Contact Content"}
                                </button>
                            </form>
                        </section>
                    )}
                </div>
            </div>
        </div>
    );
}

type TopNavButtonProps = {
    label: string;
    active: boolean;
    onClick: () => void;
};

function TopNavButton({ label, active, onClick }: TopNavButtonProps) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`rounded-lg px-3 py-2 text-sm transition-colors ${
                active
                    ? "bg-white text-black"
                    : "bg-[#101010] text-gray-300 hover:bg-gray-800"
            }`}
        >
            {label}
        </button>
    );
}

type InputProps = {
    label: string;
    value: string;
    onChange: (value: string) => void;
    required?: boolean;
};

function TextInput({ label, value, onChange, required = false }: InputProps) {
    return (
        <label className="space-y-1.5">
            <span className="text-sm text-gray-300">{label}</span>
            <input
                value={value}
                onChange={(event) => onChange(event.target.value)}
                required={required}
                className="w-full rounded-lg border border-gray-700 bg-[#101010] px-3 py-2 text-sm text-white outline-none focus:border-emerald-500"
            />
        </label>
    );
}

function TextAreaInput({ label, value, onChange, required = false }: InputProps) {
    return (
        <label className="space-y-1.5">
            <span className="text-sm text-gray-300">{label}</span>
            <textarea
                value={value}
                onChange={(event) => onChange(event.target.value)}
                required={required}
                rows={4}
                className="w-full rounded-lg border border-gray-700 bg-[#101010] px-3 py-2 text-sm text-white outline-none focus:border-emerald-500"
            />
        </label>
    );
}
