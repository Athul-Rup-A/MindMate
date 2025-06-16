import { Field, ErrorMessage } from 'formik';

const FormField = ({ label, name, type = 'text', placeholder }) => (
    <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">{label}</label>
        <Field
            name={name}
            type={type}
            placeholder={placeholder}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring focus:ring-indigo-200 p-2"
        />
        <ErrorMessage name={name} component="div" className="text-red-500 text-sm mt-1" />
    </div>
);
export default FormField;