import React from "react";
import Input from "../form/Input";
import Button from "../form/Button";

type SearchInputProps = {
    searchQuery: string;
    setSearchQuery: (value: string) => void;
    handleSearch: () => void;
    isSearchLoading?: boolean;
    placeholder?: string;
    validate?: (value: string) => string | undefined; // trả về thông báo lỗi nếu không hợp lệ
    error?: string; // lỗi từ bên ngoài (form validation)
};

const SearchInput: React.FC<SearchInputProps> = ({
    searchQuery,
    setSearchQuery,
    handleSearch,
    isSearchLoading = false,
    placeholder = "Tìm kiếm...",
    validate,
    error,
}) => {
    const [localError, setLocalError] = React.useState<string | undefined>();

    const onSearch = () => {
        const validationError = validate ? validate(searchQuery) : undefined;
        setLocalError(validationError);

        if (!validationError) {
            handleSearch();
        }
    };

    return (
        <div className="flex flex-col gap-1 w-full">
            <div className="flex gap-2">
                <Input
                    type="text"
                    placeholder={placeholder}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") onSearch();
                    }}
                    error={error || localError}
                    className="flex-1"
                />
                <Button
                    variant="primary"
                    onClick={onSearch}
                    isLoading={isSearchLoading}
                    className="flex-none h-10"
                >
                    Tìm kiếm
                </Button>
            </div>
        </div>
    );
};

export default SearchInput;