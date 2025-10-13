import React, { useState } from "react";
import { Card } from "antd";
import ImagePickerField from "../../components/ui/ImagePickerField";
const DemoPage: React.FC = () => {
    const [images, setImages] = useState<File[] | undefined>(undefined);
    console.log(images);

    return (
        <div className="p-6 flex justify-center">
            <Card title="Chọn ảnh" className="w-96">
                <ImagePickerField
                    multiple={true}
                    maxCount={5}
                    minHeight={120}
                    value={images}
                    onChange={(files) => setImages(files)}
                />
            </Card>
        </div>
    );
};

export default DemoPage;
