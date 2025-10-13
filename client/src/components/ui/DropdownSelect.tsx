import React from "react";

interface DropdownSelectProps<T> {
    data: T[] | [];
    value?: string | number | null; // giá trị đã chọn
    onChange?: (value: string | number | null, item?: T) => void;
    placeholder?: string;
    className?: string;
    valueKey?: keyof T; // key dùng làm giá trị
    labelKey?: keyof T; // key dùng làm hiển thị text
}

const DropdownSelect = <T extends Record<string, any>>({
    data,
    value,
    onChange,
    placeholder = 'Select...',
    className = '',
    labelKey = 'name' as keyof T,
    valueKey = 'id' as keyof T,
}: DropdownSelectProps<T>) => {
    const [selected, setSelected] = React.useState<T | null>(
        data.find(d => String(d[valueKey]) === String(value)) || null
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
        if (data.length > 0 && value != null) {
            const found = data.find(d => String(d[valueKey]) == String(value)) || null
            setSelected(found);
        }
    }, [data, value, valueKey]);

    // Close dropdown khi click ra ngoài
    React.useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Toggle dropdown và tính dropUp trước khi mở
    const toggleOpen = () => {
        if (!open && containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect();
            const spaceBelow = window.innerHeight - rect.bottom;
            const dropdownHeight = Math.min(240, data.length * 40);
            setDropUp(spaceBelow < dropdownHeight && rect.top > dropdownHeight);
        }
        setOpen(prev => !prev);
    };

    return (
        <div className={`relative w-full ${className}`} ref={containerRef}>
            <div
                className="w-full border border-gray-300 rounded-md px-3 py-2 bg-white flex justify-between items-center cursor-pointer focus:ring-2 focus:ring-primary-500"
                onClick={toggleOpen}
            >
                <span>
                    {selected ? String(selected[labelKey]) : placeholder}
                </span>
                <svg
                    className={`w-4 h-4 text-gray-500 transform transition-transform duration-200 ${open ? 'rotate-180' : ''
                        }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </div>

            {open && (
                <div
                    className={`absolute w-full py-3 mb-4 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto z-10`}
                    style={{
                        top: dropUp ? 'auto' : '100%',
                        bottom: dropUp ? '100%' : 'auto',
                        marginTop: dropUp ? 0 : '0.25rem',
                        marginBottom: dropUp ? '0.5rem' : 0,
                    }}
                >
                    <div
                        className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm text-gray-500"
                        onClick={() => handleSelect(null)}
                    >
                        {placeholder}
                    </div>

                    {data.map((item, index) => (
                        <div
                            key={index}
                            className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                            onClick={() => handleSelect(item)}
                        >
                            {String(item[labelKey])}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default DropdownSelect;