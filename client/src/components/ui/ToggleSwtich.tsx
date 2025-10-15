// src/components/ToggleSwitch.tsx

import React from "react";

// Định nghĩa các props cho component bằng TypeScript
interface ToggleSwitchProps {
  label?: string; // Nhãn hiển thị bên cạnh
  checked: boolean; // Trạng thái true/false
  onChange: (checked: boolean) => void; // Hàm gọi khi thay đổi
  disabled?: boolean; // Vô hiệu hóa công tắc
  className?: string; // Thêm class tùy chỉnh từ bên ngoài
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({
  label,
  checked,
  onChange,
  disabled = false,
  className = "",
}) => {
  const handleToggle = () => {
    if (!disabled) {
      onChange(!checked);
    }
  };

  return (
    <div className={`flex items-center ${className}`}>
      {/* Label được bọc ngoài để click vào chữ cũng có thể thay đổi state */}
      <label className="flex items-center cursor-pointer">
        {/* Input checkbox gốc được ẩn đi để đảm bảo accessibility */}
        <input
          type="checkbox"
          className="sr-only" // Ẩn khỏi màn hình nhưng vẫn có thể truy cập bằng screen reader
          checked={checked}
          onChange={handleToggle}
          disabled={disabled}
        />

        {/* Phần giao diện của công tắc */}
        <div className="relative">
          {/* Nền của công tắc */}
          <div
            className={`block w-12 h-6 rounded-full transition-colors duration-200 ease-in-out ${
              checked ? "bg-indigo-600" : "bg-gray-300"
            } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
          ></div>
          {/* Nút tròn bên trong */}
          <div
            className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform duration-200 ease-in-out ${
              checked ? "transform translate-x-6" : ""
            } shadow`}
          ></div>
        </div>

        {/* Nhãn văn bản nếu có */}
        {label && (
          <span
            className={`ml-3 text-sm font-medium text-gray-700 ${
              disabled ? "text-gray-400" : ""
            }`}
          >
            {label}
          </span>
        )}
      </label>
    </div>
  );
};

export default ToggleSwitch;
