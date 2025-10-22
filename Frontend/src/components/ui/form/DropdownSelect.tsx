import React from "react";

interface DropdownSelectProps<T> {
    data?: T[]; // cho phép undefined
    value?: string | number | null;
    onChange?: (value: string | number | null, item?: T) => void;
    placeholder?: string;
    className?: string;
    valueKey?: keyof T;
    labelKey?: keyof T;
    disabled?: boolean;
    loading?: boolean;
    defaultOptionLabel?: string;
}

const DropdownSelect = <T extends Record<string, any>>({
    data = [],
    value,
    onChange,
    placeholder = "Select...",
    className = "",
    labelKey = "name" as keyof T,
    valueKey = "id" as keyof T,
    disabled = false,
    loading = false,
    defaultOptionLabel,
}: DropdownSelectProps<T>) => {
    const isArray = Array.isArray(data);
    const [selected, setSelected] = React.useState<T | null>(
        isArray ? data.find((d) => String(d[valueKey]) === String(value)) || null : null
    );
    const [open, setOpen] = React.useState(false);
    const [dropUp, setDropUp] = React.useState(false);
    const containerRef = React.useRef<HTMLDivElement>(null);

    const handleSelect = (item: T | null) => {
        setSelected(item);
        onChange?.(item ? item[valueKey] : null, item ?? undefined);
        setOpen(false);
    };

    // Đồng bộ khi data hoặc value thay đổi
    React.useEffect(() => {
        if (isArray && data.length > 0 && value != null) {
            const found = data.find((d) => String(d[valueKey]) === String(value)) || null;
            setSelected(found);
        } else {
            setSelected(null);
        }
    }, [data, value, valueKey]);

    // Đóng dropdown khi click ra ngoài
    React.useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Toggle dropdown
    const toggleOpen = () => {
        if (disabled || loading) return;
        if (!open && containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect();
            const spaceBelow = window.innerHeight - rect.bottom;
            const dropdownHeight = Math.min(240, data.length * 40);
            setDropUp(spaceBelow < dropdownHeight && rect.top > dropdownHeight);
        }
        setOpen((prev) => !prev);
    };

    return (
        <div className={`relative w-full ${className}`} ref={containerRef}>
            <div
                className={`w-full rounded-md px-3 py-2 bg-white flex justify-between items-center ${disabled || loading ? "cursor-not-allowed" : "cursor-pointer"
                    } focus:ring-2 ${loading
                        ? "border border-blue-300 focus:ring-blue-400 text-blue-600 bg-blue-50"
                        : "border border-gray-300 focus:ring-primary-500"
                    }`}
                onClick={toggleOpen}
                aria-disabled={disabled || loading}
            >
                <div className="flex items-center gap-2 min-w-0">
                    {loading && (
                        <svg
                            className="w-4 h-4 animate-spin text-blue-500"
                            viewBox="0 0 24 24"
                            fill="none"
                        >
                            <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                            />
                            <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V2C5.373 2 2 5.373 2 12h2z"
                            />
                        </svg>
                    )}
                    <span className={`truncate ${loading ? "text-blue-600" : ""}`}>
                        {loading
                            ? "Loading..."
                            : selected
                                ? String(selected[labelKey])
                                : defaultOptionLabel ?? placeholder}
                    </span>
                </div>
                <svg
                    className={`w-4 h-4 ${loading ? "text-blue-500" : "text-gray-500"
                        } transform transition-transform duration-200 ${open ? "rotate-180" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </div>

            {open && (
                <div
                    className={`absolute w-full py-2 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto z-10`}
                    style={{
                        top: dropUp ? "auto" : "100%",
                        bottom: dropUp ? "100%" : "auto",
                        marginTop: dropUp ? 0 : "0.25rem",
                        marginBottom: dropUp ? "0.5rem" : 0,
                    }}
                >
                    {loading ? (
                        <div className="px-3 py-2 text-sm text-blue-600 flex items-center gap-2">
                            <svg
                                className="w-4 h-4 animate-spin text-blue-500"
                                viewBox="0 0 24 24"
                                fill="none"
                            >
                                <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                />
                                <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V2C5.373 2 2 5.373 2 12h2z"
                                />
                            </svg>
                            Loading...
                        </div>
                    ) : (
                        <>
                            <div
                                className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm text-gray-500"
                                onClick={() => handleSelect(null)}
                            >
                                {defaultOptionLabel ?? placeholder}
                            </div>

                            {isArray &&
                                data.map((item, index) => (
                                    <div
                                        key={index}
                                        className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                                        onClick={() => handleSelect(item)}
                                    >
                                        {String(item[labelKey])}
                                    </div>
                                ))}
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

export default React.memo(DropdownSelect);
