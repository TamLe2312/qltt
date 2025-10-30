import React from "react";
import Input from "../form/Input";
import Button from "../form/Button";

type SearchInputProps = {
  query: string;
  setQuery: (value: string) => void;
  handleSearch: () => void;
  handleClear: () => void;
  isSearchLoading?: boolean;
  placeholder?: string;
  validate?: (value: string) => string | undefined;
  error?: string;
};

const SearchInput: React.FC<SearchInputProps> = ({
  query,
  setQuery,
  handleSearch,
  handleClear, // <-- Lấy prop mới
  isSearchLoading,
  placeholder = "Tìm kiếm...",
  validate,
  error,
}) => {
  const [localError, setLocalError] = React.useState<string | undefined>();

  const onSearch = () => {
    const validationError = validate ? validate(query) : undefined;
    setLocalError(validationError);
    if (!validationError) {
      handleSearch();
    }
  };

  // NEW: Hàm xử lý clear
  const onClear = () => {
    setLocalError(undefined); // Xóa lỗi local (nếu có)
    handleClear(); // Gọi hàm clear từ component cha
  };

  return (
    <div className="flex flex-col gap-1 w-full">
      <div className="flex gap-2">
        {/* NEW: Thêm div wrapper với class 'relative' */}
        <div className="relative flex-1">
          <Input
            type="text"
            placeholder={placeholder}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") onSearch();
            }}
            error={error || localError}
            // Thêm padding bên phải để chừa chỗ cho nút 'X'
            className="w-full pr-10"
          />

          {/* NEW: Nút 'X' clear */}
          {query && ( // Chỉ hiển thị khi có text
            <button
              type="button"
              onClick={onClear}
              className="absolute inset-y-0 right-0 flex items-center justify-center w-10 h-10 text-gray-500 hover:text-gray-700"
              aria-label="Xóa tìm kiếm"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div>

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
