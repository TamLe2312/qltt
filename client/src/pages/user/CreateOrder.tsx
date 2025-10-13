import Input from "../../components/ui/Input";

const CreateOrder: React.FC = () => {
    return (
        <div>
            <div className="p-4">
                <div className="flex items-center justify-center">
                    <div className="px-2 flex-1">
                        <Input label="Branch" value={6} />
                    </div>
                    <div className="px-2 flex-1">
                        <Input label="User" />
                    </div>
                </div>
            </div>
        </div>
    )

}

export default CreateOrder;