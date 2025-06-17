import { Field, ErrorMessage } from 'formik';
import { Form, InputGroup, Button } from 'react-bootstrap';
import { useState } from 'react';
import { EyeFill, EyeSlashFill } from 'react-bootstrap-icons';

const FormField = ({ label, name, type = 'text', placeholder, icon }) => {
    const [showPassword, setShowPassword] = useState(false);
    const inputType = type === 'password' ? (showPassword ? 'text' : 'password') : type;

    return (
        <Form.Group className="mb-4">
            {label && <Form.Label>{label}</Form.Label>}
            <InputGroup>
                {icon && <InputGroup.Text>{icon}</InputGroup.Text>}

                <Field
                    name={name}
                    as={Form.Control}
                    type={inputType}
                    placeholder={placeholder}
                />

                {type === 'password' && (
                    <Button
                        variant="outline-secondary"
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                    >
                        {showPassword ? <EyeSlashFill /> : <EyeFill />}
                    </Button>
                )}
            </InputGroup>
            <ErrorMessage name={name} component="div" className="text-danger small mt-1" />
        </Form.Group>
    );
};

export default FormField;