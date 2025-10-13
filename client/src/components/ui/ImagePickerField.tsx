import React, { useEffect, useState } from "react";
import { Upload, message } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import type { UploadFile } from "antd/es/upload/interface";

interface ImagePickerFieldProps {
  multiple?: boolean;
  value?: File[] | undefined;
  onChange?: (files: File[] | undefined) => void;
  maxSizeMB?: number;
  maxCount?: number;
  minHeight?: number;
}

const ImagePickerField: React.FC<ImagePickerFieldProps> = ({
  multiple = false,
  value = undefined,
  onChange,
  maxSizeMB = 2,
  maxCount = 5,
  minHeight = 120,
}) => {
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  // Đồng bộ fileList khi value thay đổi
  useEffect(() => {
    if (!value || value.length === 0) {
      setFileList([]);
      return;
    }
    const mapped: UploadFile[] = value.map((file, idx) => ({
      uid: String(idx),
      name: file.name,
      status: "done" as const,
      url: URL.createObjectURL(file),
    }));
    setFileList(mapped);
  }, [value]);

  const beforeUpload = (file: File) => {
    if (!file.type.startsWith("image/")) {
      message.error("Chỉ chọn file ảnh!");
      return Upload.LIST_IGNORE;
    }
    if (file.size / 1024 / 1024 > maxSizeMB) {
      message.error(`Ảnh phải nhỏ hơn ${maxSizeMB}MB`);
      return Upload.LIST_IGNORE;
    }

    const currentFiles = value ? [...value] : [];

    if (currentFiles.length >= maxCount!) {
      message.warning(`Chỉ được chọn tối đa ${maxCount} ảnh`);
      return Upload.LIST_IGNORE;
    }

    let newFiles: File[];
    if (multiple) {
      newFiles = [...currentFiles, file];
      if (newFiles.length > maxCount!) {
        newFiles = newFiles.slice(0, maxCount!);
      }
    } else {
      newFiles = [file];
    }

    const newList: UploadFile[] = newFiles.map((f, idx) => ({
      uid: String(idx),
      name: f.name,
      status: "done" as const,
      url: URL.createObjectURL(f),
    }));

    setFileList(newList);
    onChange?.(newFiles);

    // ✅ log số lượng file hiện tại
    // console.log("Số lượng file hiện tại:", newFiles.length);

    return false; // ngăn upload tự động
  };

  const handleRemove = (file: UploadFile) => {
    const newList = fileList.filter((f) => f.uid !== file.uid);
    const newFiles = newList.map((f) => value!.find((v) => v.name === f.name)!);
    setFileList(newList);
    onChange?.(newFiles.length ? newFiles : undefined);

    // ✅ log số lượng file hiện tại
    console.log("Số lượng file hiện tại:", newFiles.length);
  };

  const uploadButton = (
    <div className="flex flex-col items-center justify-center">
      <PlusOutlined className="text-xl" />
      <div className="text-sm mt-1">{multiple ? "Chọn ảnh" : "Chọn ảnh"}</div>
    </div>
  );

  return (
    <div className="w-full" style={{ minHeight }}>
      <Upload
        multiple={multiple}
        listType="picture-card"
        fileList={fileList}
        beforeUpload={beforeUpload}
        onRemove={handleRemove}
        showUploadList={{ showPreviewIcon: false }}
      >
        {/* Ẩn nút chọn nếu đạt maxCount */}
        {fileList.length >= maxCount! ? null : uploadButton}
      </Upload>
    </div>
  );
};

export default ImagePickerField;
