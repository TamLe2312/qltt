import React from "react";
import { useForm, Controller, SubmitHandler } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import Card from "../../components/ui/Card";
import Input from "../../components/ui/Input";

/** Interface form data */
interface BranchFormData {
    name: string;
    email: string;
    phone: string;
    zipcode: string;
    street: string;
    ward: string;
    district: string;
    city: string;
    country: string;
}

/** Yup schema (messages in English) */
const schema = Yup.object({
    name: Yup.string().required("Branch name is required"),
    email: Yup.string().email("Invalid email").required("Email is required"),
    phone: Yup.string().required("Phone number is required"),
    zipcode: Yup.string().required("Zipcode is required"),
    street: Yup.string().required("Street is required"),
    ward: Yup.string().required("Ward is required"),
    district: Yup.string().required("District is required"),
    city: Yup.string().required("City is required"),
    country: Yup.string().required("Country is required"),
}).required();

const BranchCreate: React.FC = () => {
    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm<BranchFormData>({
        resolver: yupResolver(schema),
        mode: "onBlur",         // validate lần đầu khi blur
        reValidateMode: "onBlur", // <--- thay đổi: re-validate khi blur (trước bạn để "onSubmit")
        defaultValues: {
            name: "",
            email: "",
            phone: "",
            zipcode: "",
            street: "",
            ward: "",
            district: "",
            city: "",
            country: "",
        },
    });

    const onSubmit: SubmitHandler<BranchFormData> = (data) => {
        console.log("Submit data:", data);
        // call API...
    };

    return (
        <div className="space-y-6">
            <Card title="Create New Branch">
                <form onSubmit={handleSubmit(onSubmit)}>
                    {/* row 1 */}
                    <div className="flex flex-wrap -mx-2">
                        <div className="w-full sm:w-1/2 px-2">
                            <Controller
                                name="name"
                                control={control}
                                render={({ field }) => (
                                    <Input
                                        label="Branch Name"
                                        placeholder="Enter branch name"
                                        error={errors.name?.message}
                                        {...field}
                                        ref={field.ref} // explicitly pass the ref so forwardRef attaches it
                                    />
                                )}
                            />
                        </div>

                        <div className="w-full sm:w-1/2 px-2">
                            <Controller
                                name="email"
                                control={control}
                                render={({ field }) => (
                                    <Input
                                        label="Email"
                                        placeholder="Enter email"
                                        error={errors.email?.message}
                                        {...field}
                                        ref={field.ref}
                                    />
                                )}
                            />
                        </div>
                    </div>

                    {/* row 2 */}
                    <div className="flex flex-wrap -mx-2">
                        <div className="w-full sm:w-1/2 px-2">
                            <Controller
                                name="phone"
                                control={control}
                                render={({ field }) => (
                                    <Input
                                        label="Phone"
                                        placeholder="Enter phone number"
                                        error={errors.phone?.message}
                                        {...field}
                                        ref={field.ref}
                                    />
                                )}
                            />
                        </div>

                        <div className="w-full sm:w-1/2 px-2">
                            <Controller
                                name="zipcode"
                                control={control}
                                render={({ field }) => (
                                    <Input
                                        label="Zipcode"
                                        placeholder="Enter zipcode"
                                        error={errors.zipcode?.message}
                                        {...field}
                                        ref={field.ref}
                                    />
                                )}
                            />
                        </div>
                    </div>

                    {/* row 3 */}
                    <div className="flex flex-wrap -mx-2">
                        <div className="w-full sm:w-1/2 px-2">
                            <Controller
                                name="street"
                                control={control}
                                render={({ field }) => (
                                    <Input
                                        label="Street"
                                        placeholder="Enter street"
                                        error={errors.street?.message}
                                        {...field}
                                        ref={field.ref}
                                    />
                                )}
                            />
                        </div>

                        <div className="w-full sm:w-1/2 px-2">
                            <Controller
                                name="ward"
                                control={control}
                                render={({ field }) => (
                                    <Input
                                        label="Ward"
                                        placeholder="Enter ward"
                                        error={errors.ward?.message}
                                        {...field}
                                        ref={field.ref}
                                    />
                                )}
                            />
                        </div>
                    </div>

                    {/* row 4 */}
                    <div className="flex flex-wrap -mx-2">
                        <div className="w-full sm:w-1/2 px-2">
                            <Controller
                                name="district"
                                control={control}
                                render={({ field }) => (
                                    <Input
                                        label="District"
                                        placeholder="Enter district"
                                        error={errors.district?.message}
                                        {...field}
                                        ref={field.ref}
                                    />
                                )}
                            />
                        </div>

                        <div className="w-full sm:w-1/2 px-2">
                            <Controller
                                name="city"
                                control={control}
                                render={({ field }) => (
                                    <Input
                                        label="City"
                                        placeholder="Enter city"
                                        error={errors.city?.message}
                                        {...field}
                                        ref={field.ref}
                                    />
                                )}
                            />
                        </div>
                    </div>

                    {/* row 5 */}
                    <div className="flex flex-wrap -mx-2">
                        <div className="w-full sm:w-1/2 px-2">
                            <Controller
                                name="country"
                                control={control}
                                render={({ field }) => (
                                    <Input
                                        label="Country"
                                        placeholder="Enter country"
                                        error={errors.country?.message}
                                        {...field}
                                        ref={field.ref}
                                    />
                                )}
                            />
                        </div>
                    </div>

                    <div className="mt-4">
                        <button
                            type="submit"
                            className="px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600"
                        >
                            Create Branch
                        </button>
                    </div>
                </form>
            </Card>
        </div>
    );
};

export default BranchCreate;
