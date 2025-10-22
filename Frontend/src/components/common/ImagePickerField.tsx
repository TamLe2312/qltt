import React, { useEffect, useState } from "react";
import { useController, Control } from "react-hook-form";
import { Upload } from "antd";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import type { UploadFile } from "antd/es/upload/interface";

interface ImagePickerFieldProps {
  name: string;
  control?: Control<any>;
  value?: File[];
  onChange?: (files: File[] | undefined) => void;
  multiple?: boolean;
  maxCount?: number;
  minHeight?: number;
  hideErrorMessage?: boolean;
}

const ImagePickerField: React.FC<ImagePickerFieldProps> = ({
  name,
  control,
  value: propValue,
  onChange: propOnChange,
  multiple = false,
  maxCount = 5,
  minHeight = 120,
  hideErrorMessage = false,
}) => {
  // Luôn gọi hook
  const controller = useController({
    name,
    control: control as Control<any>, // cast, fallback nếu undefined
    defaultValue: [],
  });

  const field = control ? controller.field : { value: propValue, onChange: propOnChange, onBlur: () => { } };
  const fieldState = control ? controller.fieldState : { error: undefined };

  const [fileList, setFileList] = useState<UploadFile[]>([]);

  // Đồng bộ fileList với value
  useEffect(() => {
    if (!field.value || field.value.length === 0) {
      setFileList([]);
      return;
    }
    const mapped: UploadFile[] = (field.value as File[]).map((file: File, idx: number) => ({
      uid: String(idx),
      name: file.name,
      status: "done" as const,
      url: URL.createObjectURL(file),
    }));
    setFileList(mapped);
  }, [field.value]);

  // Gọi onChange an toàn
  const callOnChange = (files: File[] | undefined) => {
    field.onChange?.(files);
    propOnChange?.(files);
  };

  const handleUpload = (file: File) => {
    const currentFiles = multiple ? [...(field.value || []), file] : [file];
    if (currentFiles.length > maxCount) currentFiles.splice(maxCount);

    const newList: UploadFile[] = (currentFiles as File[]).map((f: File, idx: number) => ({
      uid: String(idx),
      name: f.name,
      status: "done" as const,
      url: URL.createObjectURL(f),
    }));

    setFileList(newList);
    callOnChange(currentFiles);

    // Trigger validate onBlur
    field.onBlur?.();
  };

  const handleRemove = (file: UploadFile) => {
    const newList = fileList.filter((f) => f.uid !== file.uid);
    const newFiles = newList.map((f) =>
      (field.value as File[]).find((v: File) => v.name === f.name)!
    );
    setFileList(newList);
    callOnChange(newFiles.length ? newFiles : undefined);

    // Trigger validate onBlur
    field.onBlur?.();
  };

  const uploadButton = (
    <div className="flex flex-col items-center justify-center cursor-pointer hover:bg-gray-100 transition-all duration-200 ease-in-out w-24 h-24 border border-dashed border-gray-300 rounded-lg">
      <PlusOutlined className="text-xl text-gray-500" />
      <div className="text-xs text-gray-500 mt-1">Chọn ảnh</div>
    </div>
  );

  return (
    <div className="w-full" style={{ minHeight }}>
      <div className="flex flex-wrap gap-2">
        <Upload
          multiple={multiple}
          listType="picture-card"
          fileList={fileList}
          beforeUpload={(file) => {
            handleUpload(file);
            return false;
          }}
          onRemove={handleRemove}
          showUploadList={false}
          accept="image/*"
        >
          {fileList.length >= maxCount ? null : uploadButton}
        </Upload>

        {fileList.map((file) => (
          <div
            key={file.uid}
            className="relative w-24 h-24 rounded-lg overflow-hidden shadow hover:scale-105 transition-transform duration-200 ease-in-out"
          >
            <img src={file.url} alt={file.name} className="object-cover w-full h-full" />
            <button
              type="button"
              onClick={() => handleRemove(file)}
              className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-70 hover:opacity-100 transition-opacity duration-200"
            >
              ×
            </button>
          </div>
        ))}
      </div>

      {!hideErrorMessage && fieldState.error && (
        <p className="text-red-600 text-sm mt-1">{fieldState.error.message}</p>
      )}
    </div>
  );
};

export default ImagePickerField;
